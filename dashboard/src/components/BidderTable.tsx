"use client";

import React from "react";
import { Edit3, CheckCircle, AlertTriangle, XCircle, Clock, ExternalLink } from "lucide-react";

interface BidderTableProps {
  bidders: any[];
  onOpenKpiModal: (bidder: any) => void;
}

function formatMins(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const m = Math.round(seconds / 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) return `${h}h ${remM}m`;
  return `${m}m`;
}

export const BidderTable: React.FC<BidderTableProps> = ({ bidders, onOpenKpiModal }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden w-full">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Bidder Performance Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active shifts, Upwork focus rates, proposal submissions, and conversion analytics.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Showing {bidders.length} Bidders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
            <tr>
              <th className="py-3.5 px-4">Bidder</th>
              <th className="py-3.5 px-4">Shift Status</th>
              <th className="py-3.5 px-4">Clocked / Active</th>
              <th className="py-3.5 px-4">Upwork Focus</th>
              <th className="py-3.5 px-4">Output (Jobs / Proposals)</th>
              <th className="py-3.5 px-4">Conversion (Replies / Calls)</th>
              <th className="py-3.5 px-4">Performance Score</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bidders.map((b) => {
              const p = b.performance;
              const rate = b.todayMetrics.upworkActivityRate;

              let tierBadge = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" />
                  GOOD ({p.score})
                </span>
              );

              if (p.tier === "WARNING") {
                tierBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    WARNING ({p.score})
                  </span>
                );
              } else if (p.tier === "POOR") {
                tierBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-3 h-3" />
                    POOR ({p.score})
                  </span>
                );
              }

              return (
                <tr key={b.user.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Bidder Profile */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{b.user.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {b.user.bidderCode} • ${b.user.hourlyRate}/hr
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {b.isClockedIn ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        CLOCKED IN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                        CLOCKED OUT
                      </span>
                    )}
                  </td>

                  {/* Clocked vs Active */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">
                      {formatMins(b.todayMetrics.clockedSeconds)} Shift
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Active: {formatMins(b.todayMetrics.activeSeconds)} •{" "}
                      <span className="text-amber-400/90">Idle: {formatMins(b.todayMetrics.idleSeconds)}</span>
                    </div>
                  </td>

                  {/* Upwork Focus & Rate */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{formatMins(b.todayMetrics.upworkSeconds)}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          rate >= 70
                            ? "bg-emerald-500/20 text-emerald-300"
                            : rate >= 50
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {rate}% Rate
                      </span>
                    </div>
                    <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${Math.min(100, rate)}%` }}
                      />
                    </div>
                  </td>

                  {/* Output KPIs */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">
                      <strong className="text-white">{b.kpis.proposalsSubmitted}</strong> proposals
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.kpis.jobsReviewed} reviewed • {b.kpis.connectsUsed} connects
                    </div>
                  </td>

                  {/* Conversion */}
                  <td className="py-3.5 px-4">
                    <div className="text-amber-300 font-semibold">
                      {b.kpis.replies} Replies
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">
                      {b.kpis.interviews} Interviews
                    </div>
                  </td>

                  {/* Score & Tier */}
                  <td className="py-3.5 px-4">
                    <div>{tierBadge}</div>
                    <div className="text-[10px] text-slate-400 mt-1 max-w-[180px] truncate" title={p.summary}>
                      {p.summary}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenKpiModal(b)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-white/10 transition-all font-semibold"
                      title="Log or edit daily bidder KPIs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Log KPIs</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
