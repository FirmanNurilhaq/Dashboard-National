"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconTable,
  IconChartBar,
  IconFilter,
  IconRefresh,
  IconClock,
  IconDatabase,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface MatrixRow {
  isSubtotal?: boolean;
  label?: string;
  simpleIsdp?: string;
  simpleMilestone?: string;
  baliNusra: number;
  centralJava: number;
  eastJava: number;
  jabo: number;
  northSumatera: number;
  southSumatra: number;
  westJava: number;
  grandTotal: number;
}

interface ChartItem {
  milestone?: string;
  category?: string;
  total: number;
}

interface Sheet2DataResponse {
  filterOptions: {
    simpleIsdps: string[];
    areas: string[];
    milestones: string[];
    active: {
      simpleIsdp: string;
      area: string;
      milestone: string;
    };
  };
  matrix: {
    columns: string[];
    rows: MatrixRow[];
    grandTotalRow: Record<string, any>;
  };
  nyIsdpChart: {
    title: string;
    filterLabel: string;
    data: { milestone: string; total: number }[];
    grandTotal: number;
  };
  presalesChart: {
    title: string;
    filterLabel: string;
    data: { milestone: string; total: number }[];
    grandTotal: number;
  };
  agingChart: {
    title: string;
    filterLabel: string;
    data: { category: string; total: number }[];
    grandTotal: number;
  };
}

export function Sheet2Analytics() {
  const [activeTab, setActiveTab] = useState<"matrix" | "nyIsdp" | "presales" | "aging">("matrix");
  const [data, setData] = useState<Sheet2DataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Local filter states
  const [selectedIsdp, setSelectedIsdp] = useState<string>("ALL");
  const [selectedArea, setSelectedArea] = useState<string>("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedIsdp !== "ALL") params.append("simpleIsdp", selectedIsdp);
      if (selectedArea !== "ALL") params.append("area", selectedArea);

      const res = await fetch(`/api/dashboard/sheet2-matrix?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data Sheet2");
      const json: Sheet2DataResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data Sheet2");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedIsdp, selectedArea]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="glass-panel p-5 mb-6"
    >
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <IconDatabase className="w-5 h-5" stroke={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Tracker & ISDP Pivot Analytics (Sheet2 Summary)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-8">
            Matriks hierarki data Simple ISDP, Simple Milestone operasional, dan Sebaran Wilayah
          </p>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Dropdowns */}
          <div className="flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-lg border border-gray-200/60 text-xs">
            <IconFilter className="w-3.5 h-3.5 text-gray-400 ml-1" />
            <select
              value={selectedIsdp}
              onChange={(e) => setSelectedIsdp(e.target.value)}
              className="bg-transparent text-gray-700 font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
              title="Filter Simple ISDP"
            >
              <option value="ALL">Semua ISDP</option>
              <option value="Done ISDP">Done ISDP</option>
              <option value="NY ISDP">NY ISDP</option>
              <option value="PRESALES">PRESALES</option>
            </select>

            <span className="text-gray-300">|</span>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent text-gray-700 font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
              title="Filter Area"
            >
              <option value="ALL">Semua Area</option>
              <option value="BaliNusra">BaliNusra</option>
              <option value="Central Java">Central Java</option>
              <option value="East Java">East Java</option>
              <option value="JABO">JABO</option>
              <option value="North Sumatera">North Sumatera</option>
              <option value="South Sumatra">South Sumatra</option>
              <option value="West Java">West Java</option>
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200/50">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "matrix"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconTable className="w-3.5 h-3.5" />
              <span>Pivot Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab("nyIsdp")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "nyIsdp"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconChartBar className="w-3.5 h-3.5 text-emerald-600" />
              <span>NY ISDP Chart</span>
            </button>
            <button
              onClick={() => setActiveTab("presales")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "presales"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconChartBar className="w-3.5 h-3.5 text-blue-600" />
              <span>Presales Chart</span>
            </button>
            <button
              onClick={() => setActiveTab("aging")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "aging"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconClock className="w-3.5 h-3.5 text-amber-600" />
              <span>Aging Breakdown</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Konten Tab */}
      {loading && !data ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-medium">Memuat analisis matriks Sheet2...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-500 text-xs">{error}</div>
      ) : data ? (
        <div>
          {/* TAB 1: PIVOT MATRIX TABLE (GAMBAR 1) */}
          {activeTab === "matrix" && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/90 text-gray-700 font-bold border-b border-gray-300">
                    <th className="py-2.5 px-3 border-r border-gray-200 w-32">Row Labels</th>
                    <th className="py-2.5 px-3 border-r border-gray-200 w-44">Simple Milestone</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">BaliNusra</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">Central Java</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">East Java</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200 bg-emerald-50/50">JABO</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">North Sumatera</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">South Sumatra</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">West Java</th>
                    <th className="py-2.5 px-3 text-right font-extrabold bg-gray-200/70 text-gray-900">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.matrix.rows.map((row, idx) => {
                    if (row.isSubtotal) {
                      return (
                        <tr key={`sub-${idx}`} className="bg-gray-100 font-bold text-gray-900">
                          <td className="py-2 px-3 border-r border-gray-200" colSpan={2}>
                            {row.label}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.baliNusra || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.centralJava || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.eastJava || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200 bg-emerald-100/30">
                            {row.jabo || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.northSumatera || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.southSumatra || "-"}
                          </td>
                          <td className="py-2 px-3 text-right border-r border-gray-200">
                            {row.westJava || "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-black bg-gray-200/80 text-emerald-800">
                            {row.grandTotal}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={`row-${idx}`} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-500">
                          {row.simpleIsdp}
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-800">
                          {row.simpleMilestone}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.baliNusra || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.centralJava || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.eastJava || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-800 font-semibold bg-emerald-50/20">
                          {row.jabo || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.northSumatera || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.southSumatra || ""}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-600">
                          {row.westJava || ""}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-gray-900 bg-gray-50">
                          {row.grandTotal}
                        </td>
                      </tr>
                    );
                  })}

                  {/* GRAND TOTAL ROW */}
                  <tr className="bg-gray-200 font-black text-gray-950 border-t-2 border-gray-400">
                    <td className="py-2.5 px-3 border-r border-gray-300" colSpan={2}>
                      Grand Total
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow.BaliNusra}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow["Central Java"]}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow["East Java"]}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300 bg-emerald-200/50">
                      {data.matrix.grandTotalRow.JABO}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow["North Sumatera"]}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow["South Sumatra"]}
                    </td>
                    <td className="py-2.5 px-3 text-right border-r border-gray-300">
                      {data.matrix.grandTotalRow["West Java"]}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-900 bg-gray-300">
                      {data.matrix.grandTotalRow.GrandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: NY ISDP CHART (GAMBAR 2) */}
          {activeTab === "nyIsdp" && (
            <div className="bg-[#242933] text-white p-5 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-700 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    {data.nyIsdpChart.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{data.nyIsdpChart.filterLabel}</p>
                </div>
                <div className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-md font-bold self-start">
                  Grand Total: {data.nyIsdpChart.grandTotal} DU ID
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.nyIsdpChart.data}
                    margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="milestone"
                      stroke="#9ca3af"
                      tick={{ fill: "#d1d5db", fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#4b5563",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any) => [`${val} DU ID`, "Total"]}
                    />
                    <Bar
                      dataKey="total"
                      fill="#52c41a"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#e5e7eb", fontSize: 11, fontWeight: "bold" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table Grid di bawah Chart (Persis seperti gambar Excel) */}
              <div className="overflow-x-auto mt-6 border border-gray-700 rounded-lg">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#1a1f29] text-gray-300 font-bold border-b border-gray-700">
                      <th className="py-2 px-3 text-left border-r border-gray-700 w-28">Row Labels</th>
                      {data.nyIsdpChart.data.map((item) => (
                        <th key={item.milestone} className="py-2 px-3 border-r border-gray-700">
                          {item.milestone}
                        </th>
                      ))}
                      <th className="py-2 px-3 bg-[#11161f] text-emerald-400 font-extrabold">
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#242933] text-gray-200 font-semibold">
                      <td className="py-2 px-3 text-left font-bold text-emerald-400 border-r border-gray-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#52c41a] inline-block rounded-sm"></span>
                        Total
                      </td>
                      {data.nyIsdpChart.data.map((item) => (
                        <td key={item.milestone} className="py-2 px-3 border-r border-gray-700 font-bold">
                          {item.total}
                        </td>
                      ))}
                      <td className="py-2 px-3 bg-[#11161f] font-black text-emerald-300">
                        {data.nyIsdpChart.grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRESALES CHART (GAMBAR 3) */}
          {activeTab === "presales" && (
            <div className="bg-[#242933] text-white p-5 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-700 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                    {data.presalesChart.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{data.presalesChart.filterLabel}</p>
                </div>
                <div className="text-xs bg-blue-950/80 text-blue-400 border border-blue-800 px-3 py-1 rounded-md font-bold self-start">
                  Grand Total: {data.presalesChart.grandTotal} DU ID
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.presalesChart.data}
                    margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="milestone"
                      stroke="#9ca3af"
                      tick={{ fill: "#d1d5db", fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#4b5563",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any) => [`${val} DU ID`, "Total"]}
                    />
                    <Bar
                      dataKey="total"
                      fill="#52c41a"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#e5e7eb", fontSize: 11, fontWeight: "bold" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table Grid di bawah Chart */}
              <div className="overflow-x-auto mt-6 border border-gray-700 rounded-lg">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#1a1f29] text-gray-300 font-bold border-b border-gray-700">
                      <th className="py-2 px-3 text-left border-r border-gray-700 w-28">Row Labels</th>
                      {data.presalesChart.data.map((item) => (
                        <th key={item.milestone} className="py-2 px-3 border-r border-gray-700">
                          {item.milestone}
                        </th>
                      ))}
                      <th className="py-2 px-3 bg-[#11161f] text-emerald-400 font-extrabold">
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#242933] text-gray-200 font-semibold">
                      <td className="py-2 px-3 text-left font-bold text-emerald-400 border-r border-gray-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#52c41a] inline-block rounded-sm"></span>
                        Total
                      </td>
                      {data.presalesChart.data.map((item) => (
                        <td key={item.milestone} className="py-2 px-3 border-r border-gray-700 font-bold">
                          {item.total}
                        </td>
                      ))}
                      <td className="py-2 px-3 bg-[#11161f] font-black text-emerald-300">
                        {data.presalesChart.grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AGING BREAKDOWN CHART (GAMBAR 4) */}
          {activeTab === "aging" && (
            <div className="bg-[#242933] text-white p-5 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-700 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    {data.agingChart.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{data.agingChart.filterLabel}</p>
                </div>
                <div className="text-xs bg-amber-950/80 text-amber-400 border border-amber-800 px-3 py-1 rounded-md font-bold self-start">
                  Grand Total: {data.agingChart.grandTotal} DU ID
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.agingChart.data}
                    margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="category"
                      stroke="#9ca3af"
                      tick={{ fill: "#d1d5db", fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#4b5563",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any) => [`${val} DU ID`, "Total"]}
                    />
                    <Bar
                      dataKey="total"
                      fill="#52c41a"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#e5e7eb", fontSize: 11, fontWeight: "bold" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table Grid di bawah Chart */}
              <div className="overflow-x-auto mt-6 border border-gray-700 rounded-lg">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#1a1f29] text-gray-300 font-bold border-b border-gray-700">
                      <th className="py-2 px-3 text-left border-r border-gray-700 w-28">Row Labels</th>
                      {data.agingChart.data.map((item) => (
                        <th key={item.category} className="py-2 px-3 border-r border-gray-700">
                          {item.category}
                        </th>
                      ))}
                      <th className="py-2 px-3 bg-[#11161f] text-emerald-400 font-extrabold">
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#242933] text-gray-200 font-semibold">
                      <td className="py-2 px-3 text-left font-bold text-emerald-400 border-r border-gray-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#52c41a] inline-block rounded-sm"></span>
                        Total
                      </td>
                      {data.agingChart.data.map((item) => (
                        <td key={item.category} className="py-2 px-3 border-r border-gray-700 font-bold">
                          {item.total}
                        </td>
                      ))}
                      <td className="py-2 px-3 bg-[#11161f] font-black text-emerald-300">
                        {data.agingChart.grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
