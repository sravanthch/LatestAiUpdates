import { NextResponse } from 'next/server';
import { fetchNews, getLookbackHours } from '@/lib/news';
import { formatArticlesForDiscord } from '@/lib/formatter';
import { sendDiscordWebhook } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleCron();
}

export async function POST() {
  return handleCron();
}

async function handleCron() {
  try {
    const { hours, fromDay, toDay } = getLookbackHours();
    const articles = await fetchNews(hours);
    const embeds = formatArticlesForDiscord(articles, fromDay, toDay);
    await sendDiscordWebhook(embeds);

    return NextResponse.json({
      success: true,
      articlesSent: articles.length,
      lookbackHours: hours,
      dateRange: `${fromDay} → ${toDay}`
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
