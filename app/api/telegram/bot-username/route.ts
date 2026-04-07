import { getCachedBotUsername } from '@/lib/server/telegramBotUsername';
import { NextResponse } from 'next/server';

export async function GET() {
  const username = await getCachedBotUsername();
  return NextResponse.json({ username });
}
