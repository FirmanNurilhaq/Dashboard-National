"use client";

import React from "react";
import dynamic from "next/dynamic";
import { IconMapPin, IconWorld, IconBroadcast } from "@tabler/icons-react";
import { MapSitePoint } from "@/types/assignment";

const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100/70 rounded-xl flex items-center justify-center text-xs text-gray-400 animate-pulse">
      Memuat modul peta geospasial Leaflet...
    </div>
  ),
});

interface GeospatialMapProps {
  points: MapSitePoint[];
}

export function GeospatialMap({ points }: GeospatialMapProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Peta Persebaran Geospasial Site
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {points.length.toLocaleString()} Koordinat Aktif
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Sebaran geografis menara telekomunikasi berdasarkan status operasional lapangan
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-white/70 px-3 py-1.5 rounded-xl border border-gray-200/60 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-[11px] text-gray-600 font-medium">Accepted / Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-[11px] text-gray-600 font-medium">DT / Audit In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-[11px] text-gray-600 font-medium">Not Yet OA / Reject</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-80 w-full rounded-xl overflow-hidden border border-gray-200/80 shadow-xs">
        <LeafletMap points={points} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
        <span>Didukung OpenStreetMap & Leaflet Clustering</span>
        <span>Klik marker lingkaran untuk detail Site ID, Area, dan Milestone</span>
      </div>
    </div>
  );
}
