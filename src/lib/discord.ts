export async function sendDiscordWebhook(embeds: any[]) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not set');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ embeds }),
  });

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Could not read error text';
    }
    throw new Error(`Discord Webhook Error: ${response.status} - ${errorText}`);
  }

  return true;
}
