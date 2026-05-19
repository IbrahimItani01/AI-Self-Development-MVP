import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";

const schema = z.object({ idToken: z.string().min(10) });

export async function POST(request: Request) {
  try {
    const { idToken } = schema.parse(await request.json());
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Session login failed", error);
    return NextResponse.json({ error: "Unable to create dashboard session." }, { status: 401 });
  }
}
