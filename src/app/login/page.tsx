"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBroadcast,
  IconUser,
  IconKey,
  IconArrowRight,
  IconLock,
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin_rf");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState("RF Operations Admin");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simpan session user lokal
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "telecom_user",
        JSON.stringify({
          username,
          fullName: username === "admin_rf" ? "Arya Pratama" : "Dwi Saputra",
          role,
          loggedInAt: new Date().toISOString(),
        })
      );
    }

    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  const selectDemoRole = (userVal: string, roleVal: string) => {
    setUsername(userVal);
    setRole(roleVal);
    setPassword("telecom2026");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 mb-3 border border-white/10">
            <IconBroadcast className="w-6 h-6 text-white" stroke={1.8} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            NEXWAVE
          </h1>
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-0.5">
            Productivity & Assignment Dashboard
          </p>
        </div>

        {/* Card Form with Glassmorphism */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-white">Login Petugas</h2>
              <p className="text-[11px] text-gray-400">Masuk untuk mengakses data operasional 10.134 site</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Nexwave Auth
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                ID Pengguna / Username
              </label>
              <div className="relative">
                <IconUser className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" stroke={1.8} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-800/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan username Anda..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-blue-400 font-medium cursor-pointer hover:underline">
                  Lupa Akses?
                </span>
              </div>
              <div className="relative">
                <IconKey className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" stroke={1.8} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard NOC</span>
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" stroke={2} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              ⚡ Akses Cepat Demo (1-Click Login)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { u: "admin_rf", r: "RF Operations Admin", l: "Admin" },
                { u: "mgmt_lead", r: "Management Executive", l: "Management" },
                { u: "pic_rf", r: "PIC RF Field Engineer", l: "Engineer" },
              ].map((item) => (
                <button
                  key={item.u}
                  type="button"
                  onClick={() => selectDemoRole(item.u, item.r)}
                  className={`py-2 px-2 text-[10px] font-semibold rounded-lg border transition-all truncate text-center ${
                    username === item.u
                      ? "border-blue-500/80 bg-blue-500/20 text-blue-300"
                      : "border-white/10 bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <IconLock className="w-3.5 h-3.5 text-emerald-400" stroke={1.8} /> End-to-End TLS 1.3
          </span>
          <span>•</span>
          <span>Book1 Telemetry Verified</span>
          <span>•</span>
          <span>Version 2.4 Enterprise</span>
        </div>
      </div>
    </div>
  );
}
