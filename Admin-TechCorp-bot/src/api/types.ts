export type BusinessTone = 'professional' | 'friendly' | 'casual' | 'formal' | 'neutral';

export interface UIFlowNode {
  id: string;
  name?: string;
  label?: string; // v1 compat
  parentId?: string | null;
  description?: string;
  actionType?: 'navigate' | 'action' | 'info';
  url?: string;
  path?: string; // v1 compat
  action?: string; // v1 compat
  children?: UIFlowNode[];
}

export interface BusinessConfig {
  businessId: string;
  businessName: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  tone?: BusinessTone;
  description: string;
  chatbotName: string;
  welcomeMessage: string;
  language: string;
  uiFlowTree: UIFlowNode[];
  metadata?: Record<string, unknown>;
}
