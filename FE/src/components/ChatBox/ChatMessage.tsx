import React from 'react';
import { ChatMessage as ChatMessageType, AISuggestion, UIFlowNode } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  primaryColor: string;
  uiFlowTree?: UIFlowNode[];
  onSuggestionClick?: (suggestion: AISuggestion) => void;
}

/** Resolve a node display name from the UI flow tree (v2: name, v1: label) */
const resolveNodeName = (nodes: UIFlowNode[], nodeId: string): string => {
  for (const node of nodes) {
    if (node.id === nodeId) return node.name || node.label || nodeId;
    if (node.children && node.children.length > 0) {
      const found = resolveNodeName(node.children, nodeId);
      if (found !== nodeId) return found;
    }
  }
  return nodeId;
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  primaryColor,
  uiFlowTree = [],
  onSuggestionClick,
}) => {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /**
   * Determine the label to show on the suggestion chip.
   * Priority: AI-returned label → node name from tree → node id
   */
  const getSuggestionLabel = (suggestion: AISuggestion): string => {
    if (suggestion.label) return suggestion.label;
    if (uiFlowTree.length > 0) return resolveNodeName(uiFlowTree, suggestion.target);
    return suggestion.target;
  };

  const getSuggestionIcon = (type: string) => (type === 'navigate' ? '🗺️' : '⚡');

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

            {/* Suggestion Chip — shows AI-provided label or resolved node name */}
            {message.suggestion && onSuggestionClick && (
              <button
                className="acp-suggestion-chip"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => onSuggestionClick(message.suggestion!)}
                title={`${message.suggestion.type}: ${message.suggestion.target}`}
              >
                {getSuggestionIcon(message.suggestion.type)}{' '}
                <strong>{getSuggestionLabel(message.suggestion)}</strong>
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
