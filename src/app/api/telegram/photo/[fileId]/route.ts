import { NextResponse } from "next/server";
import { getTelegramFileUrl } from "@/lib/telegram/bot";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const fileUrl = await getTelegramFileUrl(fileId);
  if (!fileUrl) return new NextResponse("Not found", { status: 404 });

  const response = await fetch(fileUrl);
  if (!response.ok) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", response.headers.get("content-type") || "image/jpeg");
  headers.set("cache-control", "private, max-age=3600");
  return new NextResponse(response.body, { headers });
}
