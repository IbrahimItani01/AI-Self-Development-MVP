import "dotenv/config";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !appUrl) throw new Error("Set TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_APP_URL first.");

  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: `${appUrl.replace(/\/$/, "")}/api/telegram/webhook`,
      secret_token: secret || undefined,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
