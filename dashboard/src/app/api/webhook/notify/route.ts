import { NextResponse } from "next/server";
import { getRecentWebhookLogs, logWebhookEvent, sendTelegramAlert } from "@/lib/telegram";

export async function GET() {
  const logs = getRecentWebhookLogs();
  return NextResponse.json({ success: true, logs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, bidderCode, bidderName, message } = body;

    const logged = logWebhookEvent({
      eventType: eventType || "notification",
      bidderCode: bidderCode || "BIDDER",
      bidderName: bidderName || "Bidder",
      message: message || "System Notification",
      status: "delivered",
      timestamp: new Date().toISOString(),
    });

    if (message) {
      sendTelegramAlert(message).catch((err) => console.warn("Telegram webhook error:", err));
    }

    return NextResponse.json({ success: true, log: logged });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
