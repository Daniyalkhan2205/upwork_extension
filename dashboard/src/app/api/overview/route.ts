import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculatePerformanceScore } from "@/lib/scoring";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const users = await db.getUsers();
    const sessions = await db.getSessions(date);
    const kpis = await db.getKpis(date);
    const domainLogs = await db.getDomainLogs(date);

    let agencyClocked = 0;
    let agencyActive = 0;
    let agencyIdle = 0;
    let agencyUpwork = 0;

    for (const s of sessions) {
      agencyClocked += s.totalClockedSeconds;
      agencyActive += s.totalActiveSeconds;
      agencyIdle += s.totalIdleSeconds;
      agencyUpwork += s.totalUpworkSeconds;
    }

    const agencyUpworkRate =
      agencyActive > 0 ? Math.round((agencyUpwork / agencyActive) * 100) : 0;

    let totalJobsReviewed = 0;
    let totalProposals = 0;
    let totalConnects = 0;
    let totalReplies = 0;
    let totalInterviews = 0;

    for (const k of kpis) {
      totalJobsReviewed += k.jobsReviewed;
      totalProposals += k.proposalsSubmitted;
      totalConnects += k.connectsUsed;
      totalReplies += k.replies;
      totalInterviews += k.interviews;
    }

    // Upwork Subpath breakdown
    const upworkBreakdown: Record<string, number> = {
      searchJobs: 0,
      proposals: 0,
      messages: 0,
      other: 0,
    };

    // Domain Category breakdown
    const domainBreakdown: Record<string, number> = {
      upwork: 0,
      otherWork: 0,
      nonWork: 0,
    };

    for (const dl of domainLogs) {
      if (dl.category === "work_upwork") {
        domainBreakdown.upwork += dl.activeSeconds;
        if (dl.subpath.includes("search") || dl.subpath.includes("find-work")) {
          upworkBreakdown.searchJobs += dl.activeSeconds;
        } else if (dl.subpath.includes("proposal")) {
          upworkBreakdown.proposals += dl.activeSeconds;
        } else if (dl.subpath.includes("message") || dl.subpath.includes("room")) {
          upworkBreakdown.messages += dl.activeSeconds;
        } else {
          upworkBreakdown.other += dl.activeSeconds;
        }
      } else if (dl.category === "work_other") {
        domainBreakdown.otherWork += dl.activeSeconds;
      } else {
        domainBreakdown.nonWork += dl.activeSeconds;
      }
    }

    // Calculate score for each user to get tier counts
    const tierCounts = { GOOD: 0, WARNING: 0, POOR: 0 };
    for (const u of users) {
      const uSessions = sessions.filter((s) => s.bidderCode.toLowerCase() === u.bidderCode.toLowerCase());
      const uKpi = kpis.find((k) => k.bidderCode.toLowerCase() === u.bidderCode.toLowerCase()) || {
        jobsReviewed: 0,
        proposalsSubmitted: 0,
        connectsUsed: 0,
        replies: 0,
        interviews: 0,
      };

      let c = 0, a = 0, i = 0, up = 0;
      uSessions.forEach((s) => {
        c += s.totalClockedSeconds;
        a += s.totalActiveSeconds;
        i += s.totalIdleSeconds;
        up += s.totalUpworkSeconds;
      });

      const res = calculatePerformanceScore({
        clockedSeconds: c,
        activeSeconds: a,
        idleSeconds: i,
        upworkSeconds: up,
        jobsReviewed: uKpi.jobsReviewed,
        proposalsSubmitted: uKpi.proposalsSubmitted,
        replies: uKpi.replies,
        interviews: uKpi.interviews,
      });
      tierCounts[res.tier]++;
    }

    return NextResponse.json({
      success: true,
      date,
      summary: {
        totalClockedSeconds: agencyClocked,
        totalActiveSeconds: agencyActive,
        totalIdleSeconds: agencyIdle,
        totalUpworkSeconds: agencyUpwork,
        agencyUpworkRate,
        totalJobsReviewed,
        totalProposals,
        totalConnects,
        totalReplies,
        totalInterviews,
        activeBiddersCount: sessions.filter((s) => s.status === "active").length,
        totalBiddersCount: users.length,
      },
      tierCounts,
      upworkBreakdown,
      domainBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
