import { PerformanceScoreResult, PerformanceTier } from "../types";

interface ScoringInput {
  clockedSeconds: number;
  activeSeconds: number;
  idleSeconds: number;
  upworkSeconds: number;
  jobsReviewed: number;
  proposalsSubmitted: number;
  replies: number;
  interviews: number;
}

/**
 * Calculates Bidder Performance Score and categorizes status
 * Formula:
 * Bidder Performance Score = Attendance + Upwork Active Time + Proposals Submitted + Replies/Interviews
 *
 * Status Categorization:
 * - GOOD: High Upwork time + proportional proposal output.
 * - WARNING: High Upwork time but low proposal output (Flags potential slacking or slow browsing).
 * - POOR: High idle time / low Upwork active time.
 */
export function calculatePerformanceScore(input: ScoringInput): PerformanceScoreResult {
  const {
    clockedSeconds,
    activeSeconds,
    idleSeconds,
    upworkSeconds,
    jobsReviewed,
    proposalsSubmitted,
    replies,
    interviews,
  } = input;

  const clockedHours = clockedSeconds / 3600;
  const upworkHours = upworkSeconds / 3600;
  const activeHours = activeSeconds / 3600;
  const idleRatio = clockedSeconds > 0 ? (idleSeconds / clockedSeconds) : 0;
  const upworkRatio = activeSeconds > 0 ? (upworkSeconds / activeSeconds) * 100 : 0;

  // 1. Attendance Score (Max 20 pts)
  // Target: 4 to 8 hours shift with healthy active presence
  let attendanceScore = 0;
  if (clockedHours >= 6) {
    attendanceScore = 20;
  } else if (clockedHours >= 4) {
    attendanceScore = 15;
  } else if (clockedHours >= 2) {
    attendanceScore = 10;
  } else if (clockedHours > 0) {
    attendanceScore = 5;
  }

  // 2. Upwork Active Time Score (Max 30 pts)
  // Reflects dedication of active computer time to Upwork
  let upworkTimeScore = 0;
  if (upworkRatio >= 80) {
    upworkTimeScore = 30;
  } else if (upworkRatio >= 65) {
    upworkTimeScore = 24;
  } else if (upworkRatio >= 50) {
    upworkTimeScore = 18;
  } else if (upworkRatio >= 35) {
    upworkTimeScore = 10;
  } else {
    upworkTimeScore = 4;
  }

  // 3. Proposals Submitted Score (Max 30 pts)
  // Benchmark: 1-2 proposals per hour of Upwork time (typical agency goal: 5-10 proposals per shift)
  let proposalsScore = 0;
  if (proposalsSubmitted >= 8) {
    proposalsScore = 30;
  } else if (proposalsSubmitted >= 5) {
    proposalsScore = 24;
  } else if (proposalsSubmitted >= 3) {
    proposalsScore = 18;
  } else if (proposalsSubmitted >= 1) {
    proposalsScore = 10;
  } else {
    proposalsScore = 0;
  }

  // 4. Replies & Interviews Conversion Score (Max 20 pts)
  // High-value results
  const conversionScore = Math.min(20, (replies * 4) + (interviews * 8));

  // Total Score (0 - 100)
  const totalScore = Math.min(100, Math.round(attendanceScore + upworkTimeScore + proposalsScore + conversionScore));

  // Determine Performance Status: GOOD, WARNING, POOR
  let tier: PerformanceTier = "POOR";
  let summary = "";
  const recommendations: string[] = [];

  // Condition 1: POOR if excessive idle time (> 40% idle) OR very low Upwork ratio (< 40%) OR no activity
  if (idleRatio > 0.40 || (clockedHours > 1 && upworkRatio < 40) || totalScore < 45) {
    tier = "POOR";
    summary = "High idle time or deficient Upwork active focus. Requires attention.";
    if (idleRatio > 0.40) {
      recommendations.push(`Idle time is ${Math.round(idleRatio * 100)}% of shift (exceeds 40% threshold).`);
    }
    if (upworkRatio < 40) {
      recommendations.push(`Upwork focus is only ${Math.round(upworkRatio)}% of active time.`);
    }
    if (proposalsSubmitted === 0) {
      recommendations.push("Zero proposals submitted today.");
    }
  }
  // Condition 2: WARNING if high Upwork time (> 65%) but low proposal output (less than 3 proposals after 2+ hours on Upwork)
  // Flags potential slacking, window shopping, or slow browsing
  else if (upworkHours >= 2 && proposalsSubmitted < 3) {
    tier = "WARNING";
    summary = "High Upwork time detected but proposal output is disproportionately low. Flags potential slacking or slow browsing.";
    recommendations.push(`Spent ${upworkHours.toFixed(1)}h on Upwork but only produced ${proposalsSubmitted} proposals.`);
    recommendations.push("Check if bidder is over-analyzing job posts or spending excessive time reading without applying.");
  }
  // Condition 3: GOOD if healthy Upwork time and proportional proposal output
  else if (totalScore >= 65 && proposalsSubmitted >= 3 && upworkRatio >= 60) {
    tier = "GOOD";
    summary = "High Upwork focus with consistent, proportional proposal output.";
    recommendations.push("Bidder is maintaining optimal pace and high platform productivity.");
  }
  // Fallback intermediate
  else if (totalScore >= 55) {
    tier = "WARNING";
    summary = "Moderate performance. Output pacing could be improved.";
    recommendations.push("Increase proposal submission frequency relative to jobs reviewed.");
  } else {
    tier = "POOR";
    summary = "Underperforming relative to agency shift targets.";
    recommendations.push("Review bidder daily log and context distribution.");
  }

  return {
    score: totalScore,
    tier,
    upworkRatio: Math.round(upworkRatio),
    attendanceScore,
    upworkTimeScore,
    proposalsScore,
    conversionScore,
    summary,
    recommendations,
  };
}
