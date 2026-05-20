import { runCheckInAutomation } from "@/lib/check-ins/automation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runCheckInAutomation();
  return Response.json({ ok: true, ...result });
}
