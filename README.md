# LatestAiUpdates 🤖

A Next.js application that automatically fetches AI news from top tech sources and sends a concise digest to a Discord channel via Webhook.

## How It Works


1. The server fetches AI articles from 5 **free RSS feeds** — no LLM, no API keys, no web scraping
2. Articles from the last 24 hours are filtered and deduplicated
3. A concise summary with links is formatted into a rich Discord embed

## News Sources

- **TechCrunch** — AI category
- **The Verge** — AI & Artificial Intelligence
- **Ars Technica** — Technology Lab
- **VentureBeat** — AI category
- **MIT Technology Review** — Artificial Intelligence


### 2. Local Development
```bash
# Install dependencies
npm install

# Add your webhook URL to .env.local
# DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Run dev server
npm run dev
```
Open `http://localhost:3000` — use the **Test Now** button to try it out

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cron` | GET / POST | Fetches news and sends digest to Discord |
| `/api/health` | GET | Health check — returns `{ status: 'ok' }` |