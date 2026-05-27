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

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex !== -1 ? fileName.substring(dotIndex + 1).toLowerCase() : '';
};

const renderFileIcon = (fileName: string) => {
  const ext = getFileExtension(fileName);

  // SVG for PDF (Red)
  if (ext === 'pdf') {
    return (
      <span className="acp-file-icon acp-file-icon--pdf" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: '#ef4444' }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15h1a1.5 1.5 0 0 0 0-3H9v6" />
          <path d="M12 12v6" />
          <path d="M15 15h3" />
        </svg>
      </span>
    );
  }

  // SVG for Word/DOCX (Blue)
  if (ext === 'docx' || ext === 'doc') {
    return (
      <span className="acp-file-icon acp-file-icon--doc" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: '#3b82f6' }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8 13h4" />
          <path d="M8 17h8" />
        </svg>
      </span>
    );
  }

  // SVG for Text/TXT (Orange)
  if (ext === 'txt') {
    return (
      <span className="acp-file-icon acp-file-icon--txt" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: '#f59e0b' }}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </span>
    );
  }

  // SVG for Images (Green)
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    return (
      <span className="acp-file-icon acp-file-icon--image" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: '#10b981' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </span>
    );
  }

  // SVG for other files (Grey Generic)
  return (
    <span className="acp-file-icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: '#94a3b8' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </span>
  );
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
            {(() => {
              const fileRegex = /\[File:\s*([^\]]+)\]/i;
              const match = message.content.match(fileRegex);

              if (match) {
                const fileName = match[1];
                const textAfter = message.content.replace(fileRegex, '').trim();
                return (
                  <>
                    {/* File Attachment Bubble */}
                    <div
                      className="acp-message__bubble acp-message__bubble--file"
                      style={isUser ? { background: primaryColor } : {}}
                    >
                      <div className="acp-bubble-attachment">
                        {renderFileIcon(fileName)}
                        <span className="acp-bubble-attachment__name" title={fileName}>
                          {fileName}
                        </span>
                      </div>
                    </div>

                    {/* Message Text Bubble */}
                    {textAfter && (
                      <div
                        className="acp-message__bubble"
                        style={isUser ? { background: primaryColor } : {}}
                      >
                        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {textAfter}
                        </div>
                      </div>
                    )}
                  </>
                );
              }

              return (
                <div
                  className="acp-message__bubble"
                  style={isUser ? { background: primaryColor } : {}}
                >
                  {message.content}
                </div>
              );
            })()}

            {/* Suggestion Chip — shows AI-provided label or resolved node name */}
            {message.suggestion && (
              message.suggestion.url ? (
                // Has absolute URL → render as a direct link opening in new tab
                <a
                  className="acp-suggestion-chip acp-suggestion-chip--link"
                  href={message.suggestion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  title={`Mở: ${message.suggestion.url}`}
                >
                  🔗{' '}
                  <strong>{getSuggestionLabel(message.suggestion)}</strong>
                  <span style={{ fontSize: '10px', marginLeft: 4, opacity: 0.7 }}>↗</span>
                </a>
              ) : onSuggestionClick ? (
                // No URL → chip that fires onSuggestionClick for in-app navigation
                <button
                  className="acp-suggestion-chip"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  onClick={() => onSuggestionClick(message.suggestion!)}
                  title={`${message.suggestion.type}: ${message.suggestion.target}`}
                >
                  {getSuggestionIcon(message.suggestion.type)}{' '}
                  <strong>{getSuggestionLabel(message.suggestion)}</strong>
                </button>
              ) : null
            )}

            <span className="acp-message__time">{formatTime(message.timestamp)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
