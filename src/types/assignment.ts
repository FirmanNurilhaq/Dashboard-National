export interface Assignment {
  recordId: string;
  pmoUniq: string | null;
  duId: string;
  siteId: string;
  siteName: string;
  programId: string | null;
  duModel: string | null;
  area: string;
  kabupaten: string;
  longitude: number | null;
  latitude: number | null;
  poRelease: string | null;
  statusPo: string | null;
  m06Date: string | null;
  oaDate: string | null;
  dtDate: string | null;
  auditDate: string | null;
  reportSubmitDate: string | null;
  accDate: string | null;
  rfCatIssueLevel2: string | null;
  picRf: string | null;
  isdpStatus: string | null;
  remark: string | null;
  milestoneNw: string;
  coordinateRaw: string | null;
  extraCol1: string | null;
  extraCol2: string | null;
  statusOa: 'On Air' | 'Not Yet OA';
  statusDt: 'Done' | 'NY DT';
  finalStatus: 'Acc' | 'Not Yet Acc' | 'Reject';
  rowHash: string;
}

export interface DashboardKpiSummary {
  totalAssignment: number;
  siteOnAir: number;
  siteNotYetOa: number;
  onAirRatio: number;
  waitingDtAudit: number;
  totalAccepted: number;
  totalRejected: number;
  approvalRate: number;
  changeVsLastPeriod?: {
    totalAssignmentPct: number;
    siteOnAirPct: number;
    acceptedPct: number;
  };
}

export interface VelocityTrendPoint {
  date: string;
  incoming: number;
  onAir: number;
  accepted: number;
}

export interface ApprovalRateSummary {
  accCount: number;
  notYetAccCount: number;
  rejectCount: number;
  approvalRatePct: number;
  topRejectReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionPct: number;
  dropRatePct: number;
}

export interface AreaDistribution {
  area: string;
  notYetOa: number;
  inProgress: number;
  accepted: number;
  rejected: number;
  total: number;
}

export interface MapSitePoint {
  siteId: string;
  siteName: string;
  duId: string;
  latitude: number;
  longitude: number;
  area: string;
  kabupaten: string;
  finalStatus: 'Acc' | 'Not Yet Acc' | 'Reject';
  milestoneNw: string;
  oaDate: string | null;
  remark: string | null;
}

export type SearchFieldType = 'all' | 'duId' | 'siteId' | 'siteName' | 'pmoUniq' | 'kabupaten';

export interface GlobalFilterState {
  searchField: SearchFieldType;
  searchQuery: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  selectedAreas: string[];
  selectedVendors: string[];
  selectedPrograms: string[];
  selectedStatuses: string[];
}
