import React, { useCallback, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { ChatbotProps, AISuggestion } from '../../types';
import { useChatbot } from '../../hooks/useChatbot';
import { useBusinessConfig } from '../../hooks/useBusinessConfig';
import ChatBox from '../ChatBox/ChatBox';
import FloatChatButton from '../FloatChatButton/FloatChatButton';

const Chatbot: React.FC<ChatbotProps> = ({
  apiUrl,
  businessId,
  mode = 'float',
  chatbotName: chatbotNameProp,
  welcomeMessage: welcomeMessageProp,
  primaryColor = '#6366f1',
  onNavigate,
  onAction,
  className = '',
  defaultOpen = false,
}) => {
  // Load remote config
  const { config, loading: configLoading } = useBusinessConfig(apiUrl, businessId);

  // Chat state & actions
  const {
    messages,
    isOpen,
    isLoading,
    error,
    sendMessage,
    clearChat,
    toggleOpen,
    setOpen,
  } = useChatbot({ apiUrl, businessId, onNavigate, onAction });

  // Open chat on mount if defaultOpen is true
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use props or fallback to config
  const resolvedChatbotName = chatbotNameProp || config?.chatbotName || 'AI Assistant';
  const resolvedWelcomeMessage =
    welcomeMessageProp || config?.welcomeMessage || 'Hello! How can I help you today?';
  const uiFlowTree = config?.uiFlowTree || [];

  const handleSuggestionClick = useCallback(
    (suggestion: AISuggestion) => {
      if (suggestion.type === 'navigate' && onNavigate) {
        // Pass AI-returned label (v2) as second arg
        onNavigate(suggestion.target, suggestion.label);
      } else if (suggestion.type === 'action' && onAction) {
        onAction(suggestion.target, suggestion.label);
      }
    },
    [onNavigate, onAction]
  );

  // Full-page mode
  if (mode === 'fullpage') {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: primaryColor } }}>
        <div className={`acp-root acp-root--fullpage ${className}`}>
          {configLoading ? (
            <div className="acp-loading-screen">
              <div className="acp-spinner" style={{ borderTopColor: primaryColor }} />
              <p>Initializing AI assistant...</p>
            </div>
          ) : (
            <ChatBox
              chatbotName={resolvedChatbotName}
              welcomeMessage={resolvedWelcomeMessage}
              messages={messages}
              isLoading={isLoading}
              error={error}
              uiFlowTree={uiFlowTree}
              primaryColor={primaryColor}
              mode="fullpage"
              onSend={sendMessage}
              onClear={clearChat}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </div>
      </ConfigProvider>
    );
  }

  // Float mode
  return (
    <ConfigProvider theme={{ token: { colorPrimary: primaryColor } }}>
      <div className={`acp-root acp-root--float ${className}`}>
        {/* Chat panel */}
        <div
          className={`acp-float-panel ${isOpen ? 'acp-float-panel--open' : ''}`}
          aria-hidden={!isOpen}
        >
          {!configLoading && (
            <ChatBox
              chatbotName={resolvedChatbotName}
              welcomeMessage={resolvedWelcomeMessage}
              messages={messages}
              isLoading={isLoading}
              error={error}
              uiFlowTree={uiFlowTree}
              primaryColor={primaryColor}
              mode="float"
              onSend={sendMessage}
              onClose={() => setOpen(false)}
              onClear={clearChat}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </div>

        {/* Floating trigger button */}
        <FloatChatButton
          isOpen={isOpen}
          onClick={toggleOpen}
          primaryColor={primaryColor}
        />
      </div>
    </ConfigProvider>
  );
};

export default Chatbot;
