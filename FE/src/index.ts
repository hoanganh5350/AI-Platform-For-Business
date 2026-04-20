// ─── Core Exports ────────────────────────────────────────────────────────────
export { default as Chatbot } from './components/Chatbot/Chatbot';
export { default as ChatBox } from './components/ChatBox/ChatBox';
export { default as FloatChatButton } from './components/FloatChatButton/FloatChatButton';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  ChatbotProps,
  ChatMode,
  UIFlowNode,
  ChatMessage,
  AIResponse,
  BusinessConfig,
} from './types';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useChatbot } from './hooks/useChatbot';
export { useBusinessConfig } from './hooks/useBusinessConfig';

// ─── Store ───────────────────────────────────────────────────────────────────
export { useChatStore } from './store/chatStore';

// ─── CSS (consumers must import this) ────────────────────────────────────────
import './styles/chatbot.css';
