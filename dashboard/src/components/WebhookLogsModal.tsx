"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Send, CheckCircle, RefreshCw } from "lucide-react";

interface WebhookLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookLogsModal: React.FC<WebhookLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("🔔 *TEST ALERT*: BidderFlow Manager webhook connected!");
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/webhook/notify");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Failed to fetch webhook logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      setSendFeedback("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    setIsSending(true);
    setSendFeedback("");
    try {
      const res = await fetch("/api/webhook/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "manager_test_alert",
          bidderCode: "ADMIN",
          bidderName: "Agency Manager",
          message: testMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendFeedback("Test alert dispatched successfully!");
        fetchLogs();
      }
    } catch (err: any) {
      setSendFeedback("Error sending test: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Manager Alerts & Webhook Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                Telegram Bot API & Shift Notification Dispatcher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Test Box */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
          <div className="text-xs font-semibold text-slate-300">
            Send Manager Test Webhook
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 bg-slate-900/90 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSendTest}
              disabled={isSending}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{isSending ? "Sending..." : "Dispatch"}</span>
            </button>
          </div>
          {sendFeedback && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3 h-3" />
              {sendFeedback}
            </div>
          )}
        </div>

        {/* Logs List */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Dispatches ({logs.length})
            </span>
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No webhook logs yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-white/5 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.eventType === "clock_in"
                            ? "bg-emerald-400"
                            : log.eventType === "clock_out"
                            ? "bg-rose-400"
                            : "bg-sky-400"
                        }`}
                      ></span>
                      {log.eventType.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap mt-1">
                    {log.message}
                  </pre>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5 mt-1">
                    <span>Bidder: {log.bidderName} ({log.bidderCode})</span>
                    <span className="text-emerald-400 font-semibold">Status: {log.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
