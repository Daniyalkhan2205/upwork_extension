import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculatePerformanceScore } from "@/lib/scoring";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const users = db.getUsers();
    const sessions = db.getSessions(date);
    const kpis = db.getKpis(date);

    const biddersWithStatus = users.map((user) => {
      // Find today's session(s) for this user
      const userSessions = sessions.filter(
        (s) => s.bidderCode.toLowerCase() === user.bidderCode.toLowerCase()
      );
      const activeSession = userSessions.find((s) => s.status === "active");

      // Aggregate session metrics for today
      let totalClocked = 0;
      let totalActive = 0;
      let totalIdle = 0;
      let totalUpwork = 0;
      let totalOtherWork = 0;
      let totalNonWork = 0;

      for (const s of userSessions) {
        totalClocked += s.totalClockedSeconds;
        totalActive += s.totalActiveSeconds;
        totalIdle += s.totalIdleSeconds;
        totalUpwork += s.totalUpworkSeconds;
        totalOtherWork += s.totalOtherWorkSeconds;
        totalNonWork += s.totalNonWorkSeconds;
      }

      // Upwork Activity Rate: (Upwork Active / Total Active) * 100
      const upworkActivityRate =
        totalActive > 0 ? Math.round((totalUpwork / totalActive) * 100) : 0;

      // KPI for today
      const userKpi = kpis.find(
        (k) => k.bidderCode.toLowerCase() === user.bidderCode.toLowerCase()
      ) || {
        jobsReviewed: 0,
        proposalsSubmitted: 0,
        connectsUsed: 0,
        replies: 0,
        interviews: 0,
      };

      // Calculate performance score
      const performance = calculatePerformanceScore({
        clockedSeconds: totalClocked,
        activeSeconds: totalActive,
        idleSeconds: totalIdle,
        upworkSeconds: totalUpwork,
        jobsReviewed: userKpi.jobsReviewed,
        proposalsSubmitted: userKpi.proposalsSubmitted,
        replies: userKpi.replies,
        interviews: userKpi.interviews,
      });

      return {
        user,
        isClockedIn: !!activeSession,
        activeSession: activeSession || null,
        currentDomain: activeSession?.lastActiveDomain || null,
        currentSubpath: activeSession?.lastActiveSubpath || null,
        todayMetrics: {
          clockedSeconds: totalClocked,
          activeSeconds: totalActive,
          idleSeconds: totalIdle,
          upworkSeconds: totalUpwork,
          otherWorkSeconds: totalOtherWork,
          nonWorkSeconds: totalNonWork,
          upworkActivityRate,
        },
        kpis: userKpi,
        performance,
      };
    });

    return NextResponse.json({ success: true, bidders: biddersWithStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
