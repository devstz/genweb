import { useEffect, useState } from 'react';

export function useBotUsername() {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch('/api/telegram/bot-username');
        const data = (await res.json()) as { username?: string | null };
        if (!cancelled) {
          setUsername(typeof data.username === 'string' ? data.username : null);
        }
      } catch {
        if (!cancelled) setUsername(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { username, isLoading };
}
