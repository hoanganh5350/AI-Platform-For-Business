import React from 'react';
import { ChatMessage as ChatMessageType, AISuggestion } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  primaryColor: string;
  nodeLabel?: string;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  primaryColor,
  nodeLabel,
  onSuggestionClick,
}) => {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`acp-message ${isUser ? 'acp-message--user' : 'acp-message--assistant'}`}>
      {!isUser && (
        <div className="acp-message__avatar" style={{ background: primaryColor }}>
          🤖
        </div>
      )}

      <div className="acp-message__body">
        {isLoading ? (
          <div className="acp-message__bubble acp-message__bubble--loading">
            <span className="acp-dot" />
            <span className="acp-dot" />
            <span className="acp-dot" />
          </div>
        ) : (
          <>
            <div
              className="acp-message__bubble"
              style={isUser ? { background: primaryColor } : {}}
            >
              {message.content}
            </div>

            {/* Suggestion Chip */}
            {message.suggestion && onSuggestionClick && (
              <button
                className="acp-suggestion-chip"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => onSuggestionClick(message.suggestion!)}
              >
                {message.suggestion.type === 'navigate' ? '🗺️ Go to' : '⚡ Action'}:{' '}
                <strong>{nodeLabel || message.suggestion.target}</strong>
              </button>
            )}

            <span className="acp-message__time">{formatTime(message.timestamp)}</span>
          </>
        )}
      </div>

      {isUser && (
        <div className="acp-message__avatar acp-message__avatar--user">👤</div>
      )}
    </div>
  );
};

export default ChatMessage;
