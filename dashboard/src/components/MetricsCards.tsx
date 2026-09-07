"use client";

import React from "react";
import { Clock, Cpu, CheckCircle2, FileText, MessageSquare, Zap } from "lucide-react";

interface MetricsCardsProps {
  summary: {
    totalClockedSeconds: number;
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    totalUpworkSeconds: number;
    agencyUpworkRate: number;
    totalJobsReviewed: number;
    totalProposals: number;
    totalConnects: number;
    totalReplies: number;
    totalInterviews: number;
  };
}

function formatHoursMinutes(seconds: number): string {
  if (!seconds || seconds <= 0) return "0h 0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ summary }) => {
  const clockedMins = Math.round(summary.totalClockedSeconds / 60);
  const activeMins = Math.round(summary.totalActiveSeconds / 60);
  const upworkMins = Math.round(summary.totalUpworkSeconds / 60);
  const idleMins = Math.round(summary.totalIdleSeconds / 60);
  const upworkRate = summary.agencyUpworkRate;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Card 1: Clocked vs Active Time */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Clocked Shift
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-white tracking-tight">
            {formatHoursMinutes(summary.totalClockedSeconds)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Active: {formatHoursMinutes(summary.totalActiveSeconds)}</span>
            <span className="text-amber-400">Idle: {formatHoursMinutes(summary.totalIdleSeconds)}</span>
          </div>
        </div>
        {/* Progress Bar Active vs Idle */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${clockedMins > 0 ? (activeMins / clockedMins) * 100 : 0}%` }}
            title={`Active: ${activeMins}m`}
          />
          <div
            className="bg-amber-500/80 h-full"
            style={{ width: `${clockedMins > 0 ? (idleMins / clockedMins) * 100 : 0}%` }}
            title={`Idle: ${idleMins}m`}
          />
        </div>
      </div>

      {/* Card 2: Upwork Active Time & Rate */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Upwork Active Time
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-white tracking-tight">
            {formatHoursMinutes(summary.totalUpworkSeconds)}
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-slate-400">Upwork Activity Rate:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {upworkRate}%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, upworkRate)}%` }}
          />
        </div>
      </div>

      {/* Card 3: Proposals & Connects (Layer 2 Output) */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Proposals Submitted
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-white tracking-tight">
            {summary.totalProposals}{" "}
            <span className="text-xs font-medium text-slate-400">
              / {summary.totalJobsReviewed} Reviewed
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Connects Consumed:</span>
            <span className="font-semibold text-purple-300 font-mono">
              {summary.totalConnects} connects
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-purple-500 h-full transition-all duration-500"
            style={{
              width: `${
                summary.totalJobsReviewed > 0
                  ? Math.min(100, (summary.totalProposals / summary.totalJobsReviewed) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Card 4: Replies & Interviews (Conversion) */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Client Interviews & Replies
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-white tracking-tight">
            {summary.totalInterviews}{" "}
            <span className="text-xs font-medium text-slate-400">Interviews</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Direct Replies:</span>
            <span className="font-bold text-amber-300 font-mono">
              {summary.totalReplies} responses
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-500"
            style={{
              width: `${
                summary.totalProposals > 0
                  ? Math.min(100, ((summary.totalReplies + summary.totalInterviews) / summary.totalProposals) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
