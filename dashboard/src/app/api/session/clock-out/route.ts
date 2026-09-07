import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWebhookEvent, sendTelegramAlert } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bidderCode = body.bidderCode || "BIDDER_01";
    const session = db.clockOut(bidderCode, body);

    if (!session) {
      return NextResponse.json({ success: false, message: "No active session found for bidder." }, { status: 404 });
    }

    const clockedMins = Math.round(session.totalClockedSeconds / 60);
    const upworkMins = Math.round(session.totalUpworkSeconds / 60);
    const idleMins = Math.round(session.totalIdleSeconds / 60);
    const activeMins = Math.round(session.totalActiveSeconds / 60);
    const rate = activeMins > 0 ? Math.round((upworkMins / activeMins) * 100) : 0;

    const msg = `🔴 *BIDDER CLOCKED OUT*\n\n👤 *Bidder:* ${session.bidderName} (\`${session.bidderCode}\`)\n⏱️ *Total Shift:* ${clockedMins} mins\n🎯 *Upwork Active:* ${upworkMins} mins\n💤 *Idle Time:* ${idleMins} mins\n📊 *Upwork Rate:* ${rate}%`;

    logWebhookEvent({
      eventType: "clock_out",
      bidderCode: session.bidderCode,
      bidderName: session.bidderName,
      message: msg,
      status: "delivered",
      timestamp: session.clockOutTime || new Date().toISOString(),
    });

    sendTelegramAlert(msg).catch((err) => console.warn("Telegram dispatch failed:", err));

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
