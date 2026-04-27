import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { ChatbotApiClient } from '../api/chatbotClient';
import { AISuggestion } from '../types';

interface UseChatbotOptions {
  apiUrl: string;
  businessId: string;
  onNavigate?: (nodeId: string, label?: string) => void;
  onAction?: (nodeId: string, label?: string) => void;
}

export const useChatbot = ({
  apiUrl,
  businessId,
  onNavigate,
  onAction,
}: UseChatbotOptions) => {
  const clientRef = useRef<ChatbotApiClient>(new ChatbotApiClient(apiUrl));

  const {
    messages,
    sessionId,
    isOpen,
    isLoading,
    error,
    setOpen,
    toggleOpen,
    addUserMessage,
    setLoadingMessage,
    resolveLoadingMessage,
    setError,
    setSessionId,
    clearMessages,
  } = useChatStore();

  const handleSuggestion = useCallback(
    (suggestion?: AISuggestion) => {
      if (!suggestion) return;
      // Pass both nodeId and AI-provided label (v2) to callbacks
      if (suggestion.type === 'navigate' && onNavigate) {
        onNavigate(suggestion.target, suggestion.label);
      } else if (suggestion.type === 'action' && onAction) {
        onAction(suggestion.target, suggestion.label);
      }
    },
    [onNavigate, onAction]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      addUserMessage(content);
      const loadingId = setLoadingMessage();

      try {
        const response = await clientRef.current.sendMessage(businessId, content, sessionId);

        // Update session ID from response
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId);
        }

        resolveLoadingMessage(loadingId, response.message, response.suggestion);

        // Handle suggestion side effects
        if (response.suggestion) {
          handleSuggestion(response.suggestion);
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Something went wrong';
        resolveLoadingMessage(
          loadingId,
          `⚠️ Sorry, I encountered an error: ${errMessage}`,
          undefined
        );
        setError(errMessage);
      }
    },
    [
      businessId,
      sessionId,
      isLoading,
      addUserMessage,
      setLoadingMessage,
      resolveLoadingMessage,
      setError,
      setSessionId,
      handleSuggestion,
    ]
  );

  const clearChat = useCallback(async () => {
    if (sessionId) {
      try {
        await clientRef.current.clearSession(businessId, sessionId);
      } catch {
        // Silently fail on clear
      }
    }
    clearMessages();
  }, [businessId, sessionId, clearMessages]);

  return {
    messages,
    sessionId,
    isOpen,
    isLoading,
    error,
    sendMessage,
    clearChat,
    setOpen,
    toggleOpen,
  };
};
