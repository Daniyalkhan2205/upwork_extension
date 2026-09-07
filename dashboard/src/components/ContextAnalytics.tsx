"use client";

import React from "react";
import { PieChart, Search, Send, MessageSquare, Globe, Layers } from "lucide-react";

interface ContextAnalyticsProps {
  upworkBreakdown: Record<string, number>;
  domainBreakdown: Record<string, number>;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const m = Math.round(seconds / 60);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0) return `${h}h ${rem}m`;
  return `${m}m`;
}

export const ContextAnalytics: React.FC<ContextAnalyticsProps> = ({
  upworkBreakdown,
  domainBreakdown,
}) => {
  const totalDomainSecs =
    (domainBreakdown.upwork || 0) +
    (domainBreakdown.otherWork || 0) +
    (domainBreakdown.nonWork || 0);

  const totalUpworkSecs =
    (upworkBreakdown.searchJobs || 0) +
    (upworkBreakdown.proposals || 0) +
    (upworkBreakdown.messages || 0) +
    (upworkBreakdown.other || 0);

  // Upwork Subpath percentages
  const searchPct = totalUpworkSecs > 0 ? Math.round((upworkBreakdown.searchJobs / totalUpworkSecs) * 100) : 0;
  const proposalPct = totalUpworkSecs > 0 ? Math.round((upworkBreakdown.proposals / totalUpworkSecs) * 100) : 0;
  const messagePct = totalUpworkSecs > 0 ? Math.round((upworkBreakdown.messages / totalUpworkSecs) * 100) : 0;
  const otherUpworkPct = Math.max(0, 100 - searchPct - proposalPct - messagePct);

  // Domain Category percentages
  const upworkPct = totalDomainSecs > 0 ? Math.round((domainBreakdown.upwork / totalDomainSecs) * 100) : 0;
  const otherWorkPct = totalDomainSecs > 0 ? Math.round((domainBreakdown.otherWork / totalDomainSecs) * 100) : 0;
  const nonWorkPct = Math.max(0, 100 - upworkPct - otherWorkPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {/* Panel 1: Upwork Sub-Path Isolation */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">
              Upwork Sub-Path Time Isolation
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            {formatDuration(totalUpworkSecs)} Tracked
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-4">
          Breakdown of bidder time across job search feeds, proposal drafting, and client messaging.
        </p>

        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full flex overflow-hidden mb-4">
          <div
            className="bg-sky-400 h-full transition-all"
            style={{ width: `${searchPct}%` }}
            title={`Job Search: ${searchPct}%`}
          />
          <div
            className="bg-emerald-400 h-full transition-all"
            style={{ width: `${proposalPct}%` }}
            title={`Proposals: ${proposalPct}%`}
          />
          <div
            className="bg-purple-400 h-full transition-all"
            style={{ width: `${messagePct}%` }}
            title={`Messages: ${messagePct}%`}
          />
          <div
            className="bg-slate-600 h-full transition-all"
            style={{ width: `${otherUpworkPct}%` }}
            title={`Other Upwork: ${otherUpworkPct}%`}
          />
        </div>

        {/* Subpath Legend List */}
        <div className="space-y-2.5">
          {/* Search Jobs */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Job Search / Feed
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  /nx/search/jobs, /nx/find-work
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-sky-400">
                {formatDuration(upworkBreakdown.searchJobs || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">{searchPct}%</span>
            </div>
          </div>

          {/* Proposals */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Proposals & Submissions
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  /ab/proposals, /proposals
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">
                {formatDuration(upworkBreakdown.proposals || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">{proposalPct}%</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Client Communication
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  /messages, /rooms
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-purple-400">
                {formatDuration(upworkBreakdown.messages || 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">{messagePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Overall Domain Categorization */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white">
              Domain Category Distribution
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            {formatDuration(totalDomainSecs)} Total Active
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-4">
          Automated classification into Core Work, Auxiliary Work Tools, and Non-Work browsing.
        </p>

        {/* Domain Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full flex overflow-hidden mb-4">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${upworkPct}%` }}
            title={`Upwork: ${upworkPct}%`}
          />
          <div
            className="bg-sky-500 h-full transition-all"
            style={{ width: `${otherWorkPct}%` }}
            title={`Other Work: ${otherWorkPct}%`}
          />
          <div
            className="bg-rose-500 h-full transition-all"
            style={{ width: `${nonWorkPct}%` }}
            title={`Non-Work: ${nonWorkPct}%`}
          />
        </div>

        {/* Categories List */}
        <div className="space-y-2.5">
          {/* Upwork */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-200">
                Upwork Platform (Core)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">
                {formatDuration(domainBreakdown.upwork || 0)}
              </span>
              <span className="text-[10px] text-slate-400 ml-2 font-mono">
                {upworkPct}%
              </span>
            </div>
          </div>

          {/* Other Work */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Auxiliary Work Domains
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Fiverr, LinkedIn, Google Docs, Drive, Sheets
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-sky-400">
                {formatDuration(domainBreakdown.otherWork || 0)}
              </span>
              <span className="text-[10px] text-slate-400 ml-2 font-mono">
                {otherWorkPct}%
              </span>
            </div>
          </div>

          {/* Non-Work */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Non-Work / Entertainment
                </span>
                <span className="text-[10px] text-slate-500 block">
                  YouTube, Facebook, Twitter/X, Instagram, Netflix
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-rose-400">
                {formatDuration(domainBreakdown.nonWork || 0)}
              </span>
              <span className="text-[10px] text-slate-400 ml-2 font-mono">
                {nonWorkPct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
