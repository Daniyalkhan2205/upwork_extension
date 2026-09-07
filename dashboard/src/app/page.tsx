"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { LiveBiddersRibbon } from "@/components/LiveBiddersRibbon";
import { MetricsCards } from "@/components/MetricsCards";
import { PerformanceScoreCard } from "@/components/PerformanceScoreCard";
import { BidderTable } from "@/components/BidderTable";
import { ContextAnalytics } from "@/components/ContextAnalytics";
import { KpiModal } from "@/components/KpiModal";
import { WebhookLogsModal } from "@/components/WebhookLogsModal";
import { SimulateModal } from "@/components/SimulateModal";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [bidders, setBidders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalClockedSeconds: 0,
    totalActiveSeconds: 0,
    totalIdleSeconds: 0,
    totalUpworkSeconds: 0,
    agencyUpworkRate: 0,
    totalJobsReviewed: 0,
    totalProposals: 0,
    totalConnects: 0,
    totalReplies: 0,
    totalInterviews: 0,
  });
  const [tierCounts, setTierCounts] = useState({ GOOD: 0, WARNING: 0, POOR: 0 });
  const [upworkBreakdown, setUpworkBreakdown] = useState<Record<string, number>>({});
  const [domainBreakdown, setDomainBreakdown] = useState<Record<string, number>>({});

  // Modals
  const [selectedBidderForKpi, setSelectedBidderForKpi] = useState<any | null>(null);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isWebhooksModalOpen, setIsWebhooksModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch bidders
      const resBidders = await fetch(`/api/bidders?date=${currentDate}`);
      const dataBidders = await resBidders.json();
      if (dataBidders.success) {
        setBidders(dataBidders.bidders || []);
      }

      // 2. Fetch overview rollup
      const resOverview = await fetch(`/api/overview?date=${currentDate}`);
      const dataOverview = await resOverview.json();
      if (dataOverview.success) {
        setSummary(dataOverview.summary || {});
        setTierCounts(dataOverview.tierCounts || { GOOD: 0, WARNING: 0, POOR: 0 });
        setUpworkBreakdown(dataOverview.upworkBreakdown || {});
        setDomainBreakdown(dataOverview.domainBreakdown || {});
      }
    } catch (err) {
      console.warn("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh telemetry every 5 seconds for live monitor
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleOpenKpiModal = (bidder: any) => {
    setSelectedBidderForKpi(bidder);
    setIsKpiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onRefresh={fetchDashboardData}
        isLoading={isLoading}
        onOpenWebhooks={() => setIsWebhooksModalOpen(true)}
        onOpenSimulate={() => setIsSimulateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Live Bidder Floor Monitor Ribbon */}
        <LiveBiddersRibbon bidders={bidders} />

        {/* Agency Overview Metrics Cards */}
        <MetricsCards summary={summary} />

        {/* Performance Scoring Card */}
        <PerformanceScoreCard tierCounts={tierCounts} />

        {/* Bidder Performance Table (Layer 1 + Layer 2) */}
        <BidderTable bidders={bidders} onOpenKpiModal={handleOpenKpiModal} />

        {/* Context & Upwork Sub-Path Isolation Analytics */}
        <ContextAnalytics
          upworkBreakdown={upworkBreakdown}
          domainBreakdown={domainBreakdown}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        BidderFlow Activity & Performance Tracker • Manifest V3 Chrome Extension + Next.js Engine
      </footer>

      {/* Modals */}
      <KpiModal
        bidder={selectedBidderForKpi}
        date={currentDate}
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
        onSaved={fetchDashboardData}
      />

      <WebhookLogsModal
        isOpen={isWebhooksModalOpen}
        onClose={() => setIsWebhooksModalOpen(false)}
      />

      <SimulateModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onRefresh={fetchDashboardData}
      />
    </div>
  );
}
