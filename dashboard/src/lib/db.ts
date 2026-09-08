import { User, Session, DomainLog, DailyKPI, HeartbeatPayload } from "../types/index";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Helper: generate a proper UUID v4 ────────────────────────────────────────
export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Helper: check if string is valid UUID ────────────────────────────────────
export function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// ─── Optional Supabase client initialization ─────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Initial Mock Seed Data ──────────────────────────────────────────────────
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

const initialSessions: Session[] = [
  {
    id: "sess_demo_alex",
    userId: "a0000000-0000-0000-0000-000000000001",
    bidderCode: "BIDDER_01",
    bidderName: "Alex Mercer",
    clockInTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    clockOutTime: null,
    totalClockedSeconds: 18000,
    totalActiveSeconds: 16200,
    totalIdleSeconds: 1800,
    totalUpworkSeconds: 13500,
    totalOtherWorkSeconds: 1800,
    totalNonWorkSeconds: 900,
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
    totalClockedSeconds: 16200,
    totalActiveSeconds: 14400,
    totalIdleSeconds: 1800,
    totalUpworkSeconds: 12600,
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
    totalClockedSeconds: 9000,
    totalActiveSeconds: 4500,
    totalIdleSeconds: 4500,
    totalUpworkSeconds: 2700,
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
    proposalsSubmitted: 2,
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
    proposalsSubmitted: 1,
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
  {
    id: "dom_sara_1",
    sessionId: "sess_demo_sara",
    userId: "a0000000-0000-0000-0000-000000000002",
    domain: "upwork.com",
    subpath: "/nx/search/jobs",
    category: "work_upwork",
    activeSeconds: 10800,
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

// ─── Helper: ensure a user row exists in Supabase for this bidder code ─────────
async function ensureSupabaseUser(
  sb: SupabaseClient,
  bidderCode: string,
  bidderName?: string
): Promise<string | null> {
  const code = bidderCode.toUpperCase().trim();
  try {
    const { data: existing } = await sb
      .from("users")
      .select("id")
      .ilike("bidder_code", code)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const newId = uuidv4();
    const { data: inserted, error: insertErr } = await sb
      .from("users")
      .insert({
        id: newId,
        bidder_code: code,
        name: bidderName || code,
        role: "bidder",
      })
      .select("id")
      .maybeSingle();

    if (insertErr) {
      // Possible race condition with parallel insert
      const { data: retry } = await sb
        .from("users")
        .select("id")
        .ilike("bidder_code", code)
        .maybeSingle();
      if (retry?.id) return retry.id;
      console.warn("Supabase ensureUser error:", insertErr.message);
      return null;
    }
    return inserted?.id || newId;
  } catch (err: any) {
    console.warn("Supabase ensureSupabaseUser exception:", err.message);
    return null;
  }
}

// ─── Helper: seed default bidders into Supabase if missing ───────────────────
let usersSeeded = false;
async function seedDefaultUsersIfEmpty(sb: SupabaseClient) {
  if (usersSeeded) return;
  try {
    for (const u of initialUsers) {
      await ensureSupabaseUser(sb, u.bidderCode, u.name);
    }
    usersSeeded = true;
  } catch (err) {
    console.warn("seedDefaultUsers error:", err);
  }
}

// ─── Persistent runtime store with Supabase sync ─────────────────────────────
class DatabaseStore {
  private users: User[] = [...initialUsers];
  private sessions: Session[] = [...initialSessions];
  private kpis: DailyKPI[] = [...initialKpis];
  private domainLogs: DomainLog[] = [...initialDomainLogs];

  // ── Users ──────────────────────────────────────────────────────────────────
  async getUsers(): Promise<User[]> {
    if (supabase) {
      try {
        await seedDefaultUsersIfEmpty(supabase);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const dbUsers: User[] = data.map((u: any) => ({
            id: u.id,
            bidderCode: u.bidder_code,
            name: u.name,
            email: u.email || `${u.bidder_code.toLowerCase()}@agency.com`,
            role: u.role || "bidder",
            hourlyRate: Number(u.hourly_rate || 0),
            isActive: u.is_active ?? true,
            createdAt: u.created_at || new Date().toISOString(),
          }));
          this.users = dbUsers;
          return dbUsers;
        }
      } catch (e: any) {
        console.warn("Error fetching users from Supabase:", e.message);
      }
    }
    return [...this.users];
  }

  async getUserByCode(code: string): Promise<User | undefined> {
    const memoryMatch = this.users.find(
      (u) => u.bidderCode.toLowerCase() === code.toLowerCase()
    );
    if (memoryMatch) return memoryMatch;

    if (supabase) {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .ilike("bidder_code", code.trim())
          .maybeSingle();
        if (data) {
          const u: User = {
            id: data.id,
            bidderCode: data.bidder_code,
            name: data.name,
            email: data.email || `${data.bidder_code.toLowerCase()}@agency.com`,
            role: data.role || "bidder",
            hourlyRate: Number(data.hourly_rate || 0),
            isActive: data.is_active ?? true,
            createdAt: data.created_at || new Date().toISOString(),
          };
          this.users.push(u);
          return u;
        }
      } catch (e: any) {
        console.warn("Error looking up user by code:", e.message);
      }
    }
    return undefined;
  }

  // ── Sessions ───────────────────────────────────────────────────────────────
  async getSessions(date?: string): Promise<Session[]> {
    if (supabase) {
      try {
        let query = supabase
          .from("sessions")
          .select("*, users!inner(id, bidder_code, name)")
          .order("clock_in_time", { ascending: false });

        if (date) {
          query = query.eq("date", date);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: Session[] = data.map((row: any) => {
            const activeMem = this.sessions.find((m) => m.id === row.id);
            return {
              id: row.id,
              userId: row.user_id,
              bidderCode: row.users?.bidder_code || "BIDDER",
              bidderName: row.users?.name || "Bidder",
              clockInTime: row.clock_in_time,
              clockOutTime: row.clock_out_time,
              totalClockedSeconds: row.total_clocked_seconds || 0,
              totalActiveSeconds: row.total_active_seconds || 0,
              totalIdleSeconds: row.total_idle_seconds || 0,
              totalUpworkSeconds: row.total_upwork_seconds || 0,
              totalOtherWorkSeconds: row.total_other_work_seconds || 0,
              totalNonWorkSeconds: row.total_non_work_seconds || 0,
              date: row.date,
              status: row.status,
              lastActiveDomain: activeMem?.lastActiveDomain || "",
              lastActiveSubpath: activeMem?.lastActiveSubpath || "",
            };
          });

          // Sync into memory cache
          for (const s of mapped) {
            const idx = this.sessions.findIndex((m) => m.id === s.id);
            if (idx >= 0) this.sessions[idx] = s;
            else this.sessions.push(s);
          }

          return mapped;
        }
      } catch (e: any) {
        console.warn("Error fetching sessions from Supabase:", e.message);
      }
    }

    // Fallback to in-memory store
    if (date) {
      return this.sessions.filter((s) => s.date === date);
    }
    return [...this.sessions];
  }

  async getActiveSession(bidderCode: string): Promise<Session | undefined> {
    const memoryActive = this.sessions.find(
      (s) =>
        s.bidderCode.toLowerCase() === bidderCode.toLowerCase() &&
        s.status === "active"
    );
    if (memoryActive) return memoryActive;

    // If not in memory, check Supabase for any open active session
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*, users!inner(id, bidder_code, name)")
          .ilike("users.bidder_code", bidderCode.trim())
          .eq("status", "active")
          .order("clock_in_time", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const restoredSession: Session = {
            id: data.id,
            userId: data.user_id,
            bidderCode: data.users?.bidder_code || bidderCode,
            bidderName: data.users?.name || bidderCode,
            clockInTime: data.clock_in_time,
            clockOutTime: data.clock_out_time,
            totalClockedSeconds: data.total_clocked_seconds || 0,
            totalActiveSeconds: data.total_active_seconds || 0,
            totalIdleSeconds: data.total_idle_seconds || 0,
            totalUpworkSeconds: data.total_upwork_seconds || 0,
            totalOtherWorkSeconds: data.total_other_work_seconds || 0,
            totalNonWorkSeconds: data.total_non_work_seconds || 0,
            date: data.date,
            status: data.status,
            lastActiveDomain: "",
            lastActiveSubpath: "",
          };
          this.sessions.unshift(restoredSession);
          return restoredSession;
        }
      } catch (e: any) {
        console.warn("Supabase getActiveSession lookup error:", e.message);
      }
    }

    return undefined;
  }

  // ── Clock In ───────────────────────────────────────────────────────────────
  async clockIn(sessionData: Partial<Session>): Promise<Session> {
    const bidderCode = sessionData.bidderCode || "BIDDER_01";
    const bidderName = sessionData.bidderName || "Unknown Bidder";
    const clockInTime = sessionData.clockInTime || new Date().toISOString();
    const dateStr = clockInTime.slice(0, 10);

    // End any lingering active sessions for this bidder in memory
    this.sessions.forEach((s) => {
      if (
        s.bidderCode.toLowerCase() === bidderCode.toLowerCase() &&
        s.status === "active"
      ) {
        s.status = "completed";
        s.clockOutTime = new Date().toISOString();
      }
    });

    let userId = "";
    if (supabase) {
      userId = (await ensureSupabaseUser(supabase, bidderCode, bidderName)) || "";
      if (userId) {
        // Also close any previous lingering active sessions in Supabase
        await supabase
          .from("sessions")
          .update({
            status: "completed",
            clock_out_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("status", "active");
      }
    }

    if (!userId) {
      const user = await this.getUserByCode(bidderCode);
      userId = user?.id || uuidv4();
    }

    // Ensure session ID is a valid UUID for Supabase primary key
    const sessionId =
      sessionData.id && isValidUUID(sessionData.id) ? sessionData.id : uuidv4();

    const newSession: Session = {
      id: sessionId,
      userId,
      bidderCode,
      bidderName,
      clockInTime,
      clockOutTime: null,
      totalClockedSeconds: sessionData.totalClockedSeconds || 0,
      totalActiveSeconds: sessionData.totalActiveSeconds || 0,
      totalIdleSeconds: sessionData.totalIdleSeconds || 0,
      totalUpworkSeconds: sessionData.totalUpworkSeconds || 0,
      totalOtherWorkSeconds: sessionData.totalOtherWorkSeconds || 0,
      totalNonWorkSeconds: sessionData.totalNonWorkSeconds || 0,
      date: dateStr,
      status: "active",
      lastActiveDomain: "",
      lastActiveSubpath: "",
    };

    this.sessions.unshift(newSession);

    // Await Supabase insertion
    if (supabase && userId) {
      try {
        const { error } = await supabase.from("sessions").insert({
          id: newSession.id,
          user_id: userId,
          clock_in_time: newSession.clockInTime,
          clock_out_time: null,
          total_clocked_seconds: newSession.totalClockedSeconds,
          total_active_seconds: newSession.totalActiveSeconds,
          total_idle_seconds: newSession.totalIdleSeconds,
          total_upwork_seconds: newSession.totalUpworkSeconds,
          total_other_work_seconds: newSession.totalOtherWorkSeconds,
          total_non_work_seconds: newSession.totalNonWorkSeconds,
          date: newSession.date,
          status: "active",
        });
        if (error) console.warn("Supabase clockIn insert error:", error.message);
        else console.log("✅ Session created & stored in Supabase:", newSession.id);
      } catch (err: any) {
        console.warn("Supabase clockIn exception:", err.message);
      }
    }

    return newSession;
  }

  // ── Clock Out ──────────────────────────────────────────────────────────────
  async clockOut(
    bidderCode: string,
    payload?: Partial<Session>
  ): Promise<Session | null> {
    let session = await this.getActiveSession(bidderCode);

    const clockOutTime = payload?.clockOutTime || new Date().toISOString();

    if (session) {
      session.status = "completed";
      session.clockOutTime = clockOutTime;
      if (payload) {
        if (payload.totalClockedSeconds !== undefined)
          session.totalClockedSeconds = payload.totalClockedSeconds;
        if (payload.totalActiveSeconds !== undefined)
          session.totalActiveSeconds = payload.totalActiveSeconds;
        if (payload.totalIdleSeconds !== undefined)
          session.totalIdleSeconds = payload.totalIdleSeconds;
        if (payload.totalUpworkSeconds !== undefined)
          session.totalUpworkSeconds = payload.totalUpworkSeconds;
        if (payload.totalOtherWorkSeconds !== undefined)
          session.totalOtherWorkSeconds = payload.totalOtherWorkSeconds;
        if (payload.totalNonWorkSeconds !== undefined)
          session.totalNonWorkSeconds = payload.totalNonWorkSeconds;
      }

      // Persist update to Supabase
      if (supabase) {
        try {
          const { error } = await supabase
            .from("sessions")
            .update({
              clock_out_time: session.clockOutTime,
              total_clocked_seconds: session.totalClockedSeconds,
              total_active_seconds: session.totalActiveSeconds,
              total_idle_seconds: session.totalIdleSeconds,
              total_upwork_seconds: session.totalUpworkSeconds,
              total_other_work_seconds: session.totalOtherWorkSeconds,
              total_non_work_seconds: session.totalNonWorkSeconds,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.id);

          if (error) {
            console.warn("Supabase session update error:", error.message);
          } else {
            console.log("✅ Session clockOut updated in Supabase:", session.id);
          }
        } catch (err: any) {
          console.warn("Supabase session update exception:", err.message);
        }
      }

      return session;
    }

    // Fallback: If no active session was found in memory or open in Supabase,
    // but the payload provides shift data, insert it as a completed session
    // so shift history is never dropped!
    if (payload && (payload.clockInTime || payload.totalClockedSeconds !== undefined)) {
      console.log("⚠️ No active session found; creating completed session from payload fallback");
      let userId = "";
      if (supabase) {
        userId = (await ensureSupabaseUser(supabase, bidderCode, payload.bidderName)) || "";
      }
      if (!userId) {
        const u = await this.getUserByCode(bidderCode);
        userId = u?.id || uuidv4();
      }

      const sessionId =
        payload.id && isValidUUID(payload.id) ? payload.id : uuidv4();
      const clockInTime = payload.clockInTime || new Date().toISOString();

      const completedSession: Session = {
        id: sessionId,
        userId,
        bidderCode,
        bidderName: payload.bidderName || bidderCode,
        clockInTime,
        clockOutTime,
        totalClockedSeconds: payload.totalClockedSeconds || 0,
        totalActiveSeconds: payload.totalActiveSeconds || 0,
        totalIdleSeconds: payload.totalIdleSeconds || 0,
        totalUpworkSeconds: payload.totalUpworkSeconds || 0,
        totalOtherWorkSeconds: payload.totalOtherWorkSeconds || 0,
        totalNonWorkSeconds: payload.totalNonWorkSeconds || 0,
        date: clockInTime.slice(0, 10),
        status: "completed",
        lastActiveDomain: "",
        lastActiveSubpath: "",
      };

      this.sessions.unshift(completedSession);

      if (supabase && userId) {
        try {
          await supabase.from("sessions").insert({
            id: completedSession.id,
            user_id: userId,
            clock_in_time: completedSession.clockInTime,
            clock_out_time: completedSession.clockOutTime,
            total_clocked_seconds: completedSession.totalClockedSeconds,
            total_active_seconds: completedSession.totalActiveSeconds,
            total_idle_seconds: completedSession.totalIdleSeconds,
            total_upwork_seconds: completedSession.totalUpworkSeconds,
            total_other_work_seconds: completedSession.totalOtherWorkSeconds,
            total_non_work_seconds: completedSession.totalNonWorkSeconds,
            date: completedSession.date,
            status: "completed",
          });
          console.log("✅ Fallback completed session stored in Supabase:", completedSession.id);
        } catch (err: any) {
          console.warn("Supabase fallback insert exception:", err.message);
        }
      }

      return completedSession;
    }

    return null;
  }

  // ── Heartbeat Telemetry Ingestion ──────────────────────────────────────────
  async applyHeartbeat(packet: HeartbeatPayload): Promise<Session | null> {
    let session = await this.getActiveSession(packet.bidderCode);
    if (!session) {
      // Auto-create session when heartbeat arrives without a prior clock-in
      session = await this.clockIn({ bidderCode: packet.bidderCode });
    }

    session.lastActiveDomain = packet.domain;
    session.lastActiveSubpath = packet.subpath;

    if (packet.sessionTotals) {
      session.totalClockedSeconds = packet.sessionTotals.clocked;
      session.totalActiveSeconds = packet.sessionTotals.active;
      session.totalIdleSeconds = packet.sessionTotals.idle;
      session.totalUpworkSeconds = packet.sessionTotals.upwork;
    } else {
      const slice = packet.sliceSeconds || 60;
      session.totalClockedSeconds += slice;
      if (packet.isIdle) {
        session.totalIdleSeconds += slice;
      } else {
        session.totalActiveSeconds += slice;
        if (packet.category === "work_upwork") session.totalUpworkSeconds += slice;
        else if (packet.category === "work_other")
          session.totalOtherWorkSeconds = (session.totalOtherWorkSeconds || 0) + slice;
        else session.totalNonWorkSeconds = (session.totalNonWorkSeconds || 0) + slice;
      }
    }

    // Mathematical safety bounds
    if (session.totalClockedSeconds > 0) {
      session.totalActiveSeconds = Math.min(
        session.totalActiveSeconds,
        session.totalClockedSeconds
      );
      session.totalIdleSeconds = Math.min(
        session.totalIdleSeconds,
        session.totalClockedSeconds
      );
      session.totalUpworkSeconds = Math.min(
        session.totalUpworkSeconds,
        session.totalActiveSeconds
      );
    }

    // Persist updated session totals to Supabase
    if (supabase && session.userId) {
      try {
        await supabase
          .from("sessions")
          .update({
            total_clocked_seconds: session.totalClockedSeconds,
            total_active_seconds: session.totalActiveSeconds,
            total_idle_seconds: session.totalIdleSeconds,
            total_upwork_seconds: session.totalUpworkSeconds,
            total_other_work_seconds: session.totalOtherWorkSeconds || 0,
            total_non_work_seconds: session.totalNonWorkSeconds || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.id);
      } catch (err: any) {
        console.warn("Supabase heartbeat session update exception:", err.message);
      }
    }

    // ── Domain log ─────────────────────────────────────────────────────────
    if (
      packet.domain &&
      packet.domain !== "no_tab" &&
      packet.domain !== "browser_internal"
    ) {
      const existing = this.domainLogs.find(
        (dl) =>
          dl.sessionId === session!.id &&
          dl.domain === packet.domain &&
          dl.subpath === (packet.subpath || "")
      );

      if (existing) {
        existing.activeSeconds += packet.sliceSeconds || 60;
        if (supabase) {
          try {
            await supabase
              .from("domain_logs")
              .update({ active_seconds: existing.activeSeconds, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          } catch (e: any) {
            console.warn("Supabase domain_log update exception:", e.message);
          }
        }
      } else {
        const newDomLog: DomainLog = {
          id: uuidv4(),
          sessionId: session.id,
          userId: session.userId,
          domain: packet.domain,
          subpath: packet.subpath || "",
          category: packet.category || "non_work",
          activeSeconds: packet.sliceSeconds || 60,
          date: session.date,
        };
        this.domainLogs.push(newDomLog);

        if (supabase && session.userId) {
          try {
            await supabase.from("domain_logs").insert({
              id: newDomLog.id,
              session_id: newDomLog.sessionId,
              user_id: newDomLog.userId,
              domain: newDomLog.domain,
              subpath: newDomLog.subpath,
              category: newDomLog.category,
              active_seconds: newDomLog.activeSeconds,
              date: newDomLog.date,
            });
          } catch (e: any) {
            console.warn("Supabase domain_logs insert exception:", e.message);
          }
        }
      }
    }

    // ── Insert a heartbeat_logs row ─────────────────────────────────────────
    if (supabase && session.userId) {
      try {
        await supabase.from("heartbeat_logs").insert({
          id: uuidv4(),
          session_id: session.id,
          user_id: session.userId,
          timestamp: packet.timestamp || new Date().toISOString(),
          is_idle: packet.isIdle ?? false,
          active_domain: packet.domain,
          active_subpath: packet.subpath,
          category: packet.category,
          active_seconds_slice: packet.sliceSeconds || 60,
        });
      } catch (err: any) {
        console.warn("Supabase heartbeat_logs insert exception:", err.message);
      }
    }

    return session;
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  async getKpis(date?: string, bidderCode?: string): Promise<DailyKPI[]> {
    if (supabase) {
      try {
        let query = supabase.from("daily_kpis").select("*, users!inner(bidder_code)");
        if (date) query = query.eq("date", date);
        if (bidderCode) query = query.ilike("users.bidder_code", bidderCode.trim());

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((k: any) => ({
            id: k.id,
            userId: k.user_id,
            bidderCode: k.users?.bidder_code || "",
            date: k.date,
            jobsReviewed: k.jobs_reviewed || 0,
            proposalsSubmitted: k.proposals_submitted || 0,
            connectsUsed: k.connects_used || 0,
            replies: k.replies || 0,
            interviews: k.interviews || 0,
            notes: k.notes || "",
            updatedAt: k.updated_at || new Date().toISOString(),
          }));
        }
      } catch (e: any) {
        console.warn("Error fetching kpis from Supabase:", e.message);
      }
    }

    let list = [...this.kpis];
    if (date) list = list.filter((k) => k.date === date);
    if (bidderCode)
      list = list.filter((k) => k.bidderCode.toLowerCase() === bidderCode.toLowerCase());
    return list;
  }

  async saveKpi(entry: Omit<DailyKPI, "id" | "updatedAt">): Promise<DailyKPI> {
    const existingIndex = this.kpis.findIndex(
      (k) =>
        k.bidderCode.toLowerCase() === entry.bidderCode.toLowerCase() &&
        k.date === entry.date
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

    if (supabase) {
      try {
        const userId = await ensureSupabaseUser(
          supabase,
          entry.bidderCode,
          entry.bidderCode
        );
        if (userId) {
          const { error } = await supabase.from("daily_kpis").upsert(
            {
              user_id: userId,
              date: fullEntry.date,
              jobs_reviewed: fullEntry.jobsReviewed,
              proposals_submitted: fullEntry.proposalsSubmitted,
              connects_used: fullEntry.connectsUsed,
              replies: fullEntry.replies,
              interviews: fullEntry.interviews,
              notes: fullEntry.notes || "",
              updated_at: fullEntry.updatedAt,
            },
            { onConflict: "user_id,date" }
          );
          if (error) console.warn("Supabase daily_kpis upsert error:", error.message);
          else console.log("✅ KPI saved to Supabase for", entry.bidderCode);
        }
      } catch (err: any) {
        console.warn("Supabase saveKpi exception:", err.message);
      }
    }

    return fullEntry;
  }

  // ── Domain logs ────────────────────────────────────────────────────────────
  async getDomainLogs(date?: string, bidderCode?: string): Promise<DomainLog[]> {
    if (supabase) {
      try {
        let query = supabase.from("domain_logs").select("*, users!inner(bidder_code)");
        if (date) query = query.eq("date", date);
        if (bidderCode) query = query.ilike("users.bidder_code", bidderCode.trim());

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            sessionId: d.session_id,
            userId: d.user_id,
            domain: d.domain,
            subpath: d.subpath || "",
            category: d.category,
            activeSeconds: d.active_seconds || 0,
            date: d.date,
          }));
        }
      } catch (e: any) {
        console.warn("Error fetching domain logs from Supabase:", e.message);
      }
    }

    let list = [...this.domainLogs];
    if (date) list = list.filter((d) => d.date === date);
    if (bidderCode) {
      const user = await this.getUserByCode(bidderCode);
      if (user) list = list.filter((d) => d.userId === user.id);
    }
    return list;
  }
}

// Global singleton
const globalForDb = globalThis as unknown as { dbStore?: DatabaseStore };
export const db = globalForDb.dbStore || new DatabaseStore();
if (process.env.NODE_ENV !== "production") globalForDb.dbStore = db;
