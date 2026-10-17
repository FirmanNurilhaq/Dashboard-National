"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconRefresh,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconShield,
} from "@tabler/icons-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  totalRecords?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({
  title,
  subtitle = "Pemantauan Alur Kerja Operasional & Key Performance Indicators",
  totalRecords = 10134,
  onRefresh,
  isLoading = false,
}: HeaderProps) {
  const router = useRouter();
  const [userDropdown, setUserDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: "admin_rf",
    fullName: "Arya Pratama",
    role: "RF Project Lead",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("telecom_user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("telecom_user");
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200/90 px-6 py-3.5 flex items-center justify-between transition-all shadow-xs">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            {totalRecords.toLocaleString()} Site Data
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 font-normal">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:border-gray-300 disabled:opacity-50"
            title="Refresh Data"
          >
            <IconRefresh className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? "animate-spin" : ""}`} stroke={1.8} />
            <span>{isLoading ? "Memuat..." : "Perbarui"}</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-gray-200" />

        {/* User Profile & Logout Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <IconUser className="w-4 h-4" stroke={1.8} />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-gray-900 block leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-gray-500 font-medium block">
                {currentUser.role}
              </span>
            </div>
            <IconChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" stroke={1.8} />
          </button>

          {/* User Dropdown */}
          {userDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50">
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{currentUser.fullName}</p>
                <p className="text-[10px] text-gray-400 font-mono">@{currentUser.username}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 uppercase">
                  {currentUser.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <IconShield className="w-3.5 h-3.5 text-gray-400" stroke={1.8} />
                  <span>Ganti Akun Demo</span>
                </button>
              </div>

              <div className="pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                >
                  <IconLogout className="w-3.5 h-3.5 text-rose-500" stroke={1.8} />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
