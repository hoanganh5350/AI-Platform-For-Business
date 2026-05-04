// ─── Chatbot Mode ─────────────────────────────────────────────────────────────
export type ChatMode = 'float' | 'fullpage';

// ─── Business Tone ────────────────────────────────────────────────────────────
export type BusinessTone = 'professional' | 'friendly' | 'casual' | 'formal' | 'neutral';

// ─── UI Flow Node (v2 — Admin-driven) ────────────────────────────────────────
export interface UIFlowNode {
  id: string;

  /** v2: primary display name */
  name?: string;
  /** v1 backward-compat alias */
  label?: string;

  /** v2: parent node id for flat-list representation */
  parentId?: string | null;

  description?: string;

  /** v2: how this node behaves */
  actionType?: 'navigate' | 'action' | 'info';

  /** v2: canonical URL or route */
  url?: string;
  /** v1 backward-compat */
  path?: string;

  /** v1 backward-compat: inline action string */
  action?: string;

  children?: UIFlowNode[];
}

// ─── Business Configuration (v2) ─────────────────────────────────────────────
export interface BusinessConfig {
  businessId: string;
  businessName: string;

  /** v2 new fields */
  industry?: string;
  website?: string;
  tone?: BusinessTone;

  chatbotName: string;
  welcomeMessage: string;
  language: string;
  uiFlowTree: UIFlowNode[];
}

// ─── AI Suggestion (v2 — includes label) ─────────────────────────────────────
export interface AISuggestion {
  type: 'navigate' | 'action';
  target: string;
  /** v2: short call-to-action text returned by AI (e.g. "View Products") */
  label?: string;
  /** v3: absolute URL returned by AI when node has a direct deeplink */
  url?: string;
}

// ─── AI Response ──────────────────────────────────────────────────────────────
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
  onNavigate?: (nodeId: string, label?: string) => void;
  /** Callback when an action is triggered */
  onAction?: (nodeId: string, label?: string) => void;
  /** Additional CSS class for root element */
  className?: string;
  /** Initial open state (for float mode) */
  defaultOpen?: boolean;
}
