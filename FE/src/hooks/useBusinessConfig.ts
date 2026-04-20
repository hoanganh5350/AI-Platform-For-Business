import { useState, useEffect } from 'react';
import { ChatbotApiClient } from '../api/chatbotClient';
import { BusinessConfig } from '../types';

interface UseBusinessConfigResult {
  config: BusinessConfig | null;
  loading: boolean;
  error: string | null;
}

export const useBusinessConfig = (
  apiUrl: string,
  businessId: string
): UseBusinessConfigResult => {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiUrl || !businessId) return;

    const client = new ChatbotApiClient(apiUrl);
    let cancelled = false;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await client.loadConfig(businessId);
        if (!cancelled) setConfig(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load config');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, businessId]);

  return { config, loading, error };
};
