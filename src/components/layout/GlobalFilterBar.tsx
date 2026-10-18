"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconMapPin,
  IconCheck,
  IconChevronDown,
  IconArrowBackUp,
} from "@tabler/icons-react";
import { GlobalFilterState, SearchFieldType } from "@/types/assignment";

interface GlobalFilterBarProps {
  filterState: GlobalFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  availableAreas: string[];
  totalFiltered: number;
  totalAll: number;
}

export function GlobalFilterBar({
  filterState,
  setFilterState,
  availableAreas,
  totalFiltered,
  totalAll,
}: GlobalFilterBarProps) {
  // Dropdown states
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");

  // Suggestions state
  const [suggestions, setSuggestions] = useState<{ value: string; count: number }[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  const searchCategories: { id: SearchFieldType; label: string; placeholder: string }[] = [
    { id: "all", label: "Semua Kategori", placeholder: "Ketik kata kunci pencarian..." },
    { id: "duId", label: "DU ID", placeholder: "Contoh: EPE160_L1800..." },
    { id: "siteId", label: "Site ID", placeholder: "Contoh: EPE160, BOO581..." },
    { id: "siteName", label: "Nama Site", placeholder: "Contoh: Kintamani, Mediterania..." },
    { id: "pmoUniq", label: "PMO Uniq", placeholder: "Contoh: JKT-4100005479..." },
    { id: "kabupaten", label: "Kabupaten", placeholder: "Contoh: Jakarta Utara, Bogor..." },
  ];

  const currentCategory =
    searchCategories.find((c) => c.id === filterState.searchField) || searchCategories[0];

  // Fetch Autocomplete Suggestions saat user mengetik
  useEffect(() => {
    const q = filterState.searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        const res = await fetch(
          `/api/dashboard/suggestions?field=${filterState.searchField}&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [filterState.searchQuery, filterState.searchField]);

  // Click outside listener untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setCategoryDropdownOpen(false);
      }
      if (
        areaDropdownRef.current &&
        !areaDropdownRef.current.contains(event.target as Node)
      ) {
        setAreaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (val: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: val }));
    setShowSuggestions(false);
  };

  const handleAreaToggle = (area: string) => {
    setFilterState((prev) => {
      const exists = prev.selectedAreas.includes(area);
      const next = exists
        ? prev.selectedAreas.filter((a) => a !== area)
        : [...prev.selectedAreas, area];
      return { ...prev, selectedAreas: next };
    });
  };

  // MULTI-SELECT STATUS FILTER
  const handleStatusToggle = (status: string) => {
    setFilterState((prev) => {
      const exists = prev.selectedStatuses.includes(status);
      const next = exists
        ? prev.selectedStatuses.filter((s) => s !== status)
        : [...prev.selectedStatuses, status];
      return { ...prev, selectedStatuses: next };
    });
  };

  const clearAllFilters = () => {
    setFilterState({
      searchField: "all",
      searchQuery: "",
      dateRange: { from: null, to: null },
      selectedAreas: [],
      selectedVendors: [],
      selectedPrograms: [],
      selectedStatuses: [],
    });
  };

  const filteredAreaList = availableAreas.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const hasActiveFilters =
    filterState.searchQuery.trim() !== "" ||
    filterState.selectedAreas.length > 0 ||
    filterState.selectedStatuses.length > 0;

  return (
    <div className="glass-panel p-5 mb-6 relative z-10 border border-white/80 shadow-md">
      {/* Top Filter Controls: Categorized Search, Multi-Status, Area Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Categorized Search with Typeahead Autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-xs focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
            {/* Category Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 rounded-l-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{currentCategory.label}</span>
                <IconChevronDown className="w-3.5 h-3.5 text-gray-400" stroke={1.8} />
              </button>

              {/* Category Dropdown */}
              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-20">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 block">
                    Pilih Kategori Pencarian
                  </span>
                  {searchCategories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setFilterState((prev) => ({ ...prev, searchField: cat.id }));
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        filterState.searchField === cat.id
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {filterState.searchField === cat.id && (
                        <IconCheck className="w-3.5 h-3.5 text-blue-600" stroke={2} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="relative flex-1 flex items-center">
              <IconSearch className="w-4 h-4 text-gray-400 ml-3" stroke={1.8} />
              <input
                type="text"
                placeholder={currentCategory.placeholder}
                value={filterState.searchQuery}
                onChange={(e) =>
                  setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-2.5 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
              />
              {filterState.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                  className="mr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <IconX className="w-3.5 h-3.5" stroke={1.8} />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete / Typeahead Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-20">
              <div className="flex items-center justify-between px-2.5 py-1 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                <span>Rekomendasi {currentCategory.label}</span>
                <span>Jumlah Site</span>
              </div>
              <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => handleSelectSuggestion(item.value)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 text-gray-800 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 truncate pr-2">
                      {item.value}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-800 shrink-0">
                      {item.count} site
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Select Status Filter */}
        <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl self-start lg:self-auto overflow-x-auto">
          <span className="text-[11px] font-semibold text-gray-500 px-2 flex items-center gap-1">
            <IconFilter className="w-3 h-3" stroke={1.8} /> Status:
          </span>
          {[
            { id: "Acc", label: "Accepted", count: "8.981" },
            { id: "Not Yet Acc", label: "In Progress", count: "842" },
            { id: "Reject", label: "Rejected", count: "289" },
          ].map((item) => {
            const isSelected = filterState.selectedStatuses.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleStatusToggle(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 bg-white/70 hover:bg-white hover:text-gray-900 border border-gray-200/50"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-white text-blue-600 border-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && <IconCheck className="w-2.5 h-2.5" stroke={3} />}
                </div>
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Select Area Dropdown */}
        <div ref={areaDropdownRef} className="relative self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              filterState.selectedAreas.length > 0
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <IconMapPin className="w-4 h-4 text-blue-600" stroke={1.8} />
            <span>
              {filterState.selectedAreas.length === 0
                ? "Pilih Wilayah / Area"
                : `${filterState.selectedAreas.length} Area Terpilih`}
            </span>
            <IconChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                areaDropdownOpen ? "rotate-180" : ""
              }`}
              stroke={1.8}
            />
          </button>

          {/* Area Popover Dropdown */}
          {areaDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Cari nama area (misal: JABO, Java)..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {filteredAreaList.map((area) => {
                  const isChecked = filterState.selectedAreas.includes(area);
                  return (
                    <label
                      key={area}
                      onClick={() => handleAreaToggle(area)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-blue-50 text-blue-800 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{area}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <IconCheck className="w-3 h-3" stroke={3} />}
                      </div>
                    </label>
                  );
                })}
              </div>

              {filterState.selectedAreas.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-gray-400">
                    {filterState.selectedAreas.length} area aktif
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, selectedAreas: [] }))
                    }
                    className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Hapus Pilihan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Summary Counter */}
      <div className="mt-4 pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500">Filter Aktif:</span>

          {!hasActiveFilters && (
            <span className="text-[11px] text-gray-400 italic">
              Menampilkan seluruh 10.112 site tanpa batasan filter
            </span>
          )}

          {filterState.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
              {currentCategory.label}: "{filterState.searchQuery}"
              <IconX
                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                stroke={2}
                onClick={() => setFilterState((p) => ({ ...p, searchQuery: "" }))}
              />
            </span>
          )}

          {filterState.selectedStatuses.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold text-[11px]"
            >
              Status: {st}
              <IconX
                className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                stroke={2}
                onClick={() => handleStatusToggle(st)}
              />
            </span>
          ))}

          {filterState.selectedAreas.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium text-[11px]"
            >
              Area: {area}
              <IconX
                className="w-3 h-3 cursor-pointer hover:text-black"
                stroke={2}
                onClick={() => handleAreaToggle(area)}
              />
            </span>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold ml-2 hover:underline cursor-pointer"
            >
              <IconArrowBackUp className="w-3.5 h-3.5" stroke={1.8} /> Reset Semua Filter
            </button>
          )}
        </div>

        {/* Live Filter Result Summary */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Hasil:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60 text-[11px]">
            {totalFiltered.toLocaleString()} / {totalAll.toLocaleString()} Site (
            {((totalFiltered / (totalAll || 1)) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
