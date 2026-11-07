import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://feeds.arstechnica.com/arstechnica/technology-lab',
  'https://venturebeat.com/category/ai/feed/',
  'https://www.technologyreview.com/topic/artificial-intelligence/feed'
];

export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  source: string;
}

/**
 * Calculate hours to look back based on the Monday/Thursday schedule.
 * - Monday: look back ~4 days (since Thursday)
 * - Thursday: look back ~3 days (since Monday)
 * - Any other day: calculate distance to the most recent Monday or Thursday
 * Adds a 6-hour buffer to avoid missing articles at boundaries.
 */
export function getLookbackHours(): { hours: number; fromDay: string; toDay: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  // Days since last cron run day (Monday=1 or Thursday=4)
  let daysSinceLastRun: number;

  if (dayOfWeek === 1) {
    // Monday — last run was Thursday (4 days ago)
    daysSinceLastRun = 4;
  } else if (dayOfWeek === 4) {
    // Thursday — last run was Monday (3 days ago)
    daysSinceLastRun = 3;
  } else {
    // Fallback for manual triggers on other days:
    // Calculate days since the most recent Monday or Thursday
    const daysFromMon = (dayOfWeek - 1 + 7) % 7; // days since last Monday
    const daysFromThu = (dayOfWeek - 4 + 7) % 7; // days since last Thursday
    daysSinceLastRun = Math.min(
      daysFromMon === 0 ? 7 : daysFromMon,
      daysFromThu === 0 ? 7 : daysFromThu
    );
    // Minimum 1 day lookback
    if (daysSinceLastRun === 0) daysSinceLastRun = 1;
  }

  // 6-hour buffer to catch articles near the boundary
  const hours = daysSinceLastRun * 24 + 6;

  // Calculate the "from" date for display
  const fromDate = new Date(now.getTime() - daysSinceLastRun * 24 * 60 * 60 * 1000);
  const fromDay = fromDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const toDay = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return { hours, fromDay, toDay };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

function isSimilar(title1: string, title2: string): boolean {
  const t1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const t2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  if (t1 === t2) return true;
  if (t1.includes(t2) || t2.includes(t1)) return true;

  // Word overlap check — if 60%+ words match, treat as duplicate
  const words1 = new Set(t1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(t2.split(/\s+/).filter(w => w.length > 3));
  if (words1.size === 0 || words2.size === 0) return false;
  const overlap = Array.from(words1).filter(w => words2.has(w)).length;
  const smaller = Math.min(words1.size, words2.size);
  return overlap / smaller >= 0.6;
}

export async function fetchNews(hours: number): Promise<Article[]> {
  const articles: Article[] = [];
  const cutoffTime = new Date().getTime() - hours * 60 * 60 * 1000;

  // Fetch all feeds concurrently for speed
  const feedResults = await Promise.allSettled(
    FEEDS.map(async (feedUrl) => {
      const feed = await parser.parseURL(feedUrl);
      const source = feed.title || new URL(feedUrl).hostname;
      return { feed, source };
    })
  );

  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      const { feed, source } = result.value;
      for (const item of feed.items) {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        if (pubDate.getTime() > cutoffTime) {
          articles.push({
            title: item.title || 'Untitled',
            link: item.link || '',
            pubDate,
            description: stripHtml(item.contentSnippet || item.content || item.summary || ''),
            source
          });
        }
      }
    } else {
      console.error('Failed to fetch feed:', result.reason);
    }
  }

  // Deduplicate
  const uniqueArticles: Article[] = [];
  for (const article of articles) {
    const dup = uniqueArticles.find(u => isSimilar(u.title, article.title));
    if (!dup) {
      uniqueArticles.push(article);
    }
  }

  // Sort by date desc (most recent first)
  uniqueArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  // Return top 5 most recent articles
  return uniqueArticles.slice(0, 5);
}
