"use client";

import React from "react";
import {
  IconLayoutDashboard,
  IconTable,
  IconChartBar,
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconBroadcast,
  IconDatabase,
} from "@tabler/icons-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: IconLayoutDashboard,
      desc: "Ringkasan KPI",
    },
    {
      id: "sheet2",
      label: "Sheet2 Analytics",
      icon: IconDatabase,
      desc: "Pivot ISDP & Milestone",
    },
    {
      id: "workload",
      label: "Beban Wilayah",
      icon: IconChartBar,
      desc: "Distribusi Status Area",
    },
    {
      id: "map3d",
      label: "Peta 3D Site",
      icon: IconBuilding,
      desc: "Elevasi Gedung & BTS",
    },
    {
      id: "grid",
      label: "Data Grid",
      icon: IconTable,
      desc: "Eksplorasi Data Site",
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-white border-r border-gray-200/90 transition-all duration-300 flex flex-col justify-between shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header: Nexwave Productivity Dashboard */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-slate-900 text-white">
          {!collapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <IconBroadcast className="w-4 h-4" stroke={1.8} />
              </div>
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-white block leading-tight truncate">
                  NEXWAVE
                </span>
                <span className="text-[9px] text-blue-400 font-semibold tracking-wider uppercase block truncate">
                  Productivity Dashboard
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <IconBroadcast className="w-4 h-4" stroke={1.8} />
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition-colors ml-auto"
            title={collapsed ? "Perluas Sidebar" : "Sembunyikan / Kecilkan Sidebar"}
          >
            {collapsed ? <IconChevronRight className="w-4 h-4" stroke={1.8} /> : <IconChevronLeft className="w-4 h-4" stroke={1.8} />}
          </button>
        </div>

        {/* Navigation Menu Items */}
        <div className="px-3 py-4">
          <span
            className={`text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 block ${
              collapsed ? "text-center" : ""
            }`}
          >
            {collapsed ? "MENU" : "NAVIGASI UTAMA"}
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-gray-600 hover:bg-gray-100/90 hover:text-gray-900"
                  } ${collapsed ? "justify-center px-0" : "justify-start"}`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                    } ${!collapsed ? "mr-3" : ""}`}
                    stroke={1.8}
                  />
                  {!collapsed && (
                    <div className="text-left truncate">
                      <span className="block leading-tight">{item.label}</span>
                      <span
                        className={`text-[10px] font-normal block ${
                          isActive ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Clean Footer */}
      <div className="p-3.5 border-t border-gray-100 bg-gray-50/60 text-center">
        {!collapsed ? (
          <div className="text-left px-1">
            <p className="text-[11px] font-semibold text-gray-700">Nexwave Systems v2.4</p>
            <p className="text-[10px] text-gray-400">Telkomsel NW RF Telemetry</p>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-blue-600 mx-auto" />
        )}
      </div>
    </aside>
  );
}
