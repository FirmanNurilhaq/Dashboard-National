"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GlobalFilterBar } from "@/components/layout/GlobalFilterBar";
import { KpiScorecards } from "@/components/widgets/KpiScorecards";
import { VelocityTrendChart } from "@/components/widgets/VelocityTrendChart";
import { ApprovalRateDonut } from "@/components/widgets/ApprovalRateDonut";
import { PipelineFunnelChart } from "@/components/widgets/PipelineFunnelChart";
import { AreaStackedBarChart } from "@/components/widgets/AreaStackedBarChart";
import { GeospatialMap3D } from "@/components/widgets/GeospatialMap3D";
import { InteractiveDataGrid } from "@/components/widgets/InteractiveDataGrid";
import {
  Assignment,
  DashboardKpiSummary,
  VelocityTrendPoint,
  ApprovalRateSummary,
  FunnelStage,
  AreaDistribution,
  MapSitePoint,
  GlobalFilterState,
} from "@/types/assignment";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    totalAssignment: 10134,
    siteOnAir: 9562,
    siteNotYetOa: 572,
    onAirRatio: 94.4,
    waitingDtAudit: 187,
    totalAccepted: 8957,
    totalRejected: 268,
    approvalRate: 88.4,
  });

  const [velocityData, setVelocityData] = useState<VelocityTrendPoint[]>([]);
  const [approvalData, setApprovalData] = useState<ApprovalRateSummary>({
    accCount: 8957,
    notYetAccCount: 909,
    rejectCount: 268,
    approvalRatePct: 88.4,
    topRejectReasons: [],
  });

  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [workloadData, setWorkloadData] = useState<AreaDistribution[]>([]);
  const [mapPoints, setMapPoints] = useState<MapSitePoint[]>([]);

  // Data Grid Pagination State
  const [gridRows, setGridRows] = useState<Assignment[]>([]);
  const [gridTotal, setGridTotal] = useState(10134);
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
    fetch("/api/dashboard/filters")
      .then((res) => res.json())
      .then((data) => {
        if (data.areas) setAvailableAreas(data.areas);
      })
      .catch((err) => console.error("Gagal memuat filter options:", err));
  }, []);

  // Fetch All Analytics Data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    const qs = buildFilterQuery();

    try {
      const [kpiRes, velRes, appRes, funRes, workRes, mapRes] = await Promise.all([
        fetch(`/api/dashboard/kpi?${qs}`),
        fetch(`/api/dashboard/velocity-trend?${qs}`),
        fetch(`/api/dashboard/approval-rate?${qs}`),
        fetch(`/api/dashboard/funnel?${qs}`),
        fetch(`/api/dashboard/workload?${qs}`),
        fetch(`/api/dashboard/map-points?${qs}`),
      ]);

      const [kpi, vel, app, fun, work, map] = await Promise.all([
        kpiRes.json(),
        velRes.json(),
        appRes.json(),
        funRes.json(),
        workRes.json(),
        mapRes.json(),
      ]);

      if (!kpi.error) setKpiData(kpi);
      if (Array.isArray(vel)) setVelocityData(vel);
      if (!app.error) setApprovalData(app);
      if (Array.isArray(fun)) setFunnelData(fun);
      if (Array.isArray(work)) setWorkloadData(work);
      if (Array.isArray(map)) setMapPoints(map);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildFilterQuery]);

  // Fetch Data Grid Rows
  const fetchGridData = useCallback(async (page: number) => {
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
  }, [buildFilterQuery]);

  // Trigger re-fetch on filter change
  useEffect(() => {
    fetchDashboardData();
    setGridPage(1);
    fetchGridData(1);
  }, [fetchDashboardData, fetchGridData]);

  const handlePageChange = (newPage: number) => {
    setGridPage(newPage);
    fetchGridData(newPage);
  };

  // Judul Halaman Sesuai Tab Aktif: Nexwave Productivity Dashboard
  const getTabTitle = () => {
    switch (activeTab) {
      case "velocity":
        return {
          title: "Tren Velocity & Pipeline Funnel",
          subtitle: "Analitik ritme harian konversi alur kerja operasional telekomunikasi",
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
          title: "Eksplorasi Data Grid Seluruh Assignment",
          subtitle: "Tabel interaktif baris detail 10.134 site, riwayat milestone, dan kendala",
        };
      default:
        return {
          title: "Nexwave Productivity Dashboard",
          subtitle: "Pusat Kendali Eksekutif Pemantauan Alur Kerja Operasional Telekomunikasi",
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      {/* Sidebar Navigation dengan Status Collapse Sinkron */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area: AUTO-ADJUST LEBAR KETIKA SIDEBAR COLLAPSED */}
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
          {/* Global Filter Bar Intuitif dengan Autocomplete & Multi-Select */}
          <GlobalFilterBar
            filterState={filterState}
            setFilterState={setFilterState}
            availableAreas={availableAreas}
            totalFiltered={kpiData.totalAssignment}
            totalAll={10134}
          />

          {/* TAB 1: OVERVIEW UTAMA */}
          {activeTab === "overview" && (
            <>
              {/* Row 1: KPI Scorecards (5 Cards, 3D Tilt) */}
              <KpiScorecards data={kpiData} />

              {/* Row 2: Main Visualization (Span 8) & Secondary Donut (Span 4) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <div className="lg:col-span-8">
                  <VelocityTrendChart data={velocityData} />
                </div>
                <div className="lg:col-span-4">
                  <ApprovalRateDonut data={approvalData} />
                </div>
              </div>

              {/* Row 3: Pipeline Funnel (Span 5) & Stacked Area Workload (Span 7) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <div className="lg:col-span-5">
                  <PipelineFunnelChart data={funnelData} />
                </div>
                <div className="lg:col-span-7">
                  <AreaStackedBarChart data={workloadData} />
                </div>
              </div>

              {/* Row 4: Peta 3D dengan Gedung & Menara BTS */}
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

          {/* TAB 2: TREN VELOCITY & PIPELINE */}
          {activeTab === "velocity" && (
            <div className="space-y-6">
              <KpiScorecards data={kpiData} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <VelocityTrendChart data={velocityData} />
                </div>
                <div className="lg:col-span-4">
                  <PipelineFunnelChart data={funnelData} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
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

          {/* TAB 4: PETA SITE 3D DENGAN GEDUNG */}
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
