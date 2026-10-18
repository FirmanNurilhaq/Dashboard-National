"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  IconBroadcast,
  IconClock,
  IconCircleCheck,
  IconFolders,
} from "@tabler/icons-react";
import { DashboardKpiSummary } from "@/types/assignment";

interface KpiScorecardsProps {
  data: DashboardKpiSummary;
}

interface TiltCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  colorClass: string;
  delay: number;
  sparklineData: number[];
}

function TiltCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  delay,
  sparklineData,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt (2-3 degrees)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  };

  // Sparkline path generator
  const maxVal = Math.max(...sparklineData);
  const minVal = Math.min(...sparklineData);
  const range = maxVal - minVal || 1;
  const points = sparklineData
    .map((v, i) => {
      const x = (i / (sparklineData.length - 1)) * 90;
      const y = 30 - ((v - minVal) / range) * 22;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay * 0.05 }}
      className="kpi-card-3d"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass-panel p-4 relative overflow-hidden transition-transform duration-200 cursor-default"
      >
        {/* Subtle Background Sparkline SVG */}
        <div className="absolute right-2 bottom-1 opacity-25 pointer-events-none">
          <svg
            width="90"
            height="32"
            viewBox="0 0 90 32"
            className="overflow-visible"
            vectorEffect="non-scaling-stroke"
            aria-label="Sparkline tren metrik"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={colorClass}
              points={points}
            />
          </svg>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 tracking-tight">{title}</span>
          <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon className="w-4 h-4" stroke={1.8} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        </div>

        <p className="text-[11px] text-gray-400 font-medium truncate">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function KpiScorecards({ data }: KpiScorecardsProps) {
  const cards = [
    {
      title: "Total SOW",
      value: data.totalAssignment.toLocaleString(),
      subtitle: "Scope of Work DU ID Nasional",
      icon: IconFolders,
      colorClass: "text-blue-600 bg-blue-600",
      delay: 1,
      sparklineData: [45, 52, 49, 60, 68, 74, 82],
    },
    {
      title: "Site On Air",
      value: data.siteOnAir.toLocaleString(),
      subtitle: `${data.onAirRatio}% dari Total SOW (NY OA: ${data.siteNotYetOa})`,
      icon: IconBroadcast,
      colorClass: "text-emerald-600 bg-emerald-600",
      delay: 2,
      sparklineData: [30, 42, 50, 58, 64, 72, 85],
    },
    {
      title: "Menunggu DT & Audit",
      value: data.waitingDtAudit.toLocaleString(),
      subtitle: "Backlog Tahap Operasional Lapangan",
      icon: IconClock,
      colorClass: "text-amber-600 bg-amber-600",
      delay: 3,
      sparklineData: [60, 58, 55, 50, 48, 42, 38],
    },
    {
      title: "Total Accepted",
      value: data.totalAccepted.toLocaleString(),
      subtitle: `${data.approvalRate}% Approval Rate Nasional`,
      icon: IconCircleCheck,
      colorClass: "text-purple-600 bg-purple-600",
      delay: 4,
      sparklineData: [20, 35, 48, 65, 75, 82, 92],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <TiltCard key={card.title} {...card} />
      ))}
    </div>
  );
}
