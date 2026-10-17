"use client";

import React, { useState } from "react";
import {
  IconTable,
  IconDownload,
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Assignment } from "@/types/assignment";

interface InteractiveDataGridProps {
  data: Assignment[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function InteractiveDataGrid({
  data,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
}: InteractiveDataGridProps) {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const exportCsv = () => {
    if (data.length === 0) return;
    const headers = [
      "Record_ID",
      "DU_ID",
      "Site_ID",
      "Site_Name",
      "Area",
      "Kabupaten",
      "OA_Date",
      "DT_Date",
      "Audit_Date",
      "Acc_Date",
      "Milestone_NW",
      "Final_Status",
      "Remark",
    ];
    const rows = data.map((d) => [
      d.recordId,
      d.duId,
      d.siteId,
      `"${d.siteName.replace(/"/g, '""')}"`,
      d.area,
      d.kabupaten,
      d.oaDate || "Not Yet",
      d.dtDate || "Not Yet",
      d.auditDate || "Not Yet",
      d.accDate || "Not Yet",
      `"${d.milestoneNw.replace(/"/g, '""')}"`,
      d.finalStatus,
      `"${(d.remark || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telecom_assignments_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel p-5">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <IconTable className="w-4 h-4 text-blue-600" stroke={1.8} />
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Interactive Data Grid
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
              {totalRecords.toLocaleString()} Baris Data
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Eksplorasi data tingkat baris (update in-place, tanggal tahapan, dan catatan kendala)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors"
          >
            <IconDownload className="w-3.5 h-3.5 text-gray-500" stroke={1.8} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container with Sticky Header */}
      <div className="relative overflow-x-auto rounded-xl border border-gray-200/80 shadow-xs max-h-[480px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">DU ID / PMO</th>
              <th className="py-2.5 px-3">Site ID & Nama</th>
              <th className="py-2.5 px-3">Wilayah (Area/Kab)</th>
              <th className="py-2.5 px-3 text-center">Connected / OA</th>
              <th className="py-2.5 px-3 text-center">Drive Test</th>
              <th className="py-2.5 px-3 text-center">Audit</th>
              <th className="py-2.5 px-3 text-center">Accepted</th>
              <th className="py-2.5 px-3">Milestone NW</th>
              <th className="py-2.5 px-3 text-center">Final Status</th>
              <th className="py-2.5 px-3 min-w-[200px]">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/70">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Memuat baris data assignment...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400">
                  Tidak ada data yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.recordId} className="hover:bg-blue-50/40 transition-colors">
                  {/* DU ID & PMO */}
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    <div className="truncate max-w-[150px]">{row.duId}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{row.pmoUniq || "-"}</div>
                  </td>

                  {/* Site ID & Name */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-blue-700">{row.siteId}</div>
                    <div className="text-[11px] text-gray-500 truncate max-w-[140px]">{row.siteName}</div>
                  </td>

                  {/* Area / Kabupaten */}
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {row.area}
                    </span>
                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{row.kabupaten}</div>
                  </td>

                  {/* Connected / OA Date */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    {row.oaDate ? (
                      <span className="text-gray-900">{row.oaDate}</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-sans">
                        NY OA
                      </span>
                    )}
                  </td>

                  {/* DT Date */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    {row.dtDate ? (
                      <span className="text-gray-900">{row.dtDate}</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-sans">
                        NY DT
                      </span>
                    )}
                  </td>

                  {/* Audit Date */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    {row.auditDate ? (
                      <span className="text-gray-900">{row.auditDate}</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-sans">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Acc Date */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                    {row.accDate ? (
                      <span className="text-emerald-700 font-semibold">{row.accDate}</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-sans">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Milestone NW */}
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-gray-700 truncate max-w-[130px] block font-medium">
                      {row.milestoneNw}
                    </span>
                  </td>

                  {/* Final Status */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.finalStatus === "Acc"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : row.finalStatus === "Reject"
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}
                    >
                      {row.finalStatus === "Acc" ? (
                        <IconCircleCheck className="w-3.5 h-3.5 text-emerald-600" stroke={2} />
                      ) : row.finalStatus === "Reject" ? (
                        <IconAlertCircle className="w-3.5 h-3.5 text-rose-600" stroke={2} />
                      ) : (
                        <IconClock className="w-3.5 h-3.5 text-amber-600" stroke={2} />
                      )}
                      {row.finalStatus}
                    </span>
                  </td>

                  {/* Remark */}
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-gray-500 line-clamp-1" title={row.remark || ""}>
                      {row.remark || "-"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100 text-xs">
        <span className="text-gray-400 text-[11px]">
          Menampilkan baris {(currentPage - 1) * pageSize + 1} s/d{" "}
          {Math.min(currentPage * pageSize, totalRecords)} dari total {totalRecords.toLocaleString()} record
        </span>

        <div className="flex items-center gap-1.5 self-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && !isLoading) {
                onPageChange(currentPage - 1);
              }
            }}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs"
          >
            <IconChevronLeft className="w-4 h-4" stroke={1.8} />
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages && !isLoading) {
                onPageChange(currentPage + 1);
              }
            }}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs"
          >
            <IconChevronRight className="w-4 h-4" stroke={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
