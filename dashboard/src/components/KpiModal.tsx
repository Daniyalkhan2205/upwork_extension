"use client";

import React, { useState, useEffect } from "react";
import { X, Save, FileText } from "lucide-react";

interface KpiModalProps {
  bidder: any;
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const KpiModal: React.FC<KpiModalProps> = ({ bidder, date, isOpen, onClose, onSaved }) => {
  const [jobsReviewed, setJobsReviewed] = useState(0);
  const [proposalsSubmitted, setProposalsSubmitted] = useState(0);
  const [connectsUsed, setConnectsUsed] = useState(0);
  const [replies, setReplies] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (bidder) {
      setJobsReviewed(bidder.kpis?.jobsReviewed || 0);
      setProposalsSubmitted(bidder.kpis?.proposalsSubmitted || 0);
      setConnectsUsed(bidder.kpis?.connectsUsed || 0);
      setReplies(bidder.kpis?.replies || 0);
      setInterviews(bidder.kpis?.interviews || 0);
      setNotes(bidder.kpis?.notes || "");
      setErrorMsg("");
    }
  }, [bidder]);

  if (!isOpen || !bidder) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderCode: bidder.user.bidderCode,
          date,
          jobsReviewed,
          proposalsSubmitted,
          connectsUsed,
          replies,
          interviews,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save KPIs");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log Daily Output KPIs (Layer 2)
              </h3>
              <p className="text-xs text-slate-400">
                {bidder.user.name} ({bidder.user.bidderCode}) • Date: {date}
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

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Jobs Reviewed */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jobs Reviewed
              </label>
              <input
                type="number"
                min="0"
                value={jobsReviewed}
                onChange={(e) => setJobsReviewed(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-500">Total job posts screened</span>
            </div>

            {/* Proposals Submitted */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proposals Submitted
              </label>
              <input
                type="number"
                min="0"
                value={proposalsSubmitted}
                onChange={(e) => setProposalsSubmitted(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                required
              />
              <span className="text-[10px] text-slate-500">Sent to clients</span>
            </div>

            {/* Connects Used */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Connects Consumed
              </label>
              <input
                type="number"
                min="0"
                value={connectsUsed}
                onChange={(e) => setConnectsUsed(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-500">Upwork connects expended</span>
            </div>

            {/* Direct Replies */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client Replies Received
              </label>
              <input
                type="number"
                min="0"
                value={replies}
                onChange={(e) => setReplies(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-500">Message conversations opened</span>
            </div>

            {/* Interviews Scheduled */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Interviews Scheduled
              </label>
              <input
                type="number"
                min="0"
                value={interviews}
                onChange={(e) => setInterviews(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-500">Scheduled calls / Zoom / Upwork meetings</span>
            </div>
          </div>

          {/* Shift Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Shift Observations / Strategy Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Focus on React / Next.js jobs, high reply rate on custom proposals..."
              className="w-full bg-slate-800/80 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Daily KPIs"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
