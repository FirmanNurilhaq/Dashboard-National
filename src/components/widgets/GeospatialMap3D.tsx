"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  IconBuildingSkyscraper,
  IconRotateClockwise,
} from "@tabler/icons-react";
import { MapSitePoint } from "@/types/assignment";

const MapLibre3D = dynamic(() => import("./MapLibre3DInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-xs text-gray-400 gap-3 border border-white/10">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-semibold text-gray-200">
        Memuat Engine 3D OpenFreeMap & Bangunan WebGL...
      </span>
      <span className="text-[11px] text-gray-400">Zero API Key • OpenStreetMap Data</span>
    </div>
  ),
});

interface GeospatialMap3DProps {
  points: MapSitePoint[];
}

export function GeospatialMap3D({ points }: GeospatialMap3DProps) {
  const [isRotating, setIsRotating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("https://tiles.openfreemap.org/styles/liberty");

  const styleOptions = [
    { label: "OpenFreeMap Liberty (3D)", url: "https://tiles.openfreemap.org/styles/liberty" },
    { label: "OpenFreeMap Positron (Light)", url: "https://tiles.openfreemap.org/styles/positron" },
    { label: "OpenFreeMap Bright", url: "https://tiles.openfreemap.org/styles/bright" },
  ];

  return (
    <div className="glass-panel p-5 relative overflow-hidden border border-white/80 shadow-xl">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600">
              <IconBuildingSkyscraper className="w-4 h-4" stroke={1.8} />
            </div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              Peta Persebaran Geospasial 3D Site (OpenFreeMap + 3D Buildings)
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/70">
              Zero API Key
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Menampilkan bangunan 3D dari OpenMapTiles / OpenStreetMap dan menara telekomunikasi Nexwave
          </p>
        </div>

        {/* 3D Action Tools & Style Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Style Selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
            {styleOptions.map((st) => (
              <button
                type="button"
                key={st.label}
                onClick={() => setSelectedStyle(st.url)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedStyle === st.url
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {st.label.replace("OpenFreeMap ", "")}
              </button>
            ))}
          </div>

          {/* Orbit Camera Toggle */}
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isRotating
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <IconRotateClockwise className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} stroke={1.8} />
            <span>{isRotating ? "Berhenti Putar" : "Orbit 3D"}</span>
          </button>
        </div>
      </div>

      {/* 3D Map Viewport */}
      <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-md relative bg-slate-900">
        <MapLibre3D
          points={points}
          mapStyle={selectedStyle}
          isRotating={isRotating}
        />

        {/* Floating Telemetry Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white text-[11px] shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-gray-200">
              OpenFreeMap Vector 3D: Active
            </span>
          </div>
          <div className="h-3 w-[1px] bg-white/20" />
          <div className="text-gray-400">
            Kamera: <span className="text-white font-mono font-medium">Pitch 62° • 3D Buildings</span>
          </div>
        </div>

        {/* Floating Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs" />
            <span className="text-[11px] text-gray-300">Site Accepted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" />
            <span className="text-[11px] text-gray-300">DT/Audit Ongoing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-[11px] text-gray-300">NY OA / Reject</span>
          </div>
        </div>
      </div>

      {/* Attribution Footer */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>Penyedia Peta Bebas Kuota & Gratis:</span>
          <a
            href="https://maplibre.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            MapLibre
          </a>
          <span>|</span>
          <a
            href="https://openfreemap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            OpenFreeMap
          </a>
          <span>|</span>
          <a
            href="https://www.openmaptiles.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            © OpenMapTiles
          </a>
          <span>|</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            Data OpenStreetMap
          </a>
        </div>
        <span className="text-gray-400">Gunakan klik kanan mouse + drag untuk memutar 360°</span>
      </div>
    </div>
  );
}
