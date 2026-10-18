"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalFilterBar } from "@/components/layout/GlobalFilterBar";
import { KpiScorecards } from "@/components/widgets/KpiScorecards";
import { Sheet2Analytics } from "@/components/widgets/Sheet2Analytics";
import { ApprovalRateDonut } from "@/components/widgets/ApprovalRateDonut";
import { PipelineFunnelChart } from "@/components/widgets/PipelineFunnelChart";
import { AreaStackedBarChart } from "@/components/widgets/AreaStackedBarChart";
import { GeospatialMap3D } from "@/components/widgets/GeospatialMap3D";
import { InteractiveDataGrid } from "@/components/widgets/InteractiveDataGrid";
import {
  Assignment,
  DashboardKpiSummary,
  ApprovalRateSummary,
  FunnelStage,
  AreaDistribution,
  MapSitePoint,
  GlobalFilterState,
} from "@/types/assignment";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 1. Guard Otentikasi: Pastikan user sudah login sebelum memuat dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("telecom_user");
      if (!savedUser) {
        router.replace("/login");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Global Filter State dengan Kategori Pencarian
  const [filterState, setFilterState] = useState<GlobalFilterState>({
    searchField: "all",
    searchQuery: "",
    dateRange: { from: null, to: null },
    selectedAreas: [],
    selectedVendors: [],
    selectedPrograms: [],
    selectedStatuses: [],
  });

  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Widget States
  const [kpiData, setKpiData] = useState<DashboardKpiSummary>({
    totalAssignment: 10112,
    siteOnAir: 9637,
    siteNotYetOa: 475,
    onAirRatio: 95.3,
    waitingDtAudit: 472,
    totalAccepted: 8981,
    totalRejected: 311,
    approvalRate: 88.8,
  });

  const [approvalData, setApprovalData] = useState<ApprovalRateSummary>({
    accCount: 8981,
    notYetAccCount: 842,
    rejectCount: 311,
    approvalRatePct: 88.8,
    topRejectReasons: [],
  });

  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [workloadData, setWorkloadData] = useState<AreaDistribution[]>([]);
  const [mapPoints, setMapPoints] = useState<MapSitePoint[]>([]);

  // Data Grid Pagination State
  const [gridRows, setGridRows] = useState<Assignment[]>([]);
  const [gridTotal, setGridTotal] = useState(10112);
  const [gridPage, setGridPage] = useState(1);
  const [isGridLoading, setIsGridLoading] = useState(false);

  // Helper untuk format query string filter
  const buildFilterQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filterState.searchField && filterState.searchField !== "all") {
      params.set("field", filterState.searchField);
    }
    if (filterState.searchQuery) params.set("q", filterState.searchQuery);
    if (filterState.dateRange.from) params.set("from", filterState.dateRange.from);
    if (filterState.dateRange.to) params.set("to", filterState.dateRange.to);
    filterState.selectedAreas.forEach((a) => params.append("area", a));
    filterState.selectedStatuses.forEach((s) => params.append("status", s));
    return params.toString();
  }, [filterState]);

  // Load Filter Options
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/dashboard/filters")
        .then((res) => res.json())
        .then((data) => {
          if (data.areas) setAvailableAreas(data.areas);
        })
        .catch((err) => console.error("Gagal memuat filter options:", err));
    }
  }, [isAuthenticated]);

  // Fetch All Analytics Data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const qs = buildFilterQuery();

    try {
      const [kpiRes, appRes, funRes, workRes, mapRes] = await Promise.all([
        fetch(`/api/dashboard/kpi?${qs}`),
        fetch(`/api/dashboard/approval-rate?${qs}`),
        fetch(`/api/dashboard/funnel?${qs}`),
        fetch(`/api/dashboard/workload?${qs}`),
        fetch(`/api/dashboard/map-points?${qs}`),
      ]);

      const [kpi, app, fun, work, map] = await Promise.all([
        kpiRes.json(),
        appRes.json(),
        funRes.json(),
        workRes.json(),
        mapRes.json(),
      ]);

      if (!kpi.error) setKpiData(kpi);
      if (!app.error) setApprovalData(app);
      if (Array.isArray(fun)) setFunnelData(fun);
      if (Array.isArray(work)) setWorkloadData(work);
      if (Array.isArray(map)) setMapPoints(map);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildFilterQuery, isAuthenticated]);

  // Fetch Data Grid Rows
  const fetchGridData = useCallback(async (page: number) => {
    if (!isAuthenticated) return;
    setIsGridLoading(true);
    const qs = buildFilterQuery();
    try {
      const res = await fetch(`/api/assignments?page=${page}&pageSize=50&${qs}`);
      const data = await res.json();
      if (data.rows) {
        setGridRows(data.rows);
        setGridTotal(data.total);
      }
    } catch (err) {
      console.error("Gagal mengambil data grid:", err);
    } finally {
      setIsGridLoading(false);
    }
  }, [buildFilterQuery, isAuthenticated]);

  // Trigger re-fetch on filter change
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      setGridPage(1);
      fetchGridData(1);
    }
  }, [fetchDashboardData, fetchGridData, isAuthenticated]);

  const handlePageChange = (newPage: number) => {
    setGridPage(newPage);
    fetchGridData(newPage);
  };

  // Judul Halaman Sesuai Tab Aktif
  const getTabTitle = () => {
    switch (activeTab) {
      case "sheet2":
        return {
          title: "Overview Analytics & Pivot Tracker",
          subtitle: "Hierarki matriks Simple ISDP, Simple Milestone, dan Sebaran Wilayah",
        };
      case "workload":
        return {
          title: "Distribusi Beban Kerja Wilayah",
          subtitle: "Monitoring backlog Not Yet OA vs rasio Accepted per Area operasional",
        };
      case "map3d":
        return {
          title: "Peta 3D Geospasial & Elevasi Gedung (Zero API Key)",
          subtitle: "Visualisasi 3D WebGL menara BTS dan footprint gedung metropolitan",
        };
      case "grid":
        return {
          title: "Eksplorasi Data Grid Seluruh SOW",
          subtitle: "Tabel interaktif baris detail 10.112 site, riwayat milestone, dan kendala",
        };
      default:
        return {
          title: "Telkomsel NW RF National Productivity Dashboard",
          subtitle: "Pusat Kendali Eksekutif Pemantauan SOW Alur Kerja Operasional Telekomunikasi",
        };
    }
  };

  // Layar Pengecekan Otentikasi
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-gray-400 font-medium">Memverifikasi otentikasi sesi...</span>
      </div>
    );
  }

  const { title, subtitle } = getTabTitle();

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header
          title={title}
          subtitle={subtitle}
          totalRecords={kpiData.totalAssignment}
          onRefresh={fetchDashboardData}
          isLoading={isLoading}
        />

        <main className="p-6 max-w-[1600px] mx-auto">
          {/* Global Filter Bar */}
          <GlobalFilterBar
            filterState={filterState}
            setFilterState={setFilterState}
            availableAreas={availableAreas}
            totalFiltered={kpiData.totalAssignment}
            totalAll={10112}
          />

          {/* TAB 1: OVERVIEW UTAMA */}
          {activeTab === "overview" && (
            <>
              {/* Row 1: KPI Scorecards (4 Cards: Total SOW, Site On Air, Menunggu DT & Audit, Total Accepted) */}
              <KpiScorecards data={kpiData} />

              {/* Row 2: Sheet2 Analytics Suite (Pivot Matrix Table & 3 Bar Charts) */}
              <Sheet2Analytics />

              {/* Row 3: Pipeline Funnel, Donut Approval Rate & Stacked Workload */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <div className="lg:col-span-4">
                  <ApprovalRateDonut data={approvalData} />
                </div>
                <div className="lg:col-span-4">
                  <PipelineFunnelChart data={funnelData} />
                </div>
                <div className="lg:col-span-4">
                  <AreaStackedBarChart data={workloadData} />
                </div>
              </div>

              {/* Row 4: Peta 3D Geospasial dengan Gedung & Menara BTS */}
              <div className="mb-6">
                <GeospatialMap3D points={mapPoints} />
              </div>

              {/* Row 5: Interactive Data Grid */}
              <div className="mb-8">
                <InteractiveDataGrid
                  data={gridRows}
                  totalRecords={gridTotal}
                  currentPage={gridPage}
                  pageSize={50}
                  onPageChange={handlePageChange}
                  isLoading={isGridLoading}
                />
              </div>
            </>
          )}

          {/* TAB 2: SHEET2 ANALYTICS */}
          {activeTab === "sheet2" && (
            <div className="space-y-6">
              <KpiScorecards data={kpiData} />
              <Sheet2Analytics />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <PipelineFunnelChart data={funnelData} />
                </div>
                <div className="lg:col-span-6">
                  <ApprovalRateDonut data={approvalData} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BEBAN WILAYAH (WORKLOAD) */}
          {activeTab === "workload" && (
            <div className="space-y-6">
              <KpiScorecards data={kpiData} />
              <div className="grid grid-cols-1 gap-6">
                <AreaStackedBarChart data={workloadData} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <ApprovalRateDonut data={approvalData} />
                </div>
                <div className="lg:col-span-6">
                  <PipelineFunnelChart data={funnelData} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PETA SITE 3D */}
          {activeTab === "map3d" && (
            <div className="space-y-6">
              <KpiScorecards data={kpiData} />
              <GeospatialMap3D points={mapPoints} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <AreaStackedBarChart data={workloadData} />
                </div>
                <div className="lg:col-span-6">
                  <ApprovalRateDonut data={approvalData} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA GRID EXPLORER */}
          {activeTab === "grid" && (
            <div className="space-y-6">
              <InteractiveDataGrid
                data={gridRows}
                totalRecords={gridTotal}
                currentPage={gridPage}
                pageSize={50}
                onPageChange={handlePageChange}
                isLoading={isGridLoading}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
