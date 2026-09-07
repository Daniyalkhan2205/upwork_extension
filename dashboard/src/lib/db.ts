import { User, Session, DomainLog, DailyKPI, HeartbeatPayload } from "../types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Helper: generate a proper UUID v4 ────────────────────────────────────────
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Helper: ensure a user row exists in Supabase for this bidder code ─────────
async function ensureSupabaseUser(
  sb: SupabaseClient,
  bidderCode: string,
  bidderName?: string
): Promise<string | null> {
  const { data: existing } = await sb
    .from("users")
    .select("id")
    .eq("bidder_code", bidderCode.toUpperCase())
    .single();

  if (existing?.id) return existing.id;

  const newId = uuidv4();
  const { error } = await sb.from("users").insert({
    id: newId,
    bidder_code: bidderCode.toUpperCase(),
    name: bidderName || bidderCode,
    role: "bidder",
  });
  if (error) { console.warn("Supabase ensureUser:", error.message); return null; }
  return newId;
}

// Optional Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initial Mock Seed Data
const initialUsers: User[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    bidderCode: "BIDDER_01",
    name: "Alex Mercer",
    email: "alex.bidder@agency.com",
    role: "bidder",
    hourlyRate: 15.0,
    isActive: true,
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    bidderCode: "BIDDER_02",
    name: "Sara Connor",
    email: "sara.bidder@agency.com",
    role: "bidder",
    hourlyRate: 16.5,
    isActive: true,
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    bidderCode: "BIDDER_03",
    name: "Liam Vance",
    email: "liam.bidder@agency.com",
    role: "bidder",
    hourlyRate: 14.0,
    isActive: true,
    createdAt: "2026-02-10T08:00:00Z",
  },
];

const todayStr = new Date().toISOString().slice(0, 10);

// Seed sessions for demo:
// Alex Mercer: Healthy active shift with high Upwork time and good proposals (GOOD)
// Sara Connor: High Upwork time but few proposals (WARNING - potential slacking/browsing)
// Liam Vance: High idle time and few proposals (POOR)
const initialSessions: Session[] = [
  {
    id: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    bidderCode: "BIDDER_01",
    bidderName: "Alex Mercer",
    clockInTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    clockOutTime: null,
    totalClockedSeconds: 18000, // 5 hours
    totalActiveSeconds: 16200,  // 4.5 hours active
    totalIdleSeconds: 1800,     // 30 mins idle
    totalUpworkSeconds: 13500,  // ~3.75 hours on Upwork (83% of active)
    totalOtherWorkSeconds: 1800,// 30 mins
    totalNonWorkSeconds: 900,   // 15 mins
    date: todayStr,
    status: "active",
    lastActiveDomain: "upwork.com",
    lastActiveSubpath: "/ab/proposals",
  },
  {
    id: "sess_demo_sara",
    userId: "a0000000-0000-0000-0000-000000000002",
    bidderCode: "BIDDER_02",
    bidderName: "Sara Connor",
    clockInTime: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    clockOutTime: null,
    totalClockedSeconds: 16200, // 4.5 hours
    totalActiveSeconds: 14400,  // 4 hours active
    totalIdleSeconds: 1800,     // 30 mins idle
    totalUpworkSeconds: 12600,  // 3.5 hours on Upwork (87% of active)
    totalOtherWorkSeconds: 1200,
    totalNonWorkSeconds: 600,
    date: todayStr,
    status: "active",
    lastActiveDomain: "upwork.com",
    lastActiveSubpath: "/nx/search/jobs",
  },
  {
    id: "sess_demo_liam",
    userId: "a0000000-0000-0000-0000-000000000003",
    bidderCode: "BIDDER_03",
    bidderName: "Liam Vance",
    clockInTime: new Date(Date.now() - 3 * 3600000).toISOString(),
    clockOutTime: new Date(Date.now() - 30 * 60000).toISOString(),
    totalClockedSeconds: 9000,  // 2.5 hours
    totalActiveSeconds: 4500,   // 1.25 hours active
    totalIdleSeconds: 4500,     // 1.25 hours idle (50% idle!)
    totalUpworkSeconds: 2700,   // 45 mins on Upwork
    totalOtherWorkSeconds: 900,
    totalNonWorkSeconds: 900,
    date: todayStr,
    status: "completed",
    lastActiveDomain: "youtube.com",
    lastActiveSubpath: "/watch",
  },
];

const initialKpis: DailyKPI[] = [
  {
    id: "kpi_alex_today",
    userId: "a0000000-0000-0000-0000-000000000001",
    bidderCode: "BIDDER_01",
    date: todayStr,
    jobsReviewed: 45,
    proposalsSubmitted: 8,
    connectsUsed: 48,
    replies: 3,
    interviews: 2,
    notes: "High conversion on Next.js, React, and Fullstack bidding feeds.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kpi_sara_today",
    userId: "a0000000-0000-0000-0000-000000000002",
    bidderCode: "BIDDER_02",
    date: todayStr,
    jobsReviewed: 72,
    proposalsSubmitted: 2, // Low proposals despite 3.5 hrs on Upwork -> WARNING
    connectsUsed: 16,
    replies: 0,
    interviews: 0,
    notes: "High jobs reviewed count; excessive time reading without applying.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kpi_liam_today",
    userId: "a0000000-0000-0000-0000-000000000003",
    bidderCode: "BIDDER_03",
    date: todayStr,
    jobsReviewed: 14,
    proposalsSubmitted: 1, // High idle time -> POOR
    connectsUsed: 8,
    replies: 0,
    interviews: 0,
    notes: "Reported internet lag; shift closed early.",
    updatedAt: new Date().toISOString(),
  },
];

const initialDomainLogs: DomainLog[] = [
  {
    id: "dom_alex_1",
    sessionId: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    domain: "upwork.com",
    subpath: "/nx/search/jobs",
    category: "work_upwork",
    activeSeconds: 5400,
    date: todayStr,
  },
  {
    id: "dom_alex_2",
    sessionId: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    domain: "upwork.com",
    subpath: "/ab/proposals",
    category: "work_upwork",
    activeSeconds: 5400,
    date: todayStr,
  },
  {
    id: "dom_alex_3",
    sessionId: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    domain: "upwork.com",
    subpath: "/messages",
    category: "work_upwork",
    activeSeconds: 2700,
    date: todayStr,
  },
  {
    id: "dom_alex_4",
    sessionId: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    domain: "docs.google.com",
    subpath: "/document",
    category: "work_other",
    activeSeconds: 1800,
    date: todayStr,
  },
  // Sara's logs: heavily skewed toward browsing search jobs
  {
    id: "dom_sara_1",
    sessionId: "sess_demo_sara",
    userId: "a0000000-0000-0000-0000-000000000002",
    domain: "upwork.com",
    subpath: "/nx/search/jobs",
    category: "work_upwork",
    activeSeconds: 10800, // 3 hours window shopping!
    date: todayStr,
  },
  {
    id: "dom_sara_2",
    sessionId: "sess_demo_sara",
    userId: "a0000000-0000-0000-0000-000000000002",
    domain: "upwork.com",
    subpath: "/ab/proposals",
    category: "work_upwork",
    activeSeconds: 1800,
    date: todayStr,
  },
];

// Persistent runtime store for zero-config operation
class DatabaseStore {
  private users: User[] = [...initialUsers];
  private sessions: Session[] = [...initialSessions];
  private kpis: DailyKPI[] = [...initialKpis];
  private domainLogs: DomainLog[] = [...initialDomainLogs];

  // Users
  getUsers(): User[] {
    return [...this.users];
  }

  getUserByCode(code: string): User | undefined {
    return this.users.find((u) => u.bidderCode.toLowerCase() === code.toLowerCase());
  }

  // Sessions
  getSessions(date?: string): Session[] {
    if (date) {
      return this.sessions.filter((s) => s.date === date);
    }
    return [...this.sessions];
  }

  getActiveSession(bidderCode: string): Session | undefined {
    return this.sessions.find(
      (s) => s.bidderCode.toLowerCase() === bidderCode.toLowerCase() && s.status === "active"
    );
  }

  clockIn(sessionData: Partial<Session>): Session {
    // End any lingering active sessions for this bidder
    this.sessions.forEach((s) => {
      if (s.bidderCode.toLowerCase() === (sessionData.bidderCode || "").toLowerCase() && s.status === "active") {
        s.status = "completed";
        s.clockOutTime = new Date().toISOString();
      }
    });

    const user = this.getUserByCode(sessionData.bidderCode || "BIDDER_01");

    // Always use a proper UUID — Supabase requires UUID primary keys
    const sessionId = uuidv4();
    const newSession: Session = {
      id: sessionId,
      userId: user?.id || "",           // will be updated after Supabase lookup
      bidderCode: sessionData.bidderCode || "BIDDER_01",
      bidderName: sessionData.bidderName || user?.name || "Unknown Bidder",
      clockInTime: sessionData.clockInTime || new Date().toISOString(),
      clockOutTime: null,
      totalClockedSeconds: 0,
      totalActiveSeconds: 0,
      totalIdleSeconds: 0,
      totalUpworkSeconds: 0,
      totalOtherWorkSeconds: 0,
      totalNonWorkSeconds: 0,
      date: new Date().toISOString().slice(0, 10),
      status: "active",
      lastActiveDomain: "",
      lastActiveSubpath: "",
    };

    this.sessions.unshift(newSession);

    // ✅ Async write to Supabase — auto-create user row if unknown bidder code
    if (supabase) {
      (async () => {
        const sb = supabase!;
        const userId = await ensureSupabaseUser(
          sb,
          newSession.bidderCode,
          newSession.bidderName
        );
        if (!userId) return;
        newSession.userId = userId; // update in-memory reference

        const { error } = await sb.from("sessions").insert({
          id: newSession.id,
          user_id: userId,
          clock_in_time: newSession.clockInTime,
          clock_out_time: null,
          total_clocked_seconds: 0,
          total_active_seconds: 0,
          total_idle_seconds: 0,
          total_upwork_seconds: 0,
          total_other_work_seconds: 0,
          total_non_work_seconds: 0,
          date: newSession.date,
          status: "active",
        });
        if (error) console.warn("Supabase clockIn insert:", error.message);
        else console.log("✅ Session created in Supabase:", newSession.id);
      })();
    }

    return newSession;
  }

  clockOut(bidderCode: string, payload?: Partial<Session>): Session | null {
    const session = this.getActiveSession(bidderCode);
    if (!session) return null;

    session.status = "completed";
    session.clockOutTime = new Date().toISOString();
    if (payload) {
      if (payload.totalClockedSeconds !== undefined) session.totalClockedSeconds = payload.totalClockedSeconds;
      if (payload.totalActiveSeconds !== undefined) session.totalActiveSeconds = payload.totalActiveSeconds;
      if (payload.totalIdleSeconds !== undefined) session.totalIdleSeconds = payload.totalIdleSeconds;
      if (payload.totalUpworkSeconds !== undefined) session.totalUpworkSeconds = payload.totalUpworkSeconds;
      if (payload.totalOtherWorkSeconds !== undefined) session.totalOtherWorkSeconds = payload.totalOtherWorkSeconds;
      if (payload.totalNonWorkSeconds !== undefined) session.totalNonWorkSeconds = payload.totalNonWorkSeconds;
    }

    if (supabase) {
      supabase.from("sessions").update({
        clock_out_time: session.clockOutTime,
        total_clocked_seconds: session.totalClockedSeconds,
        total_active_seconds: session.totalActiveSeconds,
        total_idle_seconds: session.totalIdleSeconds,
        total_upwork_seconds: session.totalUpworkSeconds,
        total_other_work_seconds: session.totalOtherWorkSeconds,
        total_non_work_seconds: session.totalNonWorkSeconds,
        status: session.status,
      }).eq("id", session.id).then(({ error }) => {
        if (error) console.warn("Supabase session update:", error.message);
      });
    }

    return session;
  }

  // ── Heartbeat Telemetry Ingestion ──────────────────────────────────────────
  applyHeartbeat(packet: HeartbeatPayload): Session | null {
    let session = this.getActiveSession(packet.bidderCode);
    if (!session) {
      // Auto-create session when heartbeat arrives without a prior clock-in
      session = this.clockIn({ bidderCode: packet.bidderCode });
    }

    session.lastActiveDomain = packet.domain;
    session.lastActiveSubpath = packet.subpath;

    if (packet.sessionTotals) {
      session.totalClockedSeconds = packet.sessionTotals.clocked;
      session.totalActiveSeconds  = packet.sessionTotals.active;
      session.totalIdleSeconds    = packet.sessionTotals.idle;
      session.totalUpworkSeconds  = packet.sessionTotals.upwork;
    } else {
      const slice = packet.sliceSeconds || 60;
      session.totalClockedSeconds += slice;
      if (packet.isIdle) {
        session.totalIdleSeconds += slice;
      } else {
        session.totalActiveSeconds += slice;
        if (packet.category === "work_upwork") session.totalUpworkSeconds += slice;
        else if (packet.category === "work_other") session.totalOtherWorkSeconds = (session.totalOtherWorkSeconds || 0) + slice;
        else session.totalNonWorkSeconds = (session.totalNonWorkSeconds || 0) + slice;
      }
    }

    // Mathematical safety bounds: sub-metrics can never exceed total clocked duration
    if (session.totalClockedSeconds > 0) {
      session.totalActiveSeconds = Math.min(session.totalActiveSeconds, session.totalClockedSeconds);
      session.totalIdleSeconds   = Math.min(session.totalIdleSeconds, session.totalClockedSeconds);
      session.totalUpworkSeconds = Math.min(session.totalUpworkSeconds, session.totalActiveSeconds);
    }

    // ✅ Persist updated session totals to Supabase on every heartbeat tick
    if (supabase && session.userId) {
      supabase
        .from("sessions")
        .update({
          total_clocked_seconds:    session.totalClockedSeconds,
          total_active_seconds:     session.totalActiveSeconds,
          total_idle_seconds:       session.totalIdleSeconds,
          total_upwork_seconds:     session.totalUpworkSeconds,
          total_other_work_seconds: session.totalOtherWorkSeconds || 0,
          total_non_work_seconds:   session.totalNonWorkSeconds   || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id)
        .then(({ error }) => {
          if (error) console.warn("Supabase heartbeat session update:", error.message);
        });
    }

    // ── Domain log ─────────────────────────────────────────────────────────
    if (packet.domain && packet.domain !== "no_tab" && packet.domain !== "browser_internal") {
      const existing = this.domainLogs.find(
        (dl) =>
          dl.sessionId === session!.id &&
          dl.domain    === packet.domain &&
          dl.subpath   === (packet.subpath || "")
      );

      if (existing) {
        existing.activeSeconds += packet.sliceSeconds || 60;
        // ✅ Update existing row in Supabase too
        if (supabase) {
          supabase
            .from("domain_logs")
            .update({ active_seconds: existing.activeSeconds })
            .eq("id", existing.id)
            .then(({ error }) => {
              if (error) console.warn("Supabase domain_log update:", error.message);
            });
        }
      } else {
        const newDomLog: DomainLog = {
          id:            uuidv4(),            // ✅ proper UUID
          sessionId:    session.id,
          userId:       session.userId,
          domain:       packet.domain,
          subpath:      packet.subpath || "",
          category:     packet.category || "non_work",
          activeSeconds: packet.sliceSeconds || 60,
          date:         session.date,
        };
        this.domainLogs.push(newDomLog);

        if (supabase && session.userId) {
          supabase
            .from("domain_logs")
            .insert({
              id:             newDomLog.id,
              session_id:     newDomLog.sessionId,
              user_id:        newDomLog.userId,
              domain:         newDomLog.domain,
              subpath:        newDomLog.subpath,
              category:       newDomLog.category,
              active_seconds: newDomLog.activeSeconds,
              date:           newDomLog.date,
            })
            .then(({ error }) => {
              if (error) console.warn("Supabase domain_logs insert:", error.message);
            });
        }
      }
    }

    // ✅ Insert a heartbeat_logs row per minute tick
    if (supabase && session.userId) {
      supabase
        .from("heartbeat_logs")
        .insert({
          session_id:           session.id,
          user_id:              session.userId,
          timestamp:            packet.timestamp || new Date().toISOString(),
          is_idle:              packet.isIdle ?? false,
          active_domain:        packet.domain,
          active_subpath:       packet.subpath,
          category:             packet.category,
          active_seconds_slice: packet.sliceSeconds || 60,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase heartbeat_logs insert:", error.message);
        });
    }

    return session;
  }

  // KPIs
  getKpis(date?: string, bidderCode?: string): DailyKPI[] {
    let list = [...this.kpis];
    if (date) list = list.filter((k) => k.date === date);
    if (bidderCode) list = list.filter((k) => k.bidderCode.toLowerCase() === bidderCode.toLowerCase());
    return list;
  }

  saveKpi(entry: Omit<DailyKPI, "id" | "updatedAt">): DailyKPI {
    const existingIndex = this.kpis.findIndex(
      (k) => k.bidderCode.toLowerCase() === entry.bidderCode.toLowerCase() && k.date === entry.date
    );

    const fullEntry: DailyKPI = {
      ...entry,
      id: existingIndex >= 0 ? this.kpis[existingIndex].id : "kpi_" + Date.now(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.kpis[existingIndex] = fullEntry;
    } else {
      this.kpis.unshift(fullEntry);
    }

    // ✅ Use ensureSupabaseUser so the real user_id is always resolved
    if (supabase) {
      (async () => {
        const sb = supabase!;
        const userId = await ensureSupabaseUser(sb, entry.bidderCode, entry.bidderCode);
        if (!userId) return;
        const { error } = await sb.from("daily_kpis").upsert({
          user_id:             userId,
          date:                fullEntry.date,
          jobs_reviewed:       fullEntry.jobsReviewed,
          proposals_submitted: fullEntry.proposalsSubmitted,
          connects_used:       fullEntry.connectsUsed,
          replies:             fullEntry.replies,
          interviews:          fullEntry.interviews,
          notes:               fullEntry.notes || "",
          updated_at:          fullEntry.updatedAt,
        }, { onConflict: "user_id,date" });
        if (error) console.warn("Supabase daily_kpis upsert:", error.message);
        else console.log("✅ KPI saved to Supabase for", entry.bidderCode);
      })();
    }

    return fullEntry;
  }

  // Domain logs
  getDomainLogs(date?: string, bidderCode?: string): DomainLog[] {
    let list = [...this.domainLogs];
    if (date) list = list.filter((d) => d.date === date);
    if (bidderCode) {
      const user = this.getUserByCode(bidderCode);
      if (user) list = list.filter((d) => d.userId === user.id);
    }
    return list;
  }
}

// Global singleton
const globalForDb = globalThis as unknown as { dbStore?: DatabaseStore };
export const db = globalForDb.dbStore || new DatabaseStore();
if (process.env.NODE_ENV !== "production") globalForDb.dbStore = db;
