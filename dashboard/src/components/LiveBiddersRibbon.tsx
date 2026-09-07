"use client";

import React from "react";
import { Clock, Globe, Laptop, Radio, AlertTriangle } from "lucide-react";

interface LiveBiddersRibbonProps {
  bidders: any[];
}

export const LiveBiddersRibbon: React.FC<LiveBiddersRibbonProps> = ({ bidders }) => {
  const activeBidders = bidders.filter((b) => b.isClockedIn);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Bidder Floor Monitor ({activeBidders.length} Active On Shift)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500">
          Heartbeats reporting every 60s • Idle threshold 180s
        </span>
      </div>

      {activeBidders.length === 0 ? (
        <div className="glass-panel rounded-xl p-6 text-center border border-dashed border-white/10 text-slate-400">
          <Laptop className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
          <p className="text-sm font-medium">No bidders currently clocked in.</p>
          <p className="text-xs text-slate-500 mt-1">
            Bidders will appear here when they toggle &quot;Clock In&quot; from their Chrome Extension.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBidders.map((b) => {
            const isUpwork = (b.currentDomain || "").includes("upwork.com");
            const isNonWork = (b.currentDomain || "").includes("youtube") || (b.currentDomain || "").includes("facebook");
            const rate = b.todayMetrics.upworkActivityRate;

            return (
              <div
                key={b.user.id}
                className="glass-panel rounded-xl p-4 border-l-4 border-l-emerald-500 relative overflow-hidden transition-all hover:border-white/20"
              >
                {/* Header of card */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{b.user.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {b.user.bidderCode}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Shift: {Math.round(b.todayMetrics.clockedSeconds / 60)}m
                    </span>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Current Active Context */}
                <div className="bg-slate-950/60 rounded-lg p-2.5 border border-white/5 space-y-1.5">
                  <div className="text-[10px] font-semibold tracking-wider text-slate-500 flex items-center justify-between">
                    <span>ACTIVE TAB CONTEXT</span>
                    {isUpwork ? (
                      <span className="text-emerald-400 font-bold">UPWORK FOCUSED</span>
                    ) : isNonWork ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> NON-WORK SITE
                      </span>
                    ) : (
                      <span className="text-sky-400 font-bold">OTHER WORK SITE</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {b.currentDomain || "Browser active"}
                    </span>
                  </div>

                  {b.currentSubpath && (
                    <div className="text-[11px] font-mono text-emerald-400/90 truncate bg-slate-900/80 px-2 py-0.5 rounded">
                      {b.currentSubpath}
                    </div>
                  )}
                </div>

                {/* Footer metrics of card */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-slate-400">
                    Upwork Time: <strong className="text-white">{Math.round(b.todayMetrics.upworkSeconds / 60)}m</strong>
                  </span>
                  <span className={`font-bold ${rate >= 70 ? "text-emerald-400" : rate >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                    {rate}% Focus
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
