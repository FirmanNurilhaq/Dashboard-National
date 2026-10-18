"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  IconRefresh,
  IconUser,
  IconLogout,
  IconChevronDown,
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
  totalRecords = 10112,
  onRefresh,
  isLoading = false,
}: HeaderProps) {
  const router = useRouter();
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState({
    username: "admin",
    fullName: "National System Administrator",
    role: "Admin",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("telecom_user");
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          // fallback default
        }
      }
    }
  }, []);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("telecom_user");
      document.cookie = "telecom_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-6 py-3.5 flex items-center justify-between transition-all shadow-xs">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:border-gray-300 disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <IconRefresh className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? "animate-spin" : ""}`} stroke={1.8} />
            <span>{isLoading ? "Memuat..." : "Perbarui"}</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-gray-200" />

        {/* User Profile & Logout Popover */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
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

          {/* User Dropdown with z-[100] to float above all filter cards */}
          {userDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-2 z-[100]">
              <div className="p-2.5 border-b border-gray-100 bg-gray-50/50 rounded-lg mb-1">
                <p className="text-xs font-bold text-gray-900 truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-gray-500 font-mono">@{currentUser.username}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  {currentUser.role}
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <IconLogout className="w-4 h-4 text-rose-500" stroke={1.8} />
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
