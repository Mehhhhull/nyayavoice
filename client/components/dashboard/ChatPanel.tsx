'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/api';
import VoiceRecorder from './VoiceRecorder';

type Props = {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  draft: string;
  error: string | null;
  audioUrls: Record<string, string>;
  playbackRequest: { url: string; id: number } | null;
  voiceModeOpen: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onVoiceSubmit: (audio: Blob, mode: 'text' | 'voice') => Promise<void>;
  onListen: (message: ChatMessage, index: number) => void;
  onPlayAudio: (url: string) => void;
  onOpenVoiceMode: () => void;
  onCloseVoiceMode: () => void;
};

function sourceHref(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ChatPanel({
  messages,
  loading,
  sending,
  draft,
  error,
  audioUrls,
  playbackRequest,
  voiceModeOpen,
  onDraftChange,
  onSend,
  onVoiceSubmit,
  onListen,
  onPlayAudio,
  onOpenVoiceMode,
  onCloseVoiceMode,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, sending]);

  useEffect(() => {
    if (!voiceModeOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseVoiceMode();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCloseVoiceMode, voiceModeOpen]);

  useEffect(() => {
    if (!playbackRequest) {
      setPlaybackNotice(null);
      return;
    }

    let active = true;
    const audio = new Audio(playbackRequest.url);
    audio.play()
      .then(() => {
        if (active) setPlaybackNotice(null);
      })
      .catch(() => {
        if (active) setPlaybackNotice('Audio autoplay was blocked. Tap Listen or Play again to hear it.');
      });
    return () => {
      active = false;
      audio.pause();
    };
  }, [playbackRequest]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend();
  };

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  const lastAssistantIndex = lastAssistantMessage ? messages.indexOf(lastAssistantMessage) : -1;
  const lastAssistantKey = lastAssistantMessage
    ? lastAssistantMessage.id ?? `${lastAssistantMessage.role}-${lastAssistantIndex}`
    : null;
  const lastAssistantAudioUrl = lastAssistantMessage && lastAssistantKey
    ? audioUrls[lastAssistantKey] ?? lastAssistantMessage.audioUrl
    : undefined;

  return (
    <section className="dashboard-chat" aria-label="NyayaVoice assistant">
      <div className="dashboard-chat-heading">
        <div>
          <p className="eyebrow">Indian consumer-rights assistant</p>
          <h1>What can I help with?</h1>
        </div>
        <p className="dashboard-chat-guidance">
          Clear next steps, grounded in relevant sources.
        </p>
      </div>

      <div className="dashboard-thread" aria-live="polite">
        {loading && (
          <div className="dashboard-thread-state">
            <span className="dashboard-spinner" aria-hidden="true" />
            Loading conversation…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="dashboard-empty">
            <span className="dashboard-empty-mark" aria-hidden="true">न्</span>
            <h2>Start with what happened</h2>
            <p>
              Ask about a refund, defective product, service issue, or consumer complaint in India.
            </p>
            <div className="dashboard-prompts" aria-label="Example questions">
              <button type="button" onClick={() => onDraftChange('Seller refused my refund. What can I do?')}>
                Seller refused my refund. What can I do?
              </button>
              <button type="button" onClick={() => onDraftChange('How do I raise a consumer complaint in India?')}>
                How do I raise a consumer complaint?
              </button>
            </div>
          </div>
        )}
        {messages.map((message, index) => {
          const key = message.id ?? `${message.role}-${index}`;
          const audioUrl = audioUrls[key] ?? message.audioUrl;
          return (
            <article key={key} className={`dashboard-message is-${message.role}`}>
              {message.role === 'user' ? (
                <p className="dashboard-message-content">{message.content}</p>
              ) : (
                <>
                  <div className="dashboard-assistant-label">
                    <span className="dashboard-assistant-mark" aria-hidden="true">न्</span>
                    <span>NyayaVoice</span>
                  </div>
                  <p className="dashboard-message-content">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="dashboard-sources">
                      <p className="dashboard-section-label">Sources</p>
                      <ul>
                        {message.sources.map((source, sourceIndex) => {
                          const href = sourceHref(source.url);
                          return (
                            <li key={`${source.url}-${sourceIndex}`}>
                              {href ? (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {source.title || source.authority || href}
                                  <span aria-hidden="true"> ↗</span>
                                </a>
                              ) : (
                                <span>{source.title || source.authority || source.url}</span>
                              )}
                              {source.authority && <small>{source.authority}</small>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="dashboard-message-actions">
                    <button
                      className="dashboard-listen-button"
                      type="button"
                      onClick={() => (
                        audioUrl ? onPlayAudio(audioUrl) : onListen(message, index)
                      )}
                    >
                      {audioUrl ? 'Play again' : 'Listen'}
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
        {sending && (
          <div className="dashboard-thread-state">
            <span className="dashboard-spinner" aria-hidden="true" />
            Preparing a source-grounded answer…
          </div>
        )}
        {error && <p className="dashboard-error dashboard-chat-error" role="alert">{error}</p>}
        {playbackNotice && <p className="dashboard-playback-notice" role="status">{playbackNotice}</p>}
        <div ref={endRef} />
      </div>

      <div className="dashboard-input-area">
        <form className="dashboard-composer" onSubmit={submit}>
          <label className="sr" htmlFor="dashboard-message">Ask a consumer-rights question</label>
          <textarea
            id="dashboard-message"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Message NyayaVoice"
            rows={1}
            disabled={loading || sending}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="dashboard-composer-toolbar">
            <div className="dashboard-composer-tools">
              <VoiceRecorder
                mode="text"
                disabled={loading || sending}
                onSubmit={onVoiceSubmit}
              />
              <button
                type="button"
                className="dashboard-voice-mode-button"
                disabled={loading || sending}
                onClick={onOpenVoiceMode}
                aria-label="Start a voice-to-voice conversation"
                title="Voice conversation"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 10v4m4-8v12m4-15v18m4-14v10m4-13v16m3-11v6" />
                </svg>
                <span>Voice</span>
              </button>
            </div>
            <button
              type="submit"
              className="dashboard-send-button"
              disabled={loading || sending || !draft.trim()}
              aria-label="Send message"
              title="Send message"
            >
              {sending ? (
                <span className="dashboard-spinner" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 19V5m-6 6 6-6 6 6" />
                </svg>
              )}
            </button>
          </div>
        </form>
        <p className="dashboard-disclaimer">
          NyayaVoice provides general information, not legal advice or a guarantee of outcome.
        </p>
      </div>

      {voiceModeOpen && (
        <div className="dashboard-voice-screen" role="dialog" aria-modal="true" aria-label="Voice conversation">
          <header className="dashboard-voice-screen-header">
            <span className="dashboard-voice-screen-brand">
              <span className="dashboard-assistant-mark" aria-hidden="true">न्</span>
              NyayaVoice
            </span>
            <span className="dashboard-voice-screen-caption">Voice conversation</span>
          </header>
          <div className="dashboard-voice-screen-center">
            <p className="eyebrow">Speak naturally</p>
            <div className="dashboard-live-orb" aria-hidden="true"><span /></div>
            <h2>
              {sending ? 'Preparing your answer…' : 'Speak your question out loud'}
            </h2>
            <p className="dashboard-voice-answer">
              {lastAssistantMessage?.content || 'Ask about a refund, product, service, or other consumer issue.'}
            </p>
            {playbackNotice && lastAssistantAudioUrl && (
              <button
                type="button"
                className="dashboard-playback-retry"
                onClick={() => onPlayAudio(lastAssistantAudioUrl)}
              >
                Play spoken answer
              </button>
            )}
          </div>
          <footer className="dashboard-voice-screen-controls">
            <VoiceRecorder
              mode="voice"
              variant="voice"
              disabled={loading || sending}
              onSubmit={onVoiceSubmit}
            />
            <button
              type="button"
              className="dashboard-voice-close"
              onClick={onCloseVoiceMode}
              aria-label="End voice conversation"
              title="End voice conversation"
            >
              ×
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}
