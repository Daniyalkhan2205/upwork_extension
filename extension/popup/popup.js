/**
 * Extension Popup Logic
 */

let timerInterval = null;
let currentSession = null;
let sessionStartTimeMs = null;
let configLoaded = false;       // populate settings inputs only once
let settingsOpen = false;       // true while the drawer is visible

// DOM Elements
const shiftCard = document.getElementById("shiftCard");
const statusDot = document.getElementById("statusDot");
const statusLabel = document.getElementById("statusLabel");
const displayBidderCode = document.getElementById("displayBidderCode");
const timerDigits = document.getElementById("timerDigits");
const timerSubtext = document.getElementById("timerSubtext");
const btnClockToggle = document.getElementById("btnClockToggle");
const btnClockText = document.getElementById("btnClockText");

const currentDomain = document.getElementById("currentDomain");
const currentSubpath = document.getElementById("currentSubpath");
const categoryBadge = document.getElementById("categoryBadge");

const metricClocked = document.getElementById("metricClocked");
const metricUpwork = document.getElementById("metricUpwork");
const metricIdle = document.getElementById("metricIdle");
const upworkRateBadge = document.getElementById("upworkRateBadge");

const chipSearch = document.getElementById("chipSearch");
const chipProposals = document.getElementById("chipProposals");
const chipMessages = document.getElementById("chipMessages");

const syncDot = document.getElementById("syncDot");
const syncText = document.getElementById("syncText");
const btnSyncNow = document.getElementById("btnSyncNow");

const btnSettingsToggle = document.getElementById("btnSettingsToggle");
const btnCloseSettings = document.getElementById("btnCloseSettings");
const settingsDrawer = document.getElementById("settingsDrawer");
const inputBidderCode = document.getElementById("inputBidderCode");
const inputBidderName = document.getElementById("inputBidderName");
const inputApiUrl = document.getElementById("inputApiUrl");
const inputIdleThreshold = document.getElementById("inputIdleThreshold");
const inputTgToken = document.getElementById("inputTgToken");
const inputTgChatId = document.getElementById("inputTgChatId");
const btnSaveConfig = document.getElementById("btnSaveConfig");

// Formatting helpers
function formatDuration(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatMinutes(seconds) {
  if (!seconds || seconds <= 0) return "0m";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

// Update live stopwatch
function updateTimer() {
  if (!currentSession || currentSession.status !== "active") {
    timerDigits.textContent = "00:00:00";
    return;
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTimeMs) / 1000));
  timerDigits.textContent = formatDuration(elapsedSeconds);
}

// Render full state from background worker
function renderState(state) {
  const { session, config, todayMetrics, offlineQueueCount, currentContext } = state;
  currentSession = session;

  // Render Bidder header — always safe
  if (config) {
    displayBidderCode.textContent = config.bidderCode || "BIDDER_01";

    // Only write into the inputs when the drawer is NOT open so we
    // never clobber the user's unsaved edits during the 2-second poll.
    if (!configLoaded || !settingsOpen) {
      inputBidderCode.value = config.bidderCode || "";
      inputBidderName.value = config.bidderName || "";
      inputApiUrl.value = config.apiBaseUrl || "http://localhost:3000/api";
      inputIdleThreshold.value = config.idleThresholdSeconds || 180;
      inputTgToken.value = config.telegramBotToken || "";
      inputTgChatId.value = config.telegramChatId || "";
      configLoaded = true;
    }
  }

  // Render Shift Status
  if (session && session.status === "active") {
    shiftCard.classList.add("active");
    statusLabel.textContent = "Shift In Progress";
    timerSubtext.textContent = "Current Shift Duration";
    btnClockToggle.className = "btn btn-clock-out";
    btnClockText.textContent = "Clock Out";
    sessionStartTimeMs = new Date(session.clockInTime).getTime();

    if (!timerInterval) {
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    }
  } else {
    shiftCard.classList.remove("active");
    statusLabel.textContent = "Shift Inactive";
    timerSubtext.textContent = "Shift Stopped";
    btnClockToggle.className = "btn btn-clock-in";
    btnClockText.textContent = "Clock In";

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerDigits.textContent = "00:00:00";
  }

  // Render Context
  if (currentContext) {
    currentDomain.textContent = currentContext.domain || "No active tab";
    currentSubpath.textContent = currentContext.subpath || "--";

    categoryBadge.className = "category-pill";
    if (currentContext.category === "work_upwork") {
      categoryBadge.classList.add("pill-upwork");
      categoryBadge.textContent = "Upwork Active";
    } else if (currentContext.category === "work_other") {
      categoryBadge.classList.add("pill-work");
      categoryBadge.textContent = "Other Work";
    } else if (currentContext.category === "idle") {
      categoryBadge.classList.add("pill-idle");
      categoryBadge.textContent = "Idle / Inactive";
    } else {
      categoryBadge.classList.add("pill-nonwork");
      categoryBadge.textContent = "Non-Work";
    }
  }

  // Render Metrics
  if (todayMetrics) {
    metricClocked.textContent = formatMinutes(todayMetrics.clockedSeconds);
    metricUpwork.textContent = formatMinutes(todayMetrics.upworkSeconds);
    metricIdle.textContent = formatMinutes(todayMetrics.idleSeconds);

    const totalActive = todayMetrics.activeSeconds || 0;
    const upworkSecs = todayMetrics.upworkSeconds || 0;
    const rate = totalActive > 0 ? Math.round((upworkSecs / totalActive) * 100) : 0;
    upworkRateBadge.textContent = `${rate}% Upwork`;

    if (todayMetrics.subpathBreakdown) {
      chipSearch.textContent = `Jobs: ${formatMinutes(todayMetrics.subpathBreakdown.searchJobs)}`;
      chipProposals.textContent = `Proposals: ${formatMinutes(todayMetrics.subpathBreakdown.proposals)}`;
      chipMessages.textContent = `Messages: ${formatMinutes(todayMetrics.subpathBreakdown.messages)}`;
    }
  }

  // Offline queue status
  const queueCount = offlineQueueCount || 0;
  if (queueCount > 0) {
    syncDot.classList.add("offline");
    syncText.textContent = `Offline • ${queueCount} queued`;
  } else {
    syncDot.classList.remove("offline");
    syncText.textContent = "Online • All synced";
  }
}

// Fetch state from background worker
function fetchState() {
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn(chrome.runtime.lastError.message);
      return;
    }
    if (response) {
      renderState(response);
    }
  });
}

// Event Listeners
btnClockToggle.addEventListener("click", () => {
  btnClockToggle.disabled = true;
  if (currentSession && currentSession.status === "active") {
    chrome.runtime.sendMessage({ type: "CLOCK_OUT" }, () => {
      btnClockToggle.disabled = false;
      fetchState();
    });
  } else {
    chrome.runtime.sendMessage({ type: "CLOCK_IN" }, () => {
      btnClockToggle.disabled = false;
      fetchState();
    });
  }
});

btnSyncNow.addEventListener("click", () => {
  btnSyncNow.disabled = true;
  btnSyncNow.textContent = "Syncing...";
  chrome.runtime.sendMessage({ type: "FORCE_HEARTBEAT" }, () => {
    chrome.runtime.sendMessage({ type: "TRIGGER_SYNC" }, () => {
      btnSyncNow.disabled = false;
      btnSyncNow.textContent = "Sync Now";
      fetchState();
    });
  });
});

// Reset Today's Counters
const btnResetToday = document.getElementById("btnResetToday");
if (btnResetToday) {
  btnResetToday.addEventListener("click", () => {
    if (confirm("Reset today's activity counters to zero?")) {
      chrome.runtime.sendMessage({ type: "RESET_TODAY" }, () => {
        settingsDrawer.style.display = "none";
        fetchState();
      });
    }
  });
}

// Settings Drawer Toggle
btnSettingsToggle.addEventListener("click", () => {
  settingsOpen = true;
  // Re-fetch so the inputs are freshly populated when drawer opens
  fetchState();
  settingsDrawer.style.display = "block";
});

btnCloseSettings.addEventListener("click", () => {
  settingsOpen = false;
  settingsDrawer.style.display = "none";
});

btnSaveConfig.addEventListener("click", () => {
  const newConfig = {
    bidderCode: inputBidderCode.value.trim() || "BIDDER_01",
    bidderName: inputBidderName.value.trim() || "Alex Mercer",
    apiBaseUrl: inputApiUrl.value.trim() || "http://localhost:3000/api",
    idleThresholdSeconds: parseInt(inputIdleThreshold.value, 10) || 180,
    telegramBotToken: inputTgToken.value.trim(),
    telegramChatId: inputTgChatId.value.trim()
  };

  chrome.runtime.sendMessage({ type: "SAVE_CONFIG", config: newConfig }, () => {
    settingsOpen = false;
    settingsDrawer.style.display = "none";
    configLoaded = false; // force a fresh re-read next time
    fetchState();
  });
});

// Initial load & poll active state every 2 seconds while popup is open
fetchState();
setInterval(fetchState, 2000);
