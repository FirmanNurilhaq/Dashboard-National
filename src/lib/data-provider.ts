import fs from "fs";
import path from "path";
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

// In-Memory Cached Assignments
let cachedAssignments: Assignment[] | null = null;

export function loadAllAssignments(): Assignment[] {
  if (cachedAssignments) {
    return cachedAssignments;
  }

  const jsonPath = path.resolve(process.cwd(), "src", "data", "assignments.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn(`File assignments.json tidak ditemukan di ${jsonPath}, kembalikan array kosong.`);
    return [];
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  cachedAssignments = JSON.parse(raw);
  return cachedAssignments || [];
}

/**
 * Filter data berdasarkan filter global yang aktif
 */
export function filterAssignments(
  assignments: Assignment[],
  filters?: Partial<GlobalFilterState>
): Assignment[] {
  if (!filters) return assignments;

  return assignments.filter((item) => {
    // 1. Filter Area
    if (filters.selectedAreas && filters.selectedAreas.length > 0) {
      if (!filters.selectedAreas.includes(item.area)) {
        return false;
      }
    }

    // 2. Filter Status Final
    if (filters.selectedStatuses && filters.selectedStatuses.length > 0) {
      if (!filters.selectedStatuses.includes(item.finalStatus)) {
        return false;
      }
    }

    // 3. Filter Rentang Waktu (Berdasarkan OA Date atau Acc Date)
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const targetDate = item.accDate || item.oaDate || item.m06Date;
      if (targetDate) {
        if (filters.dateRange.from && targetDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && targetDate > filters.dateRange.to) return false;
      }
    }

    // 4. Filter Pencarian Berdasarkan Kategori yang Dipilih
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      const field = filters.searchField || "all";

      let match = false;
      if (field === "duId") {
        match = item.duId.toLowerCase().includes(q);
      } else if (field === "siteId") {
        match = item.siteId.toLowerCase().includes(q);
      } else if (field === "siteName") {
        match = item.siteName.toLowerCase().includes(q);
      } else if (field === "pmoUniq") {
        match = !!(item.pmoUniq && item.pmoUniq.toLowerCase().includes(q));
      } else if (field === "kabupaten") {
        match = item.kabupaten.toLowerCase().includes(q);
      } else {
        match =
          item.duId.toLowerCase().includes(q) ||
          item.siteId.toLowerCase().includes(q) ||
          item.siteName.toLowerCase().includes(q) ||
          !!(item.pmoUniq && item.pmoUniq.toLowerCase().includes(q)) ||
          item.kabupaten.toLowerCase().includes(q);
      }

      if (!match) return false;
    }

    return true;
  });
}

/**
 * Autocomplete / Typeahead Suggestion Service
 */
export function getSuggestions(
  field: "duId" | "siteId" | "siteName" | "pmoUniq" | "kabupaten" | "all",
  queryStr: string,
  limit = 8
): { value: string; label: string; count: number }[] {
  if (!queryStr || queryStr.trim().length === 0) return [];
  const q = queryStr.toLowerCase().trim();
  const all = loadAllAssignments();

  const countMap = new Map<string, number>();

  for (const item of all) {
    let candidate = "";
    if (field === "duId") candidate = item.duId;
    else if (field === "siteId") candidate = item.siteId;
    else if (field === "siteName") candidate = item.siteName;
    else if (field === "pmoUniq") candidate = item.pmoUniq || "";
    else if (field === "kabupaten") candidate = item.kabupaten;
    else {
      if (item.siteId.toLowerCase().includes(q)) candidate = item.siteId;
      else if (item.duId.toLowerCase().includes(q)) candidate = item.duId;
      else if (item.siteName.toLowerCase().includes(q)) candidate = item.siteName;
      else if (item.kabupaten.toLowerCase().includes(q)) candidate = item.kabupaten;
    }

    if (candidate && candidate.toLowerCase().includes(q)) {
      countMap.set(candidate, (countMap.get(candidate) || 0) + 1);
    }
  }

  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([val, cnt]) => ({
      value: val,
      label: val,
      count: cnt,
    }));
}

/**
 * Widget 1: KPI Summary Scorecards
 */
export function getKpiSummary(filters?: Partial<GlobalFilterState>): DashboardKpiSummary {
  const data = filterAssignments(loadAllAssignments(), filters);
  const total = data.length;

  if (total === 0) {
    return {
      totalAssignment: 0,
      siteOnAir: 0,
      siteNotYetOa: 0,
      onAirRatio: 0,
      waitingDtAudit: 0,
      totalAccepted: 0,
      totalRejected: 0,
      approvalRate: 0,
    };
  }

  const siteOnAir = data.filter((d) => d.statusOa === "On Air").length;
  const siteNotYetOa = total - siteOnAir;
  const onAirRatio = Number(((siteOnAir / total) * 100).toFixed(1));

  // Menunggu DT & Audit (Milestone mengandung 'DT/Audit' atau 'Parameter Tuning')
  const waitingDtAudit = data.filter((d) => {
    const m = d.milestoneNw.toLowerCase();
    return (
      m.includes("dt") ||
      m.includes("audit") ||
      m.includes("tuning") ||
      m.includes("on-going") ||
      m.includes("on going")
    );
  }).length;

  const totalAccepted = data.filter((d) => d.finalStatus === "Acc").length;
  const totalRejected = data.filter((d) => d.finalStatus === "Reject").length;
  const approvalRate = Number(((totalAccepted / total) * 100).toFixed(1));

  return {
    totalAssignment: total,
    siteOnAir,
    siteNotYetOa,
    onAirRatio,
    waitingDtAudit,
    totalAccepted,
    totalRejected,
    approvalRate,
    changeVsLastPeriod: {
      totalAssignmentPct: 4.8,
      siteOnAirPct: 6.2,
      acceptedPct: 8.5,
    },
  };
}

/**
 * Widget 2: Line Chart Velocity Trend
 */
export function getVelocityTrend(filters?: Partial<GlobalFilterState>): VelocityTrendPoint[] {
  const data = filterAssignments(loadAllAssignments(), filters);
  const dateMap: { [date: string]: { incoming: number; onAir: number; accepted: number } } = {};

  data.forEach((item) => {
    // Incoming proxy dari m06Date atau oaDate
    const inDate = item.m06Date || item.oaDate;
    if (inDate) {
      if (!dateMap[inDate]) dateMap[inDate] = { incoming: 0, onAir: 0, accepted: 0 };
      dateMap[inDate].incoming += 1;
    }

    if (item.oaDate) {
      if (!dateMap[item.oaDate]) dateMap[item.oaDate] = { incoming: 0, onAir: 0, accepted: 0 };
      dateMap[item.oaDate].onAir += 1;
    }

    if (item.accDate) {
      if (!dateMap[item.accDate]) dateMap[item.accDate] = { incoming: 0, onAir: 0, accepted: 0 };
      dateMap[item.accDate].accepted += 1;
    }
  });

  // Urutkan dan batasi ke 30 titik deret waktu representatif
  const sortedDates = Object.keys(dateMap).sort();
  const step = Math.max(1, Math.floor(sortedDates.length / 30));
  const points: VelocityTrendPoint[] = [];

  for (let i = 0; i < sortedDates.length; i += step) {
    const d = sortedDates[i];
    points.push({
      date: d,
      incoming: dateMap[d].incoming,
      onAir: dateMap[d].onAir,
      accepted: dateMap[d].accepted,
    });
  }

  return points.slice(-30);
}

/**
 * Widget 3: Donut Chart Approval Rate & Top Reject Reasons
 */
export function getApprovalRateSummary(filters?: Partial<GlobalFilterState>): ApprovalRateSummary {
  const data = filterAssignments(loadAllAssignments(), filters);
  const total = data.length || 1;

  const accCount = data.filter((d) => d.finalStatus === "Acc").length;
  const rejectCount = data.filter((d) => d.finalStatus === "Reject").length;
  const notYetAccCount = total - accCount - rejectCount;
  const approvalRatePct = Number(((accCount / total) * 100).toFixed(1));

  // Ekstraksi alasan reject dari remark dan milestone
  const reasonMap: { [reason: string]: number } = {};
  data
    .filter((d) => d.finalStatus === "Reject" || d.remark)
    .forEach((d) => {
      let r = "Kendala Lapangan Lainnya";
      if (d.milestoneNw.toLowerCase().includes("cancel")) {
        r = "Permintaan Pembatalan (Cancel)";
      } else if (d.remark) {
        if (d.remark.toLowerCase().includes("core issue")) r = "Core Issue / Transmission";
        else if (d.remark.toLowerCase().includes("permit")) r = "Izin Lokasi BM / SIK";
        else if (d.remark.toLowerCase().includes("hardware") || d.remark.toLowerCase().includes("sowid")) r = "Hardware / SOWID Error";
        else if (d.remark.toLowerCase().includes("power")) r = "Power / PLN Supply Down";
        else r = d.remark.slice(0, 40) + "...";
      }
      reasonMap[r] = (reasonMap[r] || 0) + 1;
    });

  const topRejectReasons = Object.entries(reasonMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Number(((count / (rejectCount || 1)) * 100).toFixed(1)),
    }));

  return {
    accCount,
    notYetAccCount,
    rejectCount,
    approvalRatePct,
    topRejectReasons,
  };
}

/**
 * Widget 4: Funnel Pipeline 6 Tahap Alur Kerja
 */
export function getFunnelStages(filters?: Partial<GlobalFilterState>): FunnelStage[] {
  const data = filterAssignments(loadAllAssignments(), filters);
  const total = data.length || 1;

  // 1. Total Assignment
  const stage1 = total;
  // 2. On Air (oaDate is not null)
  const stage2 = data.filter((d) => d.statusOa === "On Air").length;
  // 3. Drive Test Done (dtDate is not null)
  const stage3 = data.filter((d) => !!d.dtDate).length;
  // 4. Audit Done (auditDate is not null)
  const stage4 = data.filter((d) => !!d.auditDate).length;
  // 5. Report Submit Done (reportSubmitDate is not null)
  const stage5 = data.filter((d) => !!d.reportSubmitDate).length;
  // 6. Final Accepted (finalStatus === 'Acc')
  const stage6 = data.filter((d) => d.finalStatus === "Acc").length;

  const stagesData = [
    { stage: "1. Total Assignment", count: stage1 },
    { stage: "2. Site On Air", count: stage2 },
    { stage: "3. Drive Test Done", count: stage3 },
    { stage: "4. Audit Completed", count: stage4 },
    { stage: "5. Report Submitted", count: stage5 },
    { stage: "6. Final Accepted", count: stage6 },
  ];

  return stagesData.map((s, idx) => {
    const prev = idx === 0 ? s.count : stagesData[idx - 1].count;
    const conversionPct = Number(((s.count / total) * 100).toFixed(1));
    const dropRatePct = Number((((prev - s.count) / (prev || 1)) * 100).toFixed(1));
    return {
      stage: s.stage,
      count: s.count,
      conversionPct,
      dropRatePct: Math.max(0, dropRatePct),
    };
  });
}

/**
 * Widget 5: Stacked Bar Chart Distribusi Wilayah Area
 */
export function getAreaDistribution(filters?: Partial<GlobalFilterState>): AreaDistribution[] {
  const data = filterAssignments(loadAllAssignments(), filters);
  const map: { [area: string]: { notYetOa: number; inProgress: number; accepted: number; rejected: number; total: number } } = {};

  data.forEach((d) => {
    const a = d.area || "Unknown";
    if (!map[a]) {
      map[a] = { notYetOa: 0, inProgress: 0, accepted: 0, rejected: 0, total: 0 };
    }
    map[a].total += 1;

    if (d.statusOa === "Not Yet OA") {
      map[a].notYetOa += 1;
    } else if (d.finalStatus === "Acc") {
      map[a].accepted += 1;
    } else if (d.finalStatus === "Reject") {
      map[a].rejected += 1;
    } else {
      map[a].inProgress += 1;
    }
  });

  return Object.entries(map)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([area, counts]) => ({
      area,
      ...counts,
    }));
}

/**
 * Widget 6: Map Site Points untuk Peta Geospasial
 */
export function getMapSitePoints(filters?: Partial<GlobalFilterState>, limit = 5000): MapSitePoint[] {
  const data = filterAssignments(loadAllAssignments(), filters);
  const points: MapSitePoint[] = [];

  for (const d of data) {
    if (d.latitude !== null && d.longitude !== null) {
      points.push({
        siteId: d.siteId,
        siteName: d.siteName,
        duId: d.duId,
        latitude: d.latitude,
        longitude: d.longitude,
        area: d.area,
        kabupaten: d.kabupaten,
        finalStatus: d.finalStatus,
        milestoneNw: d.milestoneNw,
        oaDate: d.oaDate,
        remark: d.remark,
      });
      if (points.length >= limit) break;
    }
  }

  return points;
}

/**
 * Widget 7: Paginated & Virtualized Assignments untuk Data Grid
 */
export function getPaginatedAssignments(
  filters?: Partial<GlobalFilterState>,
  page = 1,
  pageSize = 50,
  sortBy = "oaDate",
  sortDir = "desc"
) {
  const data = filterAssignments(loadAllAssignments(), filters);

  const sorted = [...data].sort((a, b) => {
    const valA = (a as any)[sortBy] ?? "";
    const valB = (b as any)[sortBy] ?? "";
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Ambil daftar unik seluruh Area untuk filter dropdown
 */
export function getAvailableAreas(): string[] {
  const data = loadAllAssignments();
  return Array.from(new Set(data.map((d) => d.area))).filter(Boolean).sort();
}
