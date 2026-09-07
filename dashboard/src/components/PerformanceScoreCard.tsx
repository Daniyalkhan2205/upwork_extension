"use client";

import React from "react";
import { Award, AlertTriangle, XCircle, CheckCircle2, HelpCircle } from "lucide-react";

interface PerformanceScoreCardProps {
  tierCounts: {
    GOOD: number;
    WARNING: number;
    POOR: number;
  };
}

export const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({ tierCounts }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Bidder Performance Scoring Engine (Layer 2 Analytics)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic scoring combining attendance, active Upwork focus ratio, proposal volume, and client conversion.
          </p>
        </div>

        {/* Live Counts */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {tierCounts.GOOD} GOOD
          </span>
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            {tierCounts.WARNING} WARNING
          </span>
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            {tierCounts.POOR} POOR
          </span>
        </div>
      </div>

      {/* Formula & Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Tier: GOOD */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              STATUS: GOOD
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400">Score &gt;= 65</span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-2">
            High Upwork focus + proportional proposal output.
          </p>
          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <p>• Upwork focus &gt;= 60% of active computer time</p>
            <p>• Consistent submissions (3+ proposals per shift)</p>
            <p>• Healthy conversion to client replies</p>
          </div>
        </div>

        {/* Tier: WARNING */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-amber-500/30 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              STATUS: WARNING
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400">Slow Browsing Flag</span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-2">
            High Upwork time but low proposal output.
          </p>
          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <p className="text-amber-300 font-medium">• Flags potential slacking or window shopping</p>
            <p>• Long durations on job feed without submitting</p>
            <p>• High time investment with inadequate output</p>
          </div>
        </div>

        {/* Tier: POOR */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-rose-500/30 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              STATUS: POOR
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400">Score &lt; 45</span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-2">
            High idle time / low Upwork active time.
          </p>
          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <p>• Idle time exceeds 40% of clocked shift</p>
            <p>• Inactive keyboard/mouse triggers idle pause</p>
            <p>• Low job application velocity</p>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-emerald-400 font-bold font-mono">FORMULA:</span>
          <span className="font-mono text-slate-400">
            Performance = Attendance(20%) + Upwork Active(30%) + Proposals(30%) + Conversion(20%)
          </span>
        </div>
        <span className="text-[11px] text-slate-500">Auto-calculated daily per shift</span>
      </div>
    </div>
  );
};
