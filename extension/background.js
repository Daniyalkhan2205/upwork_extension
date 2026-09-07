/**
 * Background Service Worker for Bidder Activity & Performance Tracker
 * Manifest V3 - Chrome & Edge
 */

const DEFAULT_CONFIG = {
  apiBaseUrl: "http://localhost:3000/api",
  bidderCode: "BIDDER_01",
  bidderName: "Alex Mercer",
  telegramBotToken: "",
  telegramChatId: "",
  idleThresholdSeconds: 180, // 3 minutes
};

const WORK_DOMAINS = [
  "upwork.com",
  "fiverr.com",
  "linkedin.com",
  "mail.google.com",
  "docs.google.com",
  "drive.google.com",
  "sheets.google.com"
];

const NON_WORK_DOMAINS = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "reddit.com",
  "tiktok.com",
  "netflix.com",
  "twitch.tv",
  "pinterest.com",
  "amazon.com"
];

// Initialize extension defaults on install
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(["config", "session", "offlineQueue", "todayMetrics"]);
  if (!current.config) {
    await chrome.storage.local.set({ config: DEFAULT_CONFIG });
  }
  if (!current.offlineQueue) {
    await chrome.storage.local.set({ offlineQueue: [] });
  }
  if (!current.todayMetrics) {
    await chrome.storage.local.set({
      todayMetrics: {
        date: new Date().toISOString().slice(0, 10),
        clockedSeconds: 0,
        activeSeconds: 0,
        idleSeconds: 0,
        upworkSeconds: 0,
        otherWorkSeconds: 0,
        nonWorkSeconds: 0,
        subpathBreakdown: {
          searchJobs: 0,
          proposals: 0,
          messages: 0,
          jobDetails: 0,
          otherUpwork: 0
        }
      }
    });
  }

  // Set idle detection interval to 3 minutes (180 seconds)
  try {
    chrome.idle.setDetectionInterval(DEFAULT_CONFIG.idleThresholdSeconds);
  } catch (err) {
    console.warn("Could not set idle interval:", err);
  }

  console.log("Bidder Activity Tracker initialized.");
});

// Setup 1-minute alarm for periodic telemetry heartbeat
chrome.alarms.create("HEARTBEAT_ALARM", {
  periodInMinutes: 1
});

// Listen to alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "HEARTBEAT_ALARM") {
    await processHeartbeatInterval();
  }
});

// Listen to idle state changes
chrome.idle.onStateChanged.addListener(async (newState) => {
  console.log("Idle state changed to:", newState);
  await chrome.storage.local.set({ currentIdleState: newState });
});

// Immediately update cached active context when user switches tabs or navigates
chrome.tabs.onActivated.addListener(async () => {
  await getActiveContext();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    await getActiveContext();
  }
});

/**
 * Categorize domain and isolate Upwork sub-paths
 * Privacy first: No query parameters, passwords, or text content stored.
 */
function categorizeUrl(rawUrl) {
  if (!rawUrl || rawUrl.startsWith("chrome://") || rawUrl.startsWith("edge://") || rawUrl.startsWith("about:")) {
    return {
      domain: "browser_internal",
      subpath: "",
      category: "idle",
      upworkSection: null
    };
  }

  try {
    const urlObj = new URL(rawUrl);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = urlObj.pathname.toLowerCase();

    // Check for Upwork
    if (hostname.includes("upwork.com")) {
      let upworkSection = "otherUpwork";
      let cleanSubpath = pathname;

      if (pathname.includes("/nx/search/jobs") || pathname.includes("/nx/find-work")) {
        upworkSection = "searchJobs";
        cleanSubpath = "/nx/search/jobs";
      } else if (pathname.includes("/ab/proposals") || pathname.includes("/proposals")) {
        upworkSection = "proposals";
        cleanSubpath = "/ab/proposals";
      } else if (pathname.includes("/messages") || pathname.includes("/rooms")) {
        upworkSection = "messages";
        cleanSubpath = "/messages";
      } else if (pathname.includes("/freelance-jobs") || pathname.includes("/jobs/~")) {
        upworkSection = "jobDetails";
        cleanSubpath = "/freelance-jobs";
      } else if (pathname.includes("/nx/wm/workroom")) {
        upworkSection = "workroom";
        cleanSubpath = "/nx/wm/workroom";
      }

      return {
        domain: "upwork.com",
        subpath: cleanSubpath,
        category: "work_upwork",
        upworkSection
      };
    }

    // Check for other Work Domains
    const isOtherWork = WORK_DOMAINS.some(d => hostname.endsWith(d));
    if (isOtherWork) {
      return {
        domain: hostname,
        subpath: pathname.slice(0, 100),
        category: "work_other",
        upworkSection: null
      };
    }

    // Check for Non-Work Domains
    const isNonWork = NON_WORK_DOMAINS.some(d => hostname.endsWith(d));
    if (isNonWork) {
      return {
        domain: hostname,
        subpath: pathname.slice(0, 100),
        category: "non_work",
        upworkSection: null
      };
    }

    // Default neutral/other
    return {
      domain: hostname,
      subpath: pathname.slice(0, 100),
      category: "non_work",
      upworkSection: null
    };
  } catch (err) {
    return {
      domain: "unknown",
      subpath: "",
      category: "non_work",
      upworkSection: null
    };
  }
}

/**
 * Retrieve active tab & window focus
 * Accurately finds the active tab in the user's primary browser window,
 * preventing false "window_unfocused" when inspecting the popup or working.
 */
async function getActiveContext() {
  try {
    // 1. Get all normal browser windows
    const normalWindows = await chrome.windows.getAll({ windowTypes: ["normal"], populate: true });

    // Find the focused normal window, or the most recent normal window
    let targetWindow = normalWindows.find((w) => w.focused);
    if (!targetWindow && normalWindows.length > 0) {
      targetWindow = normalWindows[0];
    }

    if (targetWindow && targetWindow.tabs && targetWindow.tabs.length > 0) {
      // Find the active tab in this browser window
      const activeTab = targetWindow.tabs.find((t) => t.active) || targetWindow.tabs[0];
      if (activeTab && activeTab.url) {
        const cat = categorizeUrl(activeTab.url);
        return {
          isWindowFocused: true,
          url: activeTab.url,
          ...cat,
        };
      }
    }

    // 2. Fallback: query active tab across any window
    const tabs = await chrome.tabs.query({ active: true });
    const validTab = tabs.find((t) => t.url && !t.url.startsWith("chrome-extension://")) || tabs[0];
    if (validTab && validTab.url) {
      const cat = categorizeUrl(validTab.url);
      return {
        isWindowFocused: true,
        url: validTab.url,
        ...cat,
      };
    }

    return {
      isWindowFocused: true,
      url: "",
      category: "idle",
      domain: "no_tab",
      subpath: "",
    };
  } catch (err) {
    console.warn("Failed to get active context:", err);
    return {
      isWindowFocused: true,
      url: "",
      category: "idle",
      domain: "unknown",
      subpath: "",
    };
  }
}

/**
 * 1-Minute Heartbeat telemetry engine
 */
async function processHeartbeatInterval() {
  const store = await chrome.storage.local.get(["session", "config", "todayMetrics", "offlineQueue"]);
  const session = store.session;

  // If user is not clocked in, do not log session metrics
  if (!session || session.status !== "active") {
    return;
  }

  const config = store.config || DEFAULT_CONFIG;
  const todayMetrics = store.todayMetrics || {
    date: new Date().toISOString().slice(0, 10),
    clockedSeconds: 0,
    activeSeconds: 0,
    idleSeconds: 0,
    upworkSeconds: 0,
    otherWorkSeconds: 0,
    nonWorkSeconds: 0,
    subpathBreakdown: { searchJobs: 0, proposals: 0, messages: 0, jobDetails: 0, otherUpwork: 0 }
  };

  // Reset daily metrics if date changed
  const todayStr = new Date().toISOString().slice(0, 10);
  if (todayMetrics.date !== todayStr) {
    todayMetrics.date = todayStr;
    todayMetrics.clockedSeconds = 0;
    todayMetrics.activeSeconds = 0;
    todayMetrics.idleSeconds = 0;
    todayMetrics.upworkSeconds = 0;
    todayMetrics.otherWorkSeconds = 0;
    todayMetrics.nonWorkSeconds = 0;
    todayMetrics.subpathBreakdown = { searchJobs: 0, proposals: 0, messages: 0, jobDetails: 0, otherUpwork: 0 };
  }

  // Check idle state via chrome.idle queryState (180 seconds threshold)
  const idleThreshold = config.idleThresholdSeconds || 180;
  const idleState = await new Promise((resolve) => {
    chrome.idle.queryState(idleThreshold, (state) => resolve(state));
  });

  const isIdle = idleState === "idle" || idleState === "locked";
  const context = await getActiveContext();

  // 1 heartbeat slice = 60 seconds
  const SLICE_SECONDS = 60;
  todayMetrics.clockedSeconds += SLICE_SECONDS;
  session.totalClockedSeconds = (session.totalClockedSeconds || 0) + SLICE_SECONDS;

  let effectiveCategory = context.category;

  // Idle is determined strictly by chrome.idle API (3-minute inactivity threshold)
  if (isIdle) {
    todayMetrics.idleSeconds += SLICE_SECONDS;
    session.totalIdleSeconds = (session.totalIdleSeconds || 0) + SLICE_SECONDS;
    effectiveCategory = "idle";
  } else {
    todayMetrics.activeSeconds += SLICE_SECONDS;
    session.totalActiveSeconds = (session.totalActiveSeconds || 0) + SLICE_SECONDS;

    if (context.category === "work_upwork") {
      todayMetrics.upworkSeconds += SLICE_SECONDS;
      session.totalUpworkSeconds = (session.totalUpworkSeconds || 0) + SLICE_SECONDS;
      if (context.upworkSection && todayMetrics.subpathBreakdown[context.upworkSection] !== undefined) {
        todayMetrics.subpathBreakdown[context.upworkSection] += SLICE_SECONDS;
      }
    } else if (context.category === "work_other") {
      todayMetrics.otherWorkSeconds += SLICE_SECONDS;
      session.totalOtherWorkSeconds = (session.totalOtherWorkSeconds || 0) + SLICE_SECONDS;
    } else {
      todayMetrics.nonWorkSeconds += SLICE_SECONDS;
      session.totalNonWorkSeconds = (session.totalNonWorkSeconds || 0) + SLICE_SECONDS;
    }
  }

  await chrome.storage.local.set({ session, todayMetrics, lastHeartbeatTime: Date.now() });

  // Prepare telemetry payload
  const telemetryPacket = {
    sessionId: session.id,
    bidderCode: config.bidderCode,
    timestamp: new Date().toISOString(),
    isIdle,
    idleState,
    windowFocused: context.isWindowFocused,
    domain: context.domain,
    subpath: context.subpath,
    category: effectiveCategory,
    upworkSection: context.upworkSection,
    sliceSeconds: SLICE_SECONDS,
    sessionTotals: {
      clocked: session.totalClockedSeconds,
      active: session.totalActiveSeconds,
      idle: session.totalIdleSeconds,
      upwork: session.totalUpworkSeconds
    }
  };

  // Attempt sending to backend
  try {
    const res = await fetch(`${config.apiBaseUrl}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telemetryPacket)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // If successful, attempt to drain any offline queue
    await flushOfflineQueue(config.apiBaseUrl);
  } catch (error) {
    console.warn("Backend unavailable, queuing heartbeat packet offline:", error.message);
    const q = (await chrome.storage.local.get("offlineQueue")).offlineQueue || [];
    q.push({ type: "heartbeat", data: telemetryPacket, queuedAt: Date.now() });
    await chrome.storage.local.set({ offlineQueue: q });
  }
}

/**
 * Flush offline queued items to the server
 */
async function flushOfflineQueue(apiBaseUrl) {
  const store = await chrome.storage.local.get("offlineQueue");
  const queue = store.offlineQueue || [];
  if (queue.length === 0) return;

  try {
    const res = await fetch(`${apiBaseUrl}/sync-offline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: queue })
    });

    if (res.ok) {
      console.log(`Successfully synced ${queue.length} offline queued items.`);
      await chrome.storage.local.set({ offlineQueue: [] });
    }
  } catch (err) {
    console.warn("Failed to flush offline queue:", err.message);
  }
}

/**
 * Webhook Dispatcher: Telegram Bot API and Dashboard Manager Webhook
 */
async function dispatchWebhookNotification(eventType, sessionData, config) {
  const timeFormatted = new Date().toLocaleTimeString();
  const dateFormatted = new Date().toLocaleDateString();

  let message = "";
  if (eventType === "clock_in") {
    message = `🟢 *BIDDER CLOCKED IN*\n\n` +
              `👤 *Bidder:* ${config.bidderName} (\`${config.bidderCode}\`)\n` +
              `⏰ *Time:* ${timeFormatted} (${dateFormatted})\n` +
              `⚡ *Status:* Active Shift Started\n` +
              `💻 *System:* Chrome Extension Agent v1.0.0`;
  } else {
    const clockedMins = Math.round((sessionData.totalClockedSeconds || 0) / 60);
    const activeMins = Math.round((sessionData.totalActiveSeconds || 0) / 60);
    const upworkMins = Math.round((sessionData.totalUpworkSeconds || 0) / 60);
    const idleMins = Math.round((sessionData.totalIdleSeconds || 0) / 60);
    const rate = activeMins > 0 ? Math.round((upworkMins / activeMins) * 100) : 0;

    message = `🔴 *BIDDER CLOCKED OUT*\n\n` +
              `👤 *Bidder:* ${config.bidderName} (\`${config.bidderCode}\`)\n` +
              `⏰ *Shift End:* ${timeFormatted}\n` +
              `⏱️ *Total Shift:* ${clockedMins} mins\n` +
              `🎯 *Upwork Active:* ${upworkMins} mins\n` +
              `💤 *Idle Time:* ${idleMins} mins\n` +
              `📊 *Upwork Activity Rate:* ${rate}%`;
  }

  // 1. Send to Dashboard Webhook endpoint
  try {
    await fetch(`${config.apiBaseUrl}/webhook/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        bidderCode: config.bidderCode,
        bidderName: config.bidderName,
        message,
        sessionData,
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    console.warn("Dashboard webhook dispatch error:", e.message);
  }

  // 2. Direct Telegram Bot API Dispatch (if credentials configured in Extension settings)
  if (config.telegramBotToken && config.telegramChatId) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: message,
          parse_mode: "Markdown"
        })
      });
      console.log("Direct Telegram webhook sent successfully.");
    } catch (tgErr) {
      console.warn("Telegram direct dispatch error:", tgErr.message);
    }
  }
}

/**
 * Handle messages from Popup or Options UI
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    const store = await chrome.storage.local.get(["session", "config", "todayMetrics", "offlineQueue"]);
    const config = store.config || DEFAULT_CONFIG;

    if (request.type === "GET_STATE") {
      const context = await getActiveContext();
      sendResponse({
        session: store.session || null,
        config,
        todayMetrics: store.todayMetrics || {},
        offlineQueueCount: (store.offlineQueue || []).length,
        currentContext: context
      });
    } else if (request.type === "CLOCK_IN") {
      const now = new Date();
      const newSession = {
        id: "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        bidderCode: config.bidderCode,
        bidderName: config.bidderName,
        clockInTime: now.toISOString(),
        clockOutTime: null,
        status: "active",
        totalClockedSeconds: 0,
        totalActiveSeconds: 0,
        totalIdleSeconds: 0,
        totalUpworkSeconds: 0,
        totalOtherWorkSeconds: 0,
        totalNonWorkSeconds: 0
      };

      await chrome.storage.local.set({ session: newSession });

      // Notify backend & manager via webhook
      try {
        await fetch(`${config.apiBaseUrl}/session/clock-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSession)
        });
      } catch (err) {
        console.warn("Clock-in offline, saving to offline queue");
        const q = (await chrome.storage.local.get("offlineQueue")).offlineQueue || [];
        q.push({ type: "clock_in", data: newSession, queuedAt: Date.now() });
        await chrome.storage.local.set({ offlineQueue: q });
      }

      await dispatchWebhookNotification("clock_in", newSession, config);

      // Trigger initial heartbeat check after 3 seconds so metrics show active site immediately
      setTimeout(async () => {
        const check = await chrome.storage.local.get("session");
        if (check.session && check.session.status === "active") {
          await processHeartbeatInterval();
        }
      }, 3000);

      sendResponse({ success: true, session: newSession });
    } else if (request.type === "CLOCK_OUT") {
      const session = store.session;
      if (session) {
        session.clockOutTime = new Date().toISOString();
        session.status = "completed";

        await chrome.storage.local.set({ session: null });

        try {
          await fetch(`${config.apiBaseUrl}/session/clock-out`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(session)
          });
        } catch (err) {
          console.warn("Clock-out offline, saving to offline queue");
          const q = (await chrome.storage.local.get("offlineQueue")).offlineQueue || [];
          q.push({ type: "clock_out", data: session, queuedAt: Date.now() });
          await chrome.storage.local.set({ offlineQueue: q });
        }

        await dispatchWebhookNotification("clock_out", session, config);
      }
      sendResponse({ success: true });
    } else if (request.type === "FORCE_HEARTBEAT") {
      await processHeartbeatInterval();
      sendResponse({ success: true });
    } else if (request.type === "RESET_TODAY") {
      const emptyMetrics = {
        date: new Date().toISOString().slice(0, 10),
        clockedSeconds: 0,
        activeSeconds: 0,
        idleSeconds: 0,
        upworkSeconds: 0,
        otherWorkSeconds: 0,
        nonWorkSeconds: 0,
        subpathBreakdown: { searchJobs: 0, proposals: 0, messages: 0, jobDetails: 0, otherUpwork: 0 }
      };
      await chrome.storage.local.set({ todayMetrics: emptyMetrics });
      sendResponse({ success: true, todayMetrics: emptyMetrics });
    } else if (request.type === "TRIGGER_SYNC") {
      await flushOfflineQueue(config.apiBaseUrl);
      const updatedQueue = (await chrome.storage.local.get("offlineQueue")).offlineQueue || [];
      sendResponse({ success: true, remainingQueue: updatedQueue.length });
    } else if (request.type === "SAVE_CONFIG") {
      const mergedConfig = { ...config, ...request.config };
      await chrome.storage.local.set({ config: mergedConfig });
      if (mergedConfig.idleThresholdSeconds) {
        try {
          chrome.idle.setDetectionInterval(Number(mergedConfig.idleThresholdSeconds));
        } catch (e) {}
      }
      sendResponse({ success: true, config: mergedConfig });
    }
  })();

  return true; // Keep channel open for async response
});
