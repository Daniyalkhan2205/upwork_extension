export type UserRole = "bidder" | "manager" | "admin";

export interface User {
  id: string;
  bidderCode: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  bidderCode: string;
  bidderName: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalClockedSeconds: number;
  totalActiveSeconds: number;
  totalIdleSeconds: number;
  totalUpworkSeconds: number;
  totalOtherWorkSeconds: number;
  totalNonWorkSeconds: number;
  date: string;
  status: "active" | "completed" | "abandoned";
  lastActiveDomain?: string;
  lastActiveSubpath?: string;
}

export interface DomainLog {
  id: string;
  sessionId: string;
  userId: string;
  domain: string;
  subpath: string;
  category: "work_upwork" | "work_other" | "non_work" | "idle";
  activeSeconds: number;
  date: string;
}

export interface DailyKPI {
  id: string;
  userId: string;
  bidderCode: string;
  date: string;
  jobsReviewed: number;
  proposalsSubmitted: number;
  connectsUsed: number;
  replies: number;
  interviews: number;
  notes?: string;
  updatedAt: string;
}

export interface HeartbeatPayload {
  sessionId: string;
  bidderCode: string;
  timestamp: string;
  isIdle: boolean;
  idleState?: string;
  windowFocused: boolean;
  domain: string;
  subpath: string;
  category: "work_upwork" | "work_other" | "non_work" | "idle";
  upworkSection?: string;
  sliceSeconds: number;
  sessionTotals: {
    clocked: number;
    active: number;
    idle: number;
    upwork: number;
  };
}

export type PerformanceTier = "GOOD" | "WARNING" | "POOR";

export interface PerformanceScoreResult {
  score: number; // 0 - 100
  tier: PerformanceTier;
  upworkRatio: number; // Upwork Active / Total Active (0-100%)
  attendanceScore: number;
  upworkTimeScore: number;
  proposalsScore: number;
  conversionScore: number;
  summary: string;
  recommendations: string[];
}
