import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Invalid payload format, expected items array." }, { status: 400 });
    }

    let processedCount = 0;
    for (const item of items) {
      if (item.type === "clock_in") {
        db.clockIn(item.data);
        processedCount++;
      } else if (item.type === "clock_out") {
        db.clockOut(item.data.bidderCode, item.data);
        processedCount++;
      } else if (item.type === "heartbeat") {
        db.applyHeartbeat(item.data);
        processedCount++;
      }
    }

    return NextResponse.json({ success: true, processedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
