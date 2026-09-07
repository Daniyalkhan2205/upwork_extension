import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const bidderCode = searchParams.get("bidderCode") || undefined;

    const kpis = db.getKpis(date, bidderCode);
    return NextResponse.json({ success: true, kpis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bidderCode, date, jobsReviewed, proposalsSubmitted, connectsUsed, replies, interviews, notes } = body;

    if (!bidderCode) {
      return NextResponse.json({ success: false, message: "bidderCode is required" }, { status: 400 });
    }

    const user = db.getUserByCode(bidderCode);
    const savedKpi = db.saveKpi({
      userId: user ? user.id : "user_" + bidderCode,
      bidderCode,
      date: date || new Date().toISOString().slice(0, 10),
      jobsReviewed: Number(jobsReviewed) || 0,
      proposalsSubmitted: Number(proposalsSubmitted) || 0,
      connectsUsed: Number(connectsUsed) || 0,
      replies: Number(replies) || 0,
      interviews: Number(interviews) || 0,
      notes: notes || "",
    });

    return NextResponse.json({ success: true, kpi: savedKpi });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
