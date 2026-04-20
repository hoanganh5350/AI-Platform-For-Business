import { create } from 'zustand';
import { ChatMessage, AISuggestion } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

interface ChatStore {
  // State
  messages: ChatMessage[];
  sessionId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addUserMessage: (content: string) => string;
  addAssistantMessage: (content: string, suggestion?: AISuggestion) => void;
  setLoadingMessage: () => string;
  resolveLoadingMessage: (tempId: string, content: string, suggestion?: AISuggestion) => void;
  setError: (error: string | null) => void;
  setSessionId: (sessionId: string) => void;
  clearMessages: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  sessionId: null,
  isOpen: false,
  isLoading: false,
  error: null,

  setOpen: (open) => set({ isOpen: open }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen, error: null })),

  addUserMessage: (content) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  addAssistantMessage: (content, suggestion) => {
    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      suggestion,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setLoadingMessage: () => {
    const id = generateId();
    const loadingMsg: ChatMessage = {
      id,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    set((state) => ({
      messages: [...state.messages, loadingMsg],
      isLoading: true,
    }));
    return id;
  },

  resolveLoadingMessage: (tempId, content, suggestion) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === tempId
          ? { ...m, content, suggestion, isLoading: false }
          : m
      ),
      isLoading: false,
    }));
  },

  setError: (error) => set({ error }),

  setSessionId: (sessionId) => set({ sessionId }),

  clearMessages: () => set({ messages: [], sessionId: null, error: null }),

  reset: () =>
    set({
      messages: [],
      sessionId: null,
      isOpen: false,
      isLoading: false,
      error: null,
    }),
}));
