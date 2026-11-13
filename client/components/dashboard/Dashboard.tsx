'use client';

import { SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatPanel from './ChatPanel';
import ConversationSidebar from './ConversationSidebar';
import {
  ApiError,
  fetchConversations,
  fetchMessages,
  sendChat,
  sendVoiceQuestion,
  synthesizeSpeech,
  type ChatMessage,
  type Conversation,
} from '@/lib/api';

function errorText(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function voiceAudioUrl(encoded: string, format: string) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const mimeType = format.toLowerCase() === 'wav' ? 'audio/wav' : `audio/${format}`;
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

export default function Dashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [playbackRequest, setPlaybackRequest] = useState<{ url: string; id: number } | null>(null);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const activeConversationRef = useRef<string | null>(null);
  const viewVersionRef = useRef(0);
  const playbackSequenceRef = useRef(0);
  const audioUrlsRef = useRef(audioUrls);

  useEffect(() => {
    audioUrlsRef.current = audioUrls;
  }, [audioUrls]);

  useEffect(
    () => () => {
      Object.values(audioUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const refreshConversations = useCallback(async () => {
    const result = await fetchConversations(getToken);
    setConversations(result);
    return result;
  }, [getToken]);

  const playAudio = (url: string) => {
    setPlaybackRequest({ url, id: ++playbackSequenceRef.current });
  };

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const version = ++viewVersionRef.current;
      activeConversationRef.current = conversationId;
      setActiveConversationId(conversationId);
      setSidebarOpen(false);
      setVoiceModeOpen(false);
      setPlaybackRequest(null);
      setLoadingMessages(true);
      setError(null);
      setMessages([]);
      try {
        const result = await fetchMessages(conversationId, getToken);
        if (viewVersionRef.current === version) setMessages(result);
      } catch (reason) {
        if (viewVersionRef.current === version) setError(errorText(reason));
      } finally {
        if (viewVersionRef.current === version) setLoadingMessages(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    const initialViewVersion = viewVersionRef.current;
    setLoadingConversations(true);
    fetchConversations(getToken)
      .then(async (result) => {
        if (cancelled) return;
        setConversations(result);
        const latest = result[0];
        if (latest && viewVersionRef.current === initialViewVersion) {
          await loadConversation(latest.id);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorText(reason));
      })
      .finally(() => {
        if (!cancelled) setLoadingConversations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, loadConversation]);

  const startNewConversation = () => {
    viewVersionRef.current += 1;
    activeConversationRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setDraft('');
    setError(null);
    setPlaybackRequest(null);
    setVoiceModeOpen(false);
    setLoadingMessages(false);
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const targetConversationId = activeConversationRef.current;
    const version = viewVersionRef.current;
    setSending(true);
    setDraft('');
    setError(null);
    try {
      const result = await sendChat(text, targetConversationId, getToken);
      if (viewVersionRef.current === version) {
        activeConversationRef.current = result.conversation_id;
        setActiveConversationId(result.conversation_id);
        setMessages((current) => [
          ...current,
          { role: 'user', content: text },
          {
            role: 'assistant',
            content: result.response,
            sources: result.sources,
          },
        ]);
      }
      try {
        await refreshConversations();
      } catch (reason) {
        if (viewVersionRef.current === version) {
          setError(`Your answer was received, but conversation history could not be refreshed: ${errorText(reason)}`);
        }
      }
    } catch (reason) {
      if (viewVersionRef.current === version) {
        setDraft(text);
        setError(errorText(reason));
      }
    } finally {
      setSending(false);
    }
  };

  const submitVoice = async (audio: Blob, mode: 'text' | 'voice') => {
    const targetConversationId = activeConversationRef.current;
    const version = viewVersionRef.current;
    setSending(true);
    setError(null);
    try {
      const result = await sendVoiceQuestion(audio, targetConversationId, mode, getToken);

      if (viewVersionRef.current === version) {
        activeConversationRef.current = result.conversation_id;
        setActiveConversationId(result.conversation_id);
        const assistantId = `voice-answer-${Date.now()}`;
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: result.response,
          sources: result.sources,
        };
        if ('audio_base64' in result) {
          const audioUrl = voiceAudioUrl(result.audio_base64, result.audio_format);
          assistantMessage.audioUrl = audioUrl;
          setAudioUrls((current) => ({ ...current, [assistantId]: audioUrl }));
          if (mode === 'voice') playAudio(audioUrl);
        }
        setMessages((current) => [
          ...current,
          { role: 'user', content: result.transcript },
          assistantMessage,
        ]);
      }

      try {
        await refreshConversations();
      } catch (reason) {
        if (viewVersionRef.current === version) {
          setError(`Your answer was received, but conversation history could not be refreshed: ${errorText(reason)}`);
        }
      }
    } finally {
      setSending(false);
    }
  };

  const listenToAnswer = async (message: ChatMessage, index: number) => {
    const key = message.id ?? `${message.role}-${index}`;
    setError(null);
    const existingUrl = audioUrls[key] ?? message.audioUrl;
    if (existingUrl) {
      playAudio(existingUrl);
      return;
    }

    try {
      const audio = await synthesizeSpeech(message.content, getToken);
      const url = URL.createObjectURL(audio);
      setAudioUrls((current) => {
        const previous = current[key];
        if (previous) URL.revokeObjectURL(previous);
        return { ...current, [key]: url };
      });
      playAudio(url);
    } catch (reason) {
      setError(errorText(reason));
    }
  };

  if (!isLoaded) {
    return (
      <main className="dashboard-loading">
        <span className="dashboard-spinner" aria-hidden="true" />
        Connecting to your account…
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="dashboard-loading">
        <p>Sign in to access your conversations.</p>
        <SignInButton mode="modal">
          <button type="button" className="btn pri">Sign in</button>
        </SignInButton>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        loading={loadingConversations}
        open={sidebarOpen}
        onNew={startNewConversation}
        onSelect={loadConversation}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-icon-button dashboard-menu-button"
            aria-label="Open conversation menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <a className="dashboard-mobile-logo logo" href="/" aria-label="NyayaVoice home">
            <i className="hi" aria-hidden="true">न्</i>NyayaVoice
          </a>
          <a className="dashboard-home-link" href="/">Back to home</a>
          <UserButton />
        </header>
        <ChatPanel
          messages={messages}
          loading={loadingMessages}
          sending={sending}
          draft={draft}
          error={error}
          audioUrls={audioUrls}
          playbackRequest={playbackRequest}
          voiceModeOpen={voiceModeOpen}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onVoiceSubmit={submitVoice}
          onListen={listenToAnswer}
          onPlayAudio={playAudio}
          onOpenVoiceMode={() => setVoiceModeOpen(true)}
          onCloseVoiceMode={() => setVoiceModeOpen(false)}
        />
      </div>
    </main>
  );
}
