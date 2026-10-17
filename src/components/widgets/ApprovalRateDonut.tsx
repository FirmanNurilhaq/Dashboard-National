"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { IconAlertCircle } from "@tabler/icons-react";
import { ApprovalRateSummary } from "@/types/assignment";

interface ApprovalRateDonutProps {
  data: ApprovalRateSummary;
}

export function ApprovalRateDonut({ data }: ApprovalRateDonutProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const chartData = [
    { name: "Accepted", value: data.accCount, color: "#10b981" },
    { name: "In Progress", value: data.notYetAccCount, color: "#f59e0b" },
    { name: "Rejected", value: data.rejectCount, color: "#ef4444" },
  ];

  return (
    <div className="glass-panel p-5 h-full flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Rasio Status Akhir</h2>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            {data.approvalRatePct}% Acc
          </span>
        </div>
        <p className="text-xs text-gray-400">Proporsi persetujuan dan kendala lapangan</p>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative w-full h-52 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-2 rounded-lg border border-gray-200 shadow-md text-xs">
                      <span className="font-semibold text-gray-900">{item.name}: </span>
                      <span className="font-bold">{item.value?.toLocaleString()} Site</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(d) => setHoveredSlice(d.name)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Approval Rate */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {data.approvalRatePct}%
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Approval Rate
          </span>
        </div>
      </div>

      {/* Interactive Top Reject Reasons (Shows on hover of Reject or at bottom) */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-2">
          <span className="flex items-center gap-1 text-rose-600">
            <IconAlertCircle className="w-3.5 h-3.5" stroke={1.8} /> Top Kendala Lapangan (Reject):
          </span>
          <span className="text-gray-400">{data.rejectCount} Total Reject</span>
        </div>

        <div className="space-y-1.5">
          {data.topRejectReasons.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-600 truncate max-w-[180px]">{r.reason}</span>
              <span className="font-semibold text-gray-900 shrink-0">{r.count} Site</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
