"use client";

import React from "react";
import { Activity, Bell, Calendar, RefreshCw, Zap } from "lucide-react";

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenWebhooks: () => void;
  onOpenSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onRefresh,
  isLoading,
  onOpenWebhooks,
  onOpenSimulate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-6 py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Bidder<span className="text-emerald-400">Flow</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
                LIVE V3 AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agency Bidder Activity, Idle Monitoring & Output Tracker
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Simulate Action for instant testing */}
          <button
            onClick={onOpenSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all shadow-sm"
            title="Simulate live telemetry or clock in/out"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test Telemetry</span>
          </button>

          {/* Webhook Notifications Log Button */}
          <button
            onClick={onOpenWebhooks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700/80 transition-all"
            title="View Webhook Notifications Audit"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Alerts & Webhooks</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
