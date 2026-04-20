import React, { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, AISuggestion, UIFlowNode } from '../../types';
import ChatMessage from './ChatMessage';

interface MessageListProps {
  messages: ChatMessageType[];
  uiFlowTree?: UIFlowNode[];
  onSuggestionClick?: (suggestion: AISuggestion) => void;
  primaryColor?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  uiFlowTree = [],
  onSuggestionClick,
  primaryColor = '#6366f1',
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findNodeLabel = (nodeId: string): string => {
    const findInTree = (nodes: UIFlowNode[]): string | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return node.label;
        if (node.children) {
          const found = findInTree(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(uiFlowTree) || nodeId;
  };

  return (
    <div className="acp-message-list">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          primaryColor={primaryColor}
          nodeLabel={msg.suggestion ? findNodeLabel(msg.suggestion.target) : undefined}
          onSuggestionClick={onSuggestionClick}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
