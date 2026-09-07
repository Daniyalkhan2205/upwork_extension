export interface WebhookLogItem {
  id: string;
  eventType: string;
  bidderCode: string;
  bidderName: string;
  message: string;
  status: "delivered" | "failed" | "logged";
  timestamp: string;
}

// In-memory buffer of recent webhook dispatches for the dashboard live log viewer
const recentWebhookLogs: WebhookLogItem[] = [
  {
    id: "wh_init_1",
    eventType: "clock_in",
    bidderCode: "BIDDER_01",
    bidderName: "Alex Mercer",
    message: "🟢 *BIDDER CLOCKED IN* - Alex Mercer (BIDDER_01)",
    status: "delivered",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function sendTelegramAlert(
  message: string,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return {
      success: true,
      error: "Telegram credentials not configured in environment or request; notification logged internally.",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.description || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function logWebhookEvent(item: Omit<WebhookLogItem, "id">): WebhookLogItem {
  const fullItem: WebhookLogItem = {
    ...item,
    id: "wh_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
  };
  recentWebhookLogs.unshift(fullItem);
  if (recentWebhookLogs.length > 50) {
    recentWebhookLogs.pop();
  }
  return fullItem;
}

export function getRecentWebhookLogs(): WebhookLogItem[] {
  return [...recentWebhookLogs];
}
