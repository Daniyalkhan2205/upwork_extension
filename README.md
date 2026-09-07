# Employee Activity & Bidder Performance Tracker

A complete, production-ready employee tracking and output analytics ecosystem designed specifically for Upwork & Fiverr bidding teams.

## Ecosystem Architecture

```text
┌────────────────────────────────────────────────────────┐
│   Chrome / Edge Extension (Manifest V3 Client Agent)   │
│  - 1-Click Clock In / Clock Out + Shift Duration Timer │
│  - 3-Min Idle Detection via chrome.idle API            │
│  - Context & Domain Engine (Work vs Non-Work)          │
│  - Upwork Sub-Path Isolator (/search, /proposals, etc) │
│  - 1-Minute Heartbeat Telemetry Generator              │
│  - Offline Queue Buffer via chrome.storage.local       │
│  - Instant Webhook Alerts (Telegram Bot / Manager API) │
└───────────────────────────┬────────────────────────────┘
                            │ Telemetry Heartbeats & Events
                            ▼
┌────────────────────────────────────────────────────────┐
│     Next.js + Tailwind CSS Admin Performance Hub       │
│  - Live Floor Monitor (Real-time active bidders)       │
│  - Time Accounting: Clocked vs Active vs Upwork Active │
│  - Upwork Activity Rate: (Upwork Active / Total) * 100 │
│  - Layer 2 Output Tracker: Proposals, Connects, Calls  │
│  - Algorithmic Performance Scoring (GOOD/WARNING/POOR) │
│  - Sub-Path Visualizer & Domain Distribution Charts    │
│  - Supabase PostgreSQL / Zero-Config Embedded Storage  │
└────────────────────────────────────────────────────────┘
```

---

## 1. Quick Start: Running the Admin Dashboard

1. Open terminal in `dashboard/`:
   ```bash
   cd dashboard
   npm run dev
   ```
2. Open your browser at:
   ```text
   http://localhost:3000
   ```
3. The dashboard starts **instantly with zero configuration**! It includes pre-seeded demo bidders (`Alex Mercer`, `Sara Connor`, `Liam Vance`) demonstrating each performance status tier (**GOOD**, **WARNING - Window Shopping/Slacking**, and **POOR - High Idle**).

---

## 2. Installing the Chrome / Edge Extension

1. In Chrome or Microsoft Edge, navigate to `chrome://extensions` or `edge://extensions`.
2. Turn on the **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` folder located at:
   ```text
   d:\upwork_extension\extension
   ```
5. Pin the **BidderFlow** icon to your browser toolbar.
6. Click the extension icon to view the popup:
   - Click **Clock In** to start tracking shift time and send an instant manager alert.
   - The live stopwatch tracks active duration.
   - Current domain and Upwork sub-path are categorized automatically in real time.
   - Inactivity on mouse/keyboard for 3+ minutes triggers `chrome.idle` and pauses work time.
   - If the dashboard is offline, all telemetry heartbeats queue in `chrome.storage.local` and flush automatically upon reconnection.

---

## 3. Database Schema (Supabase / PostgreSQL)

The database schema is defined in [`supabase/schema.sql`](file:///d:/upwork_extension/supabase/schema.sql) and contains:
1. `users`: Stores bidder profile, role, hourly rate, and unique bidder code.
2. `sessions`: Tracks clock in/out shifts, clocked seconds, active seconds, idle seconds, and Upwork active seconds.
3. `domain_logs`: Stores active seconds per domain, sub-path, and category (`work_upwork`, `work_other`, `non_work`, `idle`).
4. `daily_kpis`: Stores output metrics: jobs reviewed, proposals submitted, connects used, replies received, and interviews scheduled.
5. `heartbeat_logs`: High-resolution 1-minute telemetry slices.
6. `webhook_logs`: Telegram and manager notification audit history.

To connect Supabase:
1. Create a project on [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Add your credentials to `dashboard/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 4. Performance Scoring Algorithm & Rules

The performance engine evaluates bidder effectiveness using the formula:
$$\text{Performance Score} = \text{Attendance} + \text{Upwork Active Time} + \text{Proposals Submitted} + \text{Replies/Interviews}$$

### Status Tiers:
- **GOOD (Green)**: High Upwork active focus ($\ge 60\%$) + proportional proposal volume ($\ge 3$ per shift) + healthy client reply conversion.
- **WARNING (Amber)**: High Upwork time ($\ge 2$ hours) but low proposal output ($< 3$ proposals). Flags potential **slacking, window shopping, or slow browsing** on the job search feed without writing proposals.
- **POOR (Red)**: High idle time ($> 40\%$ of shift) or deficient Upwork time ($< 40\%$).

---

## 5. Webhook Notifications (Telegram Bot API)

When bidders clock in or out, an instant notification is dispatched:
- **Direct Telegram**: Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `dashboard/.env.local` or directly in the Extension Popup Settings drawer.
- **In-App Webhook Audit**: Open the **Alerts & Webhooks** modal in the dashboard header to inspect delivered notifications or send a live test dispatch.

---

## 6. Privacy First Architecture
- Zero keylogging or keystroke recording.
- No form input, client chat content, or password capture.
- Only URL host, sanitized sub-path classification, and active/idle seconds are recorded.
