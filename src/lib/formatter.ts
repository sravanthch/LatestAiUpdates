import { Article } from './news';

export function formatArticlesForDiscord(articles: Article[], fromDay: string, toDay: string): any[] {
  const embeds = [];

  if (articles.length === 0) {
    return [{
      title: "🤖 AI News Digest",
      description: `📅 **${fromDay}** → **${toDay}**\n\nNo major AI news during this period. Enjoy the calm! 😌`,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
      footer: { text: "LatestAiUpdates Bot" }
    }];
  }

  const header = `📅 **${fromDay}** → **${toDay}**\n_Top ${articles.length} AI updates_\n\n`;
  let currentDescription = header;
  let embedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    // Create a 1-2 sentence summary
    const summaryParts = article.description.split(/[.!?]/).filter(Boolean);
    const summary = summaryParts.slice(0, 2).join('.') + (summaryParts.length > 0 ? '.' : '');
    const truncatedSummary = summary.length > 250 ? summary.substring(0, 247) + '...' : summary;

    const itemStr = `**${i + 1}. [${article.title}](${article.link})**\n📰 *${article.source}*\n${truncatedSummary}\n\n`;

    // 4096 is the hard limit for discord embed description
    if (currentDescription.length + itemStr.length > 4000) {
      embeds.push({
        title: embedCount === 0 ? `🤖 AI News Digest` : `🤖 AI News Digest (Cont.)`,
        description: currentDescription,
        color: 0x5865F2,
        timestamp: new Date().toISOString(),
        footer: { text: "LatestAiUpdates Bot" }
      });
      currentDescription = itemStr;
      embedCount++;
    } else {
      currentDescription += itemStr;
    }
  }

  if (currentDescription.length > 0) {
    embeds.push({
      title: embedCount === 0 ? `🤖 AI News Digest` : `🤖 AI News Digest (Cont.)`,
      description: currentDescription,
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
      footer: { text: "LatestAiUpdates Bot" }
    });
  }

  return embeds;
}
