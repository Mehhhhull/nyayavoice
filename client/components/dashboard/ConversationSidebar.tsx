'use client';

import type { Conversation } from '@/lib/api';

type Props = {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  open: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function formatConversationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Previous conversation'
    : date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  loading,
  open,
  onNew,
  onSelect,
  onClose,
}: Props) {
  return (
    <>
      <button
        className={`dashboard-backdrop${open ? ' is-open' : ''}`}
        aria-label="Close conversation menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside className={`dashboard-sidebar${open ? ' is-open' : ''}`} aria-label="Conversations">
        <div className="dashboard-sidebar-top">
          <a className="logo" href="/" aria-label="NyayaVoice home">
            <i className="hi" aria-hidden="true">न्</i>NyayaVoice
          </a>
          <button className="dashboard-icon-button dashboard-mobile-close" onClick={onClose} aria-label="Close menu">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <button className="dashboard-new-chat" onClick={onNew}>
          <span aria-hidden="true">＋</span> New conversation
        </button>
        <p className="dashboard-section-label">Your conversations</p>
        <div className="dashboard-conversation-list" aria-live="polite">
          {loading && <p className="dashboard-muted">Loading conversations…</p>}
          {!loading && conversations.length === 0 && (
            <p className="dashboard-muted">Your conversations will appear here.</p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`dashboard-conversation${activeConversationId === conversation.id ? ' is-active' : ''}`}
              onClick={() => onSelect(conversation.id)}
              aria-current={activeConversationId === conversation.id ? 'page' : undefined}
              title={conversation.id}
            >
              <span className="dashboard-conversation-title">
                {formatConversationDate(conversation.updated_at)}
              </span>
              <span className="dashboard-conversation-id">{conversation.id.slice(0, 8)}</span>
            </button>
          ))}
        </div>
        <p className="dashboard-sidebar-note">For Indian consumer-rights questions</p>
      </aside>
    </>
  );
}
