import 'server-only';

type CacheState = { ready: true; username: string | null } | { ready: false };

let cache: CacheState = { ready: false };

interface TelegramGetMeOk {
  ok: true;
  result?: { username?: string };
}

interface TelegramGetMeErr {
  ok: false;
}

export async function getCachedBotUsername(): Promise<string | null> {
  if (cache.ready) {
    return cache.username;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    cache = { ready: true, username: null };
    return null;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      cache: 'no-store',
    });
    const data = (await res.json()) as TelegramGetMeOk | TelegramGetMeErr;
    const username =
      data.ok && data.result?.username && typeof data.result.username === 'string'
        ? data.result.username
        : null;
    cache = { ready: true, username };
    return username;
  } catch {
    cache = { ready: true, username: null };
    return null;
  }
}
