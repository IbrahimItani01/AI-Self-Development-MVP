import type { TelegramUpdate } from "@/types";

const telegramApi = "https://api.telegram.org";

export function verifyTelegramSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

export async function sendTelegramMessage(input: {
  chatId: string;
  text: string;
  replyMarkup?: Record<string, unknown>;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("Telegram not configured. Would send:", input);
    return;
  }

  const response = await fetch(`${telegramApi}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text,
      parse_mode: "HTML",
      reply_markup: input.replyMarkup,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`${telegramApi}/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

export function parseUpdate(raw: unknown): TelegramUpdate {
  return raw as TelegramUpdate;
}
