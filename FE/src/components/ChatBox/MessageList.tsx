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

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="acp-message-list">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          primaryColor={primaryColor}
          uiFlowTree={uiFlowTree}
          onSuggestionClick={onSuggestionClick}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
