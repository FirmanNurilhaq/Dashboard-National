"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapSitePoint } from "@/types/assignment";

interface MapLibre3DInnerProps {
  points: MapSitePoint[];
  mapStyle?: string;
  isRotating?: boolean;
}

export default function MapLibre3DInner({
  points,
  mapStyle = "https://tiles.openfreemap.org/styles/liberty",
  isRotating = false,
}: MapLibre3DInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Pastikan Worker URL menunjuk ke file worker JavaScript lokal pada origin aplikasi
    if (typeof window !== "undefined") {
      maplibregl.config.WORKER_URL = `${window.location.origin}/maplibre-gl-worker.mjs`;
    }

    // Inisialisasi MapLibre menggunakan Vector Tiles OpenFreeMap (Zero API Key, Bebas Akses)
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [106.8271, -6.2146], // Jakarta Pusat & JABO
      zoom: 14.5,
      pitch: 62, // 3D Camera Tilt
      bearing: -20, // 3D Angle
      attributionControl: false,
    });

    // Kontrol Navigasi Pitch & Zoom
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    // Attribution Resmi: MapLibre | OpenFreeMap © OpenMapTiles Data from OpenStreetMap
    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution:
          '<a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre</a> | <a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        compact: false,
      }),
      "bottom-right"
    );

    map.on("load", () => {
      // 1. Kustomisasi / Pastikan Layer 3D Buildings dari OpenFreeMap Aktif pada Zoom Rendah
      try {
        if (map.getLayer("building-3d")) {
          map.setLayoutProperty("building-3d", "visibility", "visible");
          map.setLayerZoomRange("building-3d", 12, 20); // Terlihat dari zoom 12
          map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.85);
        } else if (map.getSource("openmaptiles")) {
          map.addLayer({
            id: "building-3d-custom",
            type: "fill-extrusion",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 12,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "render_height"],
                0,
                "#94a3b8",
                50,
                "#64748b",
                120,
                "#3b82f6",
                200,
                "#1d4ed8",
              ],
              "fill-extrusion-height": ["get", "render_height"],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": 0.85,
            },
          });
        }
      } catch (err) {
        console.warn("Building 3D setup note:", err);
      }

      // 2. Tambahkan Data Menara Site Telekomunikasi 3D
      const validPoints = points.filter(
        (p) => p.latitude !== null && p.longitude !== null
      );

      const siteFeatures: GeoJSON.Feature[] = validPoints.slice(0, 1500).map((p) => {
        let color = "#10b981"; // Hijau = Acc
        let towerHeight = 85;

        if (p.finalStatus === "Reject") {
          color = "#ef4444";
          towerHeight = 45;
        } else if (p.milestoneNw.startsWith("0. NY") || !p.oaDate) {
          color = "#f43f5e";
          towerHeight = 35;
        } else {
          color = "#f59e0b"; // Kuning = In Progress
          towerHeight = 65;
        }

        const size = 0.00035;
        return {
          type: "Feature",
          properties: {
            siteId: p.siteId,
            siteName: p.siteName,
            duId: p.duId,
            area: p.area,
            kabupaten: p.kabupaten,
            finalStatus: p.finalStatus,
            milestoneNw: p.milestoneNw,
            height: towerHeight,
            color: color,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [p.longitude - size, p.latitude - size],
                [p.longitude + size, p.latitude - size],
                [p.longitude + size, p.latitude + size],
                [p.longitude - size, p.latitude + size],
                [p.longitude - size, p.latitude - size],
              ],
            ],
          },
        };
      });

      if (!map.getSource("nexwave-sites")) {
        map.addSource("nexwave-sites", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: siteFeatures,
          },
        });

        // Layer 3D Menara BTS Telekomunikasi
        map.addLayer({
          id: "nexwave-sites-3d",
          type: "fill-extrusion",
          source: "nexwave-sites",
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.95,
          },
        });

        // Popup Interaktif saat Menara BTS diklik
        map.on("click", "nexwave-sites-3d", (e) => {
          if (!e.features || !e.features[0]) return;
          const prop = e.features[0].properties as any;
          const coordinates = e.lngLat;

          new maplibregl.Popup({ offset: [0, -20] })
            .setLngLat(coordinates)
            .setHTML(`
              <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 6px; min-width: 190px;">
                <div style="font-size: 10px; color: #2563eb; font-weight: 700; text-transform: uppercase;">
                  NEXWAVE BTS TOWER
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                  ${prop.siteId}
                </div>
                <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">${prop.siteName}</div>
                <div style="margin-bottom: 6px;">
                  <span style="background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                    ${prop.area}
                  </span>
                  <span style="background: ${
                    prop.finalStatus === 'Acc' ? '#ecfdf5' : '#fffbeb'
                  }; color: ${
                    prop.finalStatus === 'Acc' ? '#047857' : '#b45309'
                  }; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-left: 4px;">
                    ${prop.finalStatus}
                  </span>
                </div>
                <div style="color: #64748b; font-size: 10px;">DU ID: <b>${prop.duId}</b></div>
                <div style="color: #64748b; font-size: 10px;">Milestone: ${prop.milestoneNw}</div>
              </div>
            `)
            .addTo(map);
        });

        map.on("mouseenter", "nexwave-sites-3d", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "nexwave-sites-3d", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    });

    mapRef.current = map;

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      map.remove();
    };
  }, [points, mapStyle]);

  // Rotasi Kamera 3D Otomatis (Orbit Mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isRotating) {
      const rotateCamera = () => {
        const currentBearing = map.getBearing();
        map.setBearing((currentBearing + 0.2) % 360);
        animationFrameRef.current = requestAnimationFrame(rotateCamera);
      };
      animationFrameRef.current = requestAnimationFrame(rotateCamera);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRotating]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-inner bg-slate-900"
    />
  );
}
