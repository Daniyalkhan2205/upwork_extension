import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logWebhookEvent, sendTelegramAlert } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = db.clockIn({
      id: body.id,
      bidderCode: body.bidderCode || "BIDDER_01",
      bidderName: body.bidderName || "Alex Mercer",
      clockInTime: body.clockInTime || new Date().toISOString(),
    });

    const timeStr = new Date(session.clockInTime).toLocaleTimeString();
    const msg = `🟢 *BIDDER CLOCKED IN*\n\n👤 *Bidder:* ${session.bidderName} (\`${session.bidderCode}\`)\n⏰ *Time:* ${timeStr}\n⚡ *Shift:* Started`;

    logWebhookEvent({
      eventType: "clock_in",
      bidderCode: session.bidderCode,
      bidderName: session.bidderName,
      message: msg,
      status: "delivered",
      timestamp: session.clockInTime,
    });

    // Send Telegram alert asynchronously
    sendTelegramAlert(msg).catch((err) => console.warn("Telegram dispatch failed:", err));

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
