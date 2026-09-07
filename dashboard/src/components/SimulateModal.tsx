"use client";

import React, { useState } from "react";
import { X, Play, Square, Cpu, Coffee, Send, CheckCircle2 } from "lucide-react";

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const SimulateModal: React.FC<SimulateModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [selectedBidder, setSelectedBidder] = useState("BIDDER_01");
  const [feedback, setFeedback] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  if (!isOpen) return null;

  const runAction = async (actionName: string, endpoint: string, payload: any) => {
    setLoadingAction(actionName);
    setFeedback("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Action "${actionName}" executed successfully!`);
        onRefresh();
      } else {
        setFeedback(`Error: ${data.message || "Failed"}`);
      }
    } catch (err: any) {
      setFeedback(`Network error: ${err.message}`);
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">
              Extension Telemetry Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Test clock in/out, 1-min heartbeats, 3-min idle detection, and offline queueing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bidder Selector */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Bidder
          </label>
          <select
            value={selectedBidder}
            onChange={(e) => setSelectedBidder(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="BIDDER_01">Alex Mercer (BIDDER_01)</option>
            <option value="BIDDER_02">Sara Connor (BIDDER_02)</option>
            <option value="BIDDER_03">Liam Vance (BIDDER_03)</option>
          </select>
        </div>

        {feedback && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Actions Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Action 1: Clock In */}
          <button
            onClick={() =>
              runAction("Clock In", "/api/session/clock-in", {
                bidderCode: selectedBidder,
                clockInTime: new Date().toISOString(),
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Play className="w-3.5 h-3.5" />
              <span>Clock In Shift</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Starts shift session & triggers webhook alert.
            </p>
          </button>

          {/* Action 2: Clock Out */}
          <button
            onClick={() =>
              runAction("Clock Out", "/api/session/clock-out", {
                bidderCode: selectedBidder,
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Square className="w-3.5 h-3.5" />
              <span>Clock Out Shift</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Finalizes session metrics & sends summary alert.
            </p>
          </button>

          {/* Action 3: Upwork Job Feed Heartbeat */}
          <button
            onClick={() =>
              runAction("Upwork Heartbeat", "/api/heartbeat", {
                bidderCode: selectedBidder,
                sessionId: "sim_session_" + selectedBidder,
                domain: "upwork.com",
                subpath: "/nx/search/jobs",
                category: "work_upwork",
                isIdle: false,
                windowFocused: true,
                sliceSeconds: 60,
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>+1m Upwork Job Feed</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Simulates 1-minute active search on /nx/search/jobs.
            </p>
          </button>

          {/* Action 4: Upwork Proposal Draft Heartbeat */}
          <button
            onClick={() =>
              runAction("Proposal Heartbeat", "/api/heartbeat", {
                bidderCode: selectedBidder,
                sessionId: "sim_session_" + selectedBidder,
                domain: "upwork.com",
                subpath: "/ab/proposals",
                category: "work_upwork",
                isIdle: false,
                windowFocused: true,
                sliceSeconds: 60,
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Send className="w-3.5 h-3.5" />
              <span>+1m Proposal Drafting</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Simulates 1-minute active work on /ab/proposals.
            </p>
          </button>

          {/* Action 5: Idle Time Heartbeat */}
          <button
            onClick={() =>
              runAction("Idle Heartbeat", "/api/heartbeat", {
                bidderCode: selectedBidder,
                sessionId: "sim_session_" + selectedBidder,
                domain: "idle",
                subpath: "",
                category: "idle",
                isIdle: true,
                windowFocused: false,
                sliceSeconds: 60,
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Coffee className="w-3.5 h-3.5" />
              <span>+1m Idle Time Pause</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Simulates 3-min threshold idle detection trigger.
            </p>
          </button>

          {/* Action 6: Test Batch Offline Sync */}
          <button
            onClick={() =>
              runAction("Offline Sync", "/api/sync-offline", {
                items: [
                  {
                    type: "heartbeat",
                    data: {
                      bidderCode: selectedBidder,
                      domain: "upwork.com",
                      subpath: "/messages",
                      category: "work_upwork",
                      isIdle: false,
                      sliceSeconds: 120,
                    },
                  },
                ],
              })
            }
            disabled={!!loadingAction}
            className="p-3 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-left transition-all"
          >
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Send className="w-3.5 h-3.5" />
              <span>Replay Offline Queue</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Batch replay buffered packets from chrome.storage.local.
            </p>
          </button>
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
