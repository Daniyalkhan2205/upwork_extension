# BidderFlow Client - Chrome / Edge Extension (Manifest V3)

Employee Activity & Bidder Performance Tracker Client Agent.

## Features
- **Session Tracking**: One-click Clock In / Clock Out with real-time shift stopwatch.
- **Instant Webhooks**: Triggers manager alerts via Telegram Bot API or Next.js Webhook endpoint upon Clock In / Out.
- **Domain & Context Categorizer**:
  - Automatically isolates Work sites (`upwork.com`, `fiverr.com`, `linkedin.com`, `mail.google.com`, `docs.google.com`).
  - Flags Non-Work entertainment/social sites (`youtube.com`, `facebook.com`, `instagram.com`, etc.).
  - Isolates Upwork sub-paths: `/nx/search/jobs` (Job Search Feed), `/ab/proposals` (Proposals), `/messages` (Client Chats), `/freelance-jobs` (Job Postings).
- **Active vs. Idle Detection**:
  - 3-minute threshold using `chrome.idle` API. Automatically pauses active work tracking when user is idle for 3+ minutes.
- **1-Minute Heartbeat Interval**: Aggregates time metrics and sends telemetry to the Admin Dashboard.
- **Offline Resiliency**: Automatically buffers heartbeats in `chrome.storage.local` if backend is unreachable, and flushes upon reconnection.
- **Privacy-First**: Zero keylogging, password capture, or chat message recording.

## Installation in Chrome / Microsoft Edge
1. Open Google Chrome or Microsoft Edge.
2. Navigate to `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** toggle in the top right corner.
4. Click the **Load unpacked** button.
5. Select the `extension/` directory from this project (`d:\upwork_extension\extension`).
6. The **BidderFlow** extension is now installed! Pin it to your browser toolbar.

## Connecting to Dashboard
1. By default, the extension points to `http://localhost:3000/api`.
2. Click the extension icon to open the popup.
3. Click the gear icon to customize your **Bidder Code** (e.g. `BIDDER_01`, `BIDDER_02`) or configure direct Telegram webhook tokens.
4. Click **Clock In** to start tracking!
