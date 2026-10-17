"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { IconMapPin } from "@tabler/icons-react";
import { AreaDistribution } from "@/types/assignment";

interface AreaStackedBarChartProps {
  data: AreaDistribution[];
}

export function AreaStackedBarChart({ data }: AreaStackedBarChartProps) {
  // Ambil top 8 area teratas
  const displayData = data.slice(0, 8);

  return (
    <div className="glass-panel p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Distribusi Status per Area
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
              Stacked Workload
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">Beban Kerja Wilayah</span>
        </div>
        <p className="text-xs text-gray-400">
          Perbandingan backlog Not Yet On Air vs Pencapaian Accepted per Wilayah
        </p>
      </div>

      <div className="w-full h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />
            <XAxis
              dataKey="area"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const total = payload.reduce((acc, curr: any) => acc + (curr.value || 0), 0);
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-gray-200 shadow-lg text-xs">
                      <p className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                        <IconMapPin className="w-3.5 h-3.5 text-blue-600" stroke={1.8} /> {label}
                      </p>
                      <p className="text-[11px] text-gray-400 mb-2 font-medium">
                        Total Assignment: {total.toLocaleString()} Site
                      </p>
                      <div className="space-y-1">
                        {payload.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {item.value.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="accepted"
              name="Accepted"
              stackId="a"
              fill="#10b981"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              name="In Progress"
              stackId="a"
              fill="#f59e0b"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="notYetOa"
              name="Not Yet OA"
              stackId="a"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>JABO memegang volume assignment tertinggi</span>
        <span className="text-gray-500 font-medium">Klik bar untuk drilldown</span>
      </div>
    </div>
  );
}
