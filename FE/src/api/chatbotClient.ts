import { AIResponse, BusinessConfig } from '../types';

export class ChatbotApiClient {
  private baseUrl: string;

  constructor(apiUrl: string) {
    // Strip trailing slash
    this.baseUrl = apiUrl.replace(/\/$/, '');
  }

  /**
   * Load public business config
   */
  async loadConfig(businessId: string): Promise<BusinessConfig> {
    const res = await fetch(`${this.baseUrl}/config/${businessId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to load config' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data as BusinessConfig;
  }

  /**
   * Send a chat message and receive AI response
   */
  async sendMessage(
    businessId: string,
    message: string,
    sessionId?: string | null
  ): Promise<AIResponse> {
    const body: Record<string, unknown> = { message };
    if (sessionId) body.sessionId = sessionId;

    const res = await fetch(`${this.baseUrl}/chat/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to send message' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data as AIResponse;
  }

  /**
   * Clear a session on backend
   */
  async clearSession(businessId: string, sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/chat/${businessId}/session/${sessionId}`, {
      method: 'DELETE',
    });
  }
}
