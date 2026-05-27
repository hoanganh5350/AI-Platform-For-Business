import { useCallback, useRef, useEffect } from 'react';
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

  // Reactive state selection from scoped store
  const messages = useChatStore((state) => state.sessions[businessId]?.messages || []);
  const sessionId = useChatStore((state) => state.sessions[businessId]?.sessionId || null);

  const {
    isOpen,
    isLoading,
    error,
    initSession,
    setOpen,
    toggleOpen,
    addUserMessage,
    setLoadingMessage,
    resolveLoadingMessage,
    setHistory,
    setError,
    setSessionId,
    clearMessages,
  } = useChatStore();

  // Initialize session and reload history on mount / reload if session exists
  useEffect(() => {
    initSession(businessId);
  }, [businessId, initSession]);

  useEffect(() => {
    if (businessId && sessionId && messages.length === 0) {
      const fetchHistory = async () => {
        try {
          const history = await clientRef.current.loadHistory(businessId, sessionId);
          setHistory(history);
        } catch (err) {
          console.warn('[Chat] Failed to reload message history:', err);
        }
      };
      fetchHistory();
    }
  }, [businessId, sessionId, messages.length, setHistory]);

  const handleSuggestion = useCallback(
    (suggestion?: AISuggestion) => {
      if (!suggestion) return;
      if (suggestion.type === 'navigate' && onNavigate) {
        onNavigate(suggestion.target, suggestion.label);
      } else if (suggestion.type === 'action' && onAction) {
        onAction(suggestion.target, suggestion.label);
      }
    },
    [onNavigate, onAction]
  );

  const sendMessage = useCallback(
    async (content: string, file?: File | null) => {
      if (!content.trim() && !file) return;
      if (isLoading) return;

      setError(null);

      let userMessageContent = '';
      if (file) {
        userMessageContent = `[File: ${file.name}]`;
        if (content.trim()) {
          userMessageContent += `\n${content.trim()}`;
        }
      } else {
        userMessageContent = content.trim();
      }
      addUserMessage(userMessageContent);
      const loadingId = setLoadingMessage();

      try {
        const response = await clientRef.current.sendMessage(
          businessId,
          content,
          sessionId,
          file
        );

        // Update session ID if newly created
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId);
        }

        resolveLoadingMessage(loadingId, response.message, response.suggestion);

        if (response.suggestion) {
          handleSuggestion(response.suggestion);
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Something went wrong';
        resolveLoadingMessage(
          loadingId,
          `⚠️ Xin lỗi, tôi đã gặp lỗi khi gửi tin nhắn: ${errMessage}`,
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
        // Silently catch clear session errors
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
