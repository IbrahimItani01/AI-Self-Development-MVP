import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/handlers";
import { parseUpdate, verifyTelegramSecret } from "@/lib/telegram/bot";

export async function POST(request: Request) {
  if (!verifyTelegramSecret(request)) {
    return NextResponse.json({ error: "Invalid Telegram secret" }, { status: 401 });
  }

  try {
    const update = parseUpdate(await request.json());
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook failed", error);
    return NextResponse.json({ ok: true });
  }
}
