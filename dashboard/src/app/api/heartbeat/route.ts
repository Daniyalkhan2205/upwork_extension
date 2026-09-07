import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HeartbeatPayload } from "@/types";

export async function POST(req: Request) {
  try {
    const packet: HeartbeatPayload = await req.json();

    if (!packet.bidderCode) {
      return NextResponse.json({ success: false, message: "bidderCode is required" }, { status: 400 });
    }

    const session = db.applyHeartbeat(packet);

    return NextResponse.json({
      success: true,
      sessionId: session?.id,
      sessionTotals: {
        clocked: session?.totalClockedSeconds || 0,
        active: session?.totalActiveSeconds || 0,
        idle: session?.totalIdleSeconds || 0,
        upwork: session?.totalUpworkSeconds || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
