import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend/client";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await sendWelcomeEmail(email, name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/welcome] Error sending welcome email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
