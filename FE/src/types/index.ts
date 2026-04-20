// ─── Chatbot Mode ─────────────────────────────────────────────────────────────
export type ChatMode = 'float' | 'fullpage';

// ─── UI Flow Tree Node ────────────────────────────────────────────────────────
export interface UIFlowNode {
  id: string;
  label: string;
  description?: string;
  path?: string;
  action?: string;
  children?: UIFlowNode[];
}

// ─── Business Configuration ───────────────────────────────────────────────────
export interface BusinessConfig {
  businessId: string;
  businessName: string;
  chatbotName: string;
  welcomeMessage: string;
  language: string;
  uiFlowTree: UIFlowNode[];
}

// ─── AI Suggestion ────────────────────────────────────────────────────────────
export interface AISuggestion {
  type: 'navigate' | 'action';
  target: string;
}

// ─── AI Response ─────────────────────────────────────────────────────────────
export interface AIResponse {
  sessionId: string;
  message: string;
  suggestion?: AISuggestion;
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: AISuggestion;
  timestamp: Date;
  isLoading?: boolean;
}

// ─── Chatbot Props ────────────────────────────────────────────────────────────
export interface ChatbotProps {
  /** Base URL of the backend API (e.g. http://localhost:5000/api) */
  apiUrl: string;
  /** Business ID to load config and send messages */
  businessId: string;
  /** Display mode: floating button or full page */
  mode?: ChatMode;
  /** Override chatbot name displayed in header */
  chatbotName?: string;
  /** Override welcome message */
  welcomeMessage?: string;
  /** Primary brand color */
  primaryColor?: string;
  /** Callback when user navigates to a suggestion target */
  onNavigate?: (nodeId: string) => void;
  /** Callback when an action is triggered */
  onAction?: (nodeId: string) => void;
  /** Additional CSS class for root element */
  className?: string;
  /** Initial open state (for float mode) */
  defaultOpen?: boolean;
}
