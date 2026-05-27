import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { ChatMessage, UIFlowNode, AISuggestion } from '../../types';

interface ChatBoxProps {
  chatbotName: string;
  welcomeMessage: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string | null;
  uiFlowTree?: UIFlowNode[];
  primaryColor?: string;
  mode?: 'float' | 'fullpage';
  onSend: (message: string, file?: File | null) => void;
  onClose?: () => void;
  onClear?: () => void;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chatbotName,
  welcomeMessage,
  messages,
  isLoading,
  error,
  uiFlowTree = [],
  primaryColor = '#6366f1',
  mode = 'float',
  onSend,
  onClose,
  onClear,
  onSuggestionClick,
}) => {
  const showWelcome = messages.length === 0;

  return (
    <div className={`acp-chatbox acp-chatbox--${mode}`}>
      <ChatHeader
        chatbotName={chatbotName}
        primaryColor={primaryColor}
        onClose={mode === 'float' ? onClose : undefined}
        onClear={onClear}
      />

      <div className="acp-chatbox__body">
        {showWelcome && (
          <div className="acp-welcome">
            <div className="acp-welcome__icon" style={{ background: primaryColor }}>
              🤖
            </div>
            <p className="acp-welcome__text">{welcomeMessage}</p>
          </div>
        )}

        <MessageList
          messages={messages}
          uiFlowTree={uiFlowTree}
          primaryColor={primaryColor}
          onSuggestionClick={onSuggestionClick}
        />

        {error && (
          <div className="acp-error-banner">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="acp-chatbox__footer">
        <ChatInput
          onSend={onSend}
          disabled={isLoading}
          primaryColor={primaryColor}
          placeholder={isLoading ? 'AI is thinking...' : 'Type a message...'}
        />
        <div className="acp-powered-by">
          Powered by <strong>AI Platform</strong>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
