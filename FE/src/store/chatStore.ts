import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, AISuggestion } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

interface BusinessSession {
  messages: ChatMessage[];
  sessionId: string | null;
}

interface ChatStore {
  // State
  activeBusinessId: string | null;
  sessions: Record<string, BusinessSession>;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Computed / Getter helpers
  getMessages: () => ChatMessage[];
  getSessionId: () => string | null;

  // Actions
  initSession: (businessId: string) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addUserMessage: (content: string) => string;
  addAssistantMessage: (content: string, suggestion?: AISuggestion) => void;
  setLoadingMessage: () => string;
  resolveLoadingMessage: (tempId: string, content: string, suggestion?: AISuggestion) => void;
  setHistory: (messages: ChatMessage[]) => void;
  setError: (error: string | null) => void;
  setSessionId: (sessionId: string) => void;
  clearMessages: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      activeBusinessId: null,
      sessions: {},
      isOpen: false,
      isLoading: false,
      error: null,

      getMessages: () => {
        const { activeBusinessId, sessions } = get();
        if (!activeBusinessId) return [];
        return sessions[activeBusinessId]?.messages || [];
      },

      getSessionId: () => {
        const { activeBusinessId, sessions } = get();
        if (!activeBusinessId) return null;
        return sessions[activeBusinessId]?.sessionId || null;
      },

      initSession: (businessId) => {
        set((state) => {
          const sessions = { ...state.sessions };
          if (!sessions[businessId]) {
            sessions[businessId] = { messages: [], sessionId: null };
          }
          return { activeBusinessId: businessId, sessions };
        });
      },

      setOpen: (open) => set({ isOpen: open }),

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen, error: null })),

      addUserMessage: (content) => {
        const id = generateId();
        const { activeBusinessId } = get();
        if (!activeBusinessId) return id;

        const message: ChatMessage = {
          id,
          role: 'user',
          content,
          timestamp: new Date(),
        };

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId] || { messages: [], sessionId: null };
          sessions[activeBusinessId] = {
            ...session,
            messages: [...session.messages, message],
          };
          return { sessions };
        });

        return id;
      },

      addAssistantMessage: (content, suggestion) => {
        const { activeBusinessId } = get();
        if (!activeBusinessId) return;

        const message: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content,
          suggestion,
          timestamp: new Date(),
        };

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId] || { messages: [], sessionId: null };
          sessions[activeBusinessId] = {
            ...session,
            messages: [...session.messages, message],
          };
          return { sessions };
        });
      },

      setLoadingMessage: () => {
        const id = generateId();
        const { activeBusinessId } = get();
        if (!activeBusinessId) return id;

        const loadingMsg: ChatMessage = {
          id,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true,
        };

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId] || { messages: [], sessionId: null };
          sessions[activeBusinessId] = {
            ...session,
            messages: [...session.messages, loadingMsg],
          };
          return { sessions, isLoading: true };
        });

        return id;
      },

      resolveLoadingMessage: (tempId, content, suggestion) => {
        const { activeBusinessId } = get();
        if (!activeBusinessId) return;

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId];
          if (session) {
            sessions[activeBusinessId] = {
              ...session,
              messages: session.messages.map((m) =>
                m.id === tempId
                  ? { ...m, content, suggestion, isLoading: false }
                  : m
              ),
            };
          }
          return { sessions, isLoading: false };
        });
      },

      setHistory: (messages) => {
        const { activeBusinessId } = get();
        if (!activeBusinessId) return;

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId] || { messages: [], sessionId: null };
          sessions[activeBusinessId] = {
            ...session,
            messages,
          };
          return { sessions };
        });
      },

      setError: (error) => set({ error }),

      setSessionId: (sessionId) => {
        const { activeBusinessId } = get();
        if (!activeBusinessId) return;

        set((state) => {
          const sessions = { ...state.sessions };
          const session = sessions[activeBusinessId] || { messages: [], sessionId: null };
          sessions[activeBusinessId] = {
            ...session,
            sessionId,
          };
          return { sessions };
        });
      },

      clearMessages: () => {
        const { activeBusinessId } = get();
        if (!activeBusinessId) return;

        set((state) => {
          const sessions = { ...state.sessions };
          sessions[activeBusinessId] = { messages: [], sessionId: null };
          return { sessions, error: null };
        });
      },

      reset: () => {
        set({
          sessions: {},
          activeBusinessId: null,
          isOpen: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'ai-chatbot-sessions', // Key for LocalStorage persistence
    }
  )
);
