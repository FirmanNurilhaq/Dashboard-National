"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapSitePoint } from "@/types/assignment";

interface LeafletMapInnerProps {
  points: MapSitePoint[];
}

export default function LeafletMapInner({ points }: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Inisialisasi peta berpusat di Indonesia
      const map = L.map(mapContainerRef.current, {
        center: [-2.5, 118],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      // Tile layer CartoDB Positron yang bersih dan modern
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const layerGroup = layerGroupRef.current;
    if (layerGroup) {
      layerGroup.clearLayers();

      // Render marker lingkaran berbobot ringan untuk performa tinggi
      // Ambil maksimal 800 sampel seimbang agar peta tetap sangat responsif di browser
      const step = Math.max(1, Math.floor(points.length / 800));
      const samplePoints: MapSitePoint[] = [];
      for (let i = 0; i < points.length; i += step) {
        samplePoints.push(points[i]);
      }

      samplePoints.forEach((pt) => {
        let color = "#10b981"; // Hijau = Acc
        if (pt.finalStatus === "Reject") {
          color = "#ef4444"; // Merah = Reject
        } else if (pt.milestoneNw.startsWith("0. NY") || !pt.oaDate) {
          color = "#f43f5e"; // Merah muda = NY OA
        } else {
          color = "#f59e0b"; // Kuning = In Progress
        }

        const circle = L.circleMarker([pt.latitude, pt.longitude], {
          radius: 5,
          fillColor: color,
          color: "#ffffff",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.85,
        });

        circle.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 4px;">
            <div style="font-weight: bold; font-size: 13px; color: #111827; margin-bottom: 2px;">
              ${pt.siteId} - ${pt.siteName}
            </div>
            <div style="color: #6b7280; margin-bottom: 6px;">DU ID: <b>${pt.duId}</b></div>
            <div style="display: flex; gap: 4px; margin-bottom: 4px;">
              <span style="background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ${pt.area}
              </span>
              <span style="background: ${
                pt.finalStatus === 'Acc' ? '#ecfdf5' : '#fffbeb'
              }; color: ${
                pt.finalStatus === 'Acc' ? '#047857' : '#b45309'
              }; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ${pt.finalStatus}
              </span>
            </div>
            <div style="color: #4b5563; font-size: 10px;">Milestone: ${pt.milestoneNw}</div>
            ${pt.remark ? `<div style="color: #9ca3af; font-size: 9px; margin-top: 4px;">Remark: ${pt.remark}</div>` : ""}
          </div>
        `);

        circle.addTo(layerGroup);
      });
    }
  }, [points]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[360px] rounded-xl overflow-hidden" />;
}
