export type Source = {
  title: string | null;
  url: string;
  authority: string | null;
  verification_status: string;
  chunk_refs: number[];
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  sources?: Source[];
  audioUrl?: string;
};

export type ChatResponse = {
  conversation_id: string;
  response: string;
  speech_response: string | null;
  sources: Source[];
};

export type VoiceAskResponse = ChatResponse & {
  transcript: string;
  detected_language_code: string;
};

export type VoiceConversationResponse = VoiceAskResponse & {
  audio_format: string;
  audio_base64: string;
};

export type TokenProvider = () => Promise<string | null>;

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

async function request(
  path: string,
  getToken: TokenProvider,
  init: RequestInit = {},
): Promise<Response> {
  if (!apiBaseUrl) {
    throw new ApiError('Set NEXT_PUBLIC_API_URL to connect to the NyayaVoice API.');
  }

  const token = await getToken();
  if (!token) {
    throw new ApiError('Your sign-in session has expired. Please sign in again.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Could not reach the NyayaVoice API. Check your connection and try again.');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === 'object' &&
        'detail' in body &&
        typeof body.detail === 'string'
      ) {
        message = body.detail;
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new ApiError(message, response.status);
  }

  return response;
}

async function requestJson<T>(
  path: string,
  getToken: TokenProvider,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const response = await request(path, getToken, { ...init, headers });
  return (await response.json()) as T;
}

export async function fetchConversations(getToken: TokenProvider): Promise<Conversation[]> {
  const result = await requestJson<{ conversations: Conversation[] }>(
    '/api/v1/conversations/',
    getToken,
  );
  return result.conversations;
}

export async function fetchMessages(
  conversationId: string,
  getToken: TokenProvider,
): Promise<ChatMessage[]> {
  const result = await requestJson<{ messages: ChatMessage[] }>(
    `/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    getToken,
  );
  return result.messages;
}

export function sendChat(
  message: string,
  conversationId: string | null,
  getToken: TokenProvider,
): Promise<ChatResponse> {
  return requestJson('/api/v1/chat', getToken, {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });
}

export async function sendVoiceQuestion(
  audio: Blob,
  conversationId: string | null,
  mode: 'text' | 'voice',
  getToken: TokenProvider,
): Promise<VoiceAskResponse | VoiceConversationResponse> {
  if (audio.type !== 'audio/wav') {
    throw new ApiError('Voice recordings must be WAV audio. Please record again and retry.');
  }

  const formData = new FormData();
  formData.append('audio', audio, 'recording.wav');
  if (conversationId) {
    formData.append('conversation_id', conversationId);
  }

  const path = mode === 'voice' ? '/api/v1/voice/conversation' : '/api/v1/voice/ask';
  const response = await request(path, getToken, { method: 'POST', body: formData });
  return (await response.json()) as VoiceAskResponse | VoiceConversationResponse;
}

export async function synthesizeSpeech(
  text: string,
  getToken: TokenProvider,
): Promise<Blob> {
  const response = await request('/api/v1/voice/tts', getToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'Shivani', language: 'hi-IN' }),
  });
  return response.blob();
}
