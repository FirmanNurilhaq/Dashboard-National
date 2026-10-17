"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { IconTrendingUp, IconCalendar } from "@tabler/icons-react";
import { VelocityTrendPoint } from "@/types/assignment";

interface VelocityTrendChartProps {
  data: VelocityTrendPoint[];
}

export function VelocityTrendChart({ data }: VelocityTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<"all" | "accepted" | "onAir">("all");

  const formattedData = data.map((d) => ({
    ...d,
    displayDate: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="glass-panel p-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Tren Kecepatan Penyelesaian (Velocity Trend)
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              Live KPI
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Perbandingan deret waktu: Masuk vs On Air vs Accepted Final
          </p>
        </div>

        {/* Legend / Filter Chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[11px]">Incoming</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px]">On Air</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Accepted</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOnAir" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />

            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
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
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-gray-200/80 shadow-lg text-xs">
                      <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                        <IconCalendar className="w-3.5 h-3.5 text-gray-400" stroke={1.8} /> Tanggal: {label}
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
                            <span className="font-bold text-gray-900">{item.value} Site</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="incoming"
              name="Incoming"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncoming)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="onAir"
              name="On Air"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOnAir)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="accepted"
              name="Accepted"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorAccepted)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>Akselerasi garis gradien memudar</span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <IconTrendingUp className="w-3.5 h-3.5" stroke={2} /> Konversi stabil
        </span>
      </div>
    </div>
  );
}
