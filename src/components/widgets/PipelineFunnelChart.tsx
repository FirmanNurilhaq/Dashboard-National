"use client";

import { IconFilter } from "@tabler/icons-react";
import { FunnelStage } from "@/types/assignment";

interface PipelineFunnelChartProps {
  data: FunnelStage[];
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  const stageColors = [
    "from-blue-600 to-blue-500",
    "from-indigo-600 to-indigo-500",
    "from-cyan-600 to-cyan-500",
    "from-teal-600 to-teal-500",
    "from-emerald-500 to-emerald-400",
    "from-emerald-600 to-green-500",
  ];

  return (
    <div className="glass-panel p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Pipeline Alur Kerja</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-1">
              <IconFilter className="w-3 h-3 text-indigo-600" stroke={2} /> Funnel 6 Tahap
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">Conversion Rate</span>
        </div>
        <p className="text-xs text-gray-400">
          Penurunan konversi dari Assignment hingga Accepted Final
        </p>
      </div>

      {/* Funnel Steps */}
      <div className="space-y-2.5 my-3">
        {data.map((stage, idx) => {
          const barWidth = Math.max(15, stage.conversionPct);
          return (
            <div key={stage.stage} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 text-[11px] truncate">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">
                    {stage.dropRatePct > 0 ? `-${stage.dropRatePct}% drop` : "Baseline"}
                  </span>
                  <span className="font-bold text-gray-900 text-xs">
                    {stage.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 w-10 text-right">
                    {stage.conversionPct}%
                  </span>
                </div>
              </div>

              {/* Funnel Bar Container */}
              <div className="w-full bg-gray-100/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    stageColors[idx % stageColors.length]
                  } transition-all duration-500 shadow-xs`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>Kandidat bottleneck: Tahap Audit</span>
        <span className="text-indigo-600 font-medium">Monitoring per jam</span>
      </div>
    </div>
  );
}
