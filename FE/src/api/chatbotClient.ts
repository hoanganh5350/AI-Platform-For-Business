import { AIResponse, BusinessConfig, ChatMessage } from '../types';

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
   * Send a chat message and receive AI response (supports optional file attachment)
   */
  async sendMessage(
    businessId: string,
    message: string,
    sessionId?: string | null,
    file?: File | null
  ): Promise<AIResponse> {
    let res;

    if (file) {
      const formData = new FormData();
      formData.append('message', message);
      if (sessionId) formData.append('sessionId', sessionId);
      formData.append('file', file);

      res = await fetch(`${this.baseUrl}/chat/${businessId}`, {
        method: 'POST',
        body: formData, // multipart/form-data boundary automatically set by browser
      });
    } else {
      const body: Record<string, unknown> = { message };
      if (sessionId) body.sessionId = sessionId;

      res = await fetch(`${this.baseUrl}/chat/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to send message' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.data as AIResponse;
  }

  /**
   * Load session history from the database
   */
  async loadHistory(businessId: string, sessionId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${this.baseUrl}/chat/${businessId}/history/${sessionId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to load history' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return (json.data?.messages || []).map((msg: any) => ({
      id: msg.id || msg._id || Math.random().toString(),
      role: msg.role,
      content: msg.content,
      suggestion: msg.suggestion,
      timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
    })) as ChatMessage[];
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
