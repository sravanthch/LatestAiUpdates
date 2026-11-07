'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testCron = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/cron');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="hero">
        <h1>🤖 LatestAiUpdates</h1>
        <p>Fetches the top 5 AI news from major tech sources and sends a concise digest to your Discord channel — every Monday and Thursday.</p>
      </div>

      <div className="card">
        <h2>🚀 Test the Endpoint</h2>
        <p>Click below to manually trigger <code>/api/cron</code>. It will fetch AI news since the last run and send the top 5 to your Discord channel.</p>
        <button className="btn" onClick={testCron} disabled={loading}>
          {loading ? 'Fetching news...' : 'Test Now'}
        </button>
        {result && (
          <div className="result">
            {result}
          </div>
        )}
      </div>

      <div className="card">
        <h2>📡 How It Works</h2>
        <ol className="steps">
          <li>Cron job hits <code>/api/cron</code> every <strong>Monday</strong> and <strong>Thursday</strong></li>
          <li>Server automatically calculates the lookback window (Mon→Thu = 3 days, Thu→Mon = 4 days)</li>
          <li>Fetches AI news from 5 RSS feeds (TechCrunch, The Verge, Ars Technica, VentureBeat, MIT Tech Review)</li>
          <li>Deduplicates articles and picks the <strong>top 5</strong></li>
          <li>Formats a summary with links and date range into a rich Discord embed</li>
          <li>Sends it to your <code>#latest-ai</code> channel via webhook</li>
        </ol>
      </div>

      <div className="card">
        <h2>🛠️ Setup Instructions</h2>
        
        <h3>1. Discord Webhook</h3>
        <ul className="steps">
          <li>Create a <code>#latest-ai</code> text channel in your Discord server.</li>
          <li>Go to Channel Settings &gt; Integrations &gt; Webhooks &gt; New Webhook.</li>
          <li>Copy the Webhook URL.</li>
        </ul>

        <h3>2. Environment Variable</h3>
        <p>Add this to your hosting provider (Vercel/Netlify) environment variables:</p>
        <pre><code>DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN</code></pre>

        <h3>3. Cron Job</h3>
        <p>Use a free cron runner like <a href="https://cron-job.org" target="_blank" rel="noreferrer">cron-job.org</a> and set it to run every <strong>Monday and Thursday</strong>:</p>
        <pre><code>https://your-domain.com/api/cron</code></pre>
        <p className="muted">That&apos;s it — no secrets or API keys needed.</p>
      </div>
    </main>
  );
}
