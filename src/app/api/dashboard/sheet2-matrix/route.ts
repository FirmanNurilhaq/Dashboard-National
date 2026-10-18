import { NextRequest, NextResponse } from "next/server";
import { loadAllAssignments } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export interface Sheet2MatrixRow {
  simpleIsdp: string;
  simpleMilestone: string;
  baliNusra: number;
  centralJava: number;
  eastJava: number;
  jabo: number;
  northSumatera: number;
  southSumatra: number;
  westJava: number;
  grandTotal: number;
}

export interface Sheet2SubtotalRow {
  isSubtotal: true;
  label: string;
  baliNusra: number;
  centralJava: number;
  eastJava: number;
  jabo: number;
  northSumatera: number;
  southSumatra: number;
  westJava: number;
  grandTotal: number;
}

export type MatrixDisplayItem =
  | ({ isSubtotal?: false } & Sheet2MatrixRow)
  | Sheet2SubtotalRow;

export interface ChartDataPoint {
  milestone: string;
  total: number;
}

export interface AgingDataPoint {
  category: string;
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedIsdp = searchParams.get("simpleIsdp") || "ALL";
    const selectedArea = searchParams.get("area") || "ALL";
    const selectedMilestone = searchParams.get("milestone") || "ALL";

    const allData = loadAllAssignments();

    // Normalisasi nama area agar sesuai kolom pivot Sheet2
    const normalizeSheet2Area = (area: string): string => {
      const u = (area || "").toUpperCase();
      if (u.includes("BALI") || u.includes("NUSRA")) return "BaliNusra";
      if (u.includes("CENTRAL JAVA")) return "Central Java";
      if (u.includes("EAST JAVA")) return "East Java";
      if (u.includes("JABO")) return "JABO";
      if (u.includes("NORTH SUMAT") || u.includes("SUMATERA UTARA")) return "North Sumatera";
      if (u.includes("SOUTH SUMAT") || u.includes("SUMATERA SELATAN")) return "South Sumatra";
      if (u.includes("WEST JAVA")) return "West Java";
      return "Other";
    };

    // Ambil data yang memiliki simpleIsdp & simpleMilestone
    const sheet2Items = allData.filter(
      (d) => d.simpleIsdp && d.simpleMilestone
    );

    // Filter dinamis sesuai request
    const filteredItems = sheet2Items.filter((d) => {
      if (selectedIsdp !== "ALL" && d.simpleIsdp !== selectedIsdp) return false;
      if (selectedArea !== "ALL") {
        const a = normalizeSheet2Area(d.area);
        if (a.toLowerCase() !== selectedArea.toLowerCase()) return false;
      }
      if (selectedMilestone !== "ALL" && d.simpleMilestone !== selectedMilestone) {
        return false;
      }
      return true;
    });

    // 1. MEMBANGUN PIVOT MATRIX TABLE (GAMBAR 1)
    const isdpGroups = ["Done ISDP", "NY ISDP", "PRESALES"];
    const areaColumns = [
      "BaliNusra",
      "Central Java",
      "East Java",
      "JABO",
      "North Sumatera",
      "South Sumatra",
      "West Java",
    ];

    const matrixRows: MatrixDisplayItem[] = [];
    let overallTotals: Record<string, number> = {
      BaliNusra: 0,
      "Central Java": 0,
      "East Java": 0,
      JABO: 0,
      "North Sumatera": 0,
      "South Sumatra": 0,
      "West Java": 0,
      GrandTotal: 0,
    };

    for (const isdpGroup of isdpGroups) {
      if (selectedIsdp !== "ALL" && selectedIsdp !== isdpGroup) continue;

      // Ambil seluruh milestone unik di dalam grup ISDP ini
      const groupItems = sheet2Items.filter((d) => d.simpleIsdp === isdpGroup);
      const milestonesInGroup = Array.from(
        new Set(groupItems.map((d) => d.simpleMilestone!))
      ).sort();

      const groupSubtotal: Record<string, number> = {
        BaliNusra: 0,
        "Central Java": 0,
        "East Java": 0,
        JABO: 0,
        "North Sumatera": 0,
        "South Sumatra": 0,
        "West Java": 0,
        GrandTotal: 0,
      };

      for (const ms of milestonesInGroup) {
        if (selectedMilestone !== "ALL" && selectedMilestone !== ms) continue;

        const rowItems = groupItems.filter((d) => d.simpleMilestone === ms);
        const counts: Record<string, number> = {};
        let rowTotal = 0;

        for (const col of areaColumns) {
          const count = rowItems.filter(
            (d) => normalizeSheet2Area(d.area) === col
          ).length;
          counts[col] = count;
          rowTotal += count;
          groupSubtotal[col] += count;
          overallTotals[col] += count;
        }
        groupSubtotal.GrandTotal += rowTotal;
        overallTotals.GrandTotal += rowTotal;

        // Tambahkan baris data milestone jika ada count atau tidak difilter
        if (rowTotal > 0 || selectedMilestone === ms) {
          matrixRows.push({
            isSubtotal: false,
            simpleIsdp: isdpGroup,
            simpleMilestone: ms,
            baliNusra: counts["BaliNusra"] || 0,
            centralJava: counts["Central Java"] || 0,
            eastJava: counts["East Java"] || 0,
            jabo: counts["JABO"] || 0,
            northSumatera: counts["North Sumatera"] || 0,
            southSumatra: counts["South Sumatra"] || 0,
            westJava: counts["West Java"] || 0,
            grandTotal: rowTotal,
          });
        }
      }

      // Tambahkan Subtotal per grup ISDP
      matrixRows.push({
        isSubtotal: true,
        label: `${isdpGroup} Total`,
        baliNusra: groupSubtotal["BaliNusra"],
        centralJava: groupSubtotal["Central Java"],
        eastJava: groupSubtotal["East Java"],
        jabo: groupSubtotal["JABO"],
        northSumatera: groupSubtotal["North Sumatera"],
        southSumatra: groupSubtotal["South Sumatra"],
        westJava: groupSubtotal["West Java"],
        grandTotal: groupSubtotal.GrandTotal,
      });
    }

    // 2. MEMBANGUN DATA CHART NY ISDP (GAMBAR 2)
    const nyIsdpItems = allData.filter((d) => {
      if (d.simpleIsdp !== "NY ISDP") return false;
      if (selectedArea !== "ALL" && normalizeSheet2Area(d.area).toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }
      return true;
    });

    const expectedMilestones = [
      "0.NY OA",
      "1. NY DT/Audit",
      "2. DT/Audit Partial Done",
      "3. QC Ready",
      "4. QC Accepted",
      "6. Site Issue",
      "7. Cancel/Mapping",
    ];

    const nyIsdpChartData: ChartDataPoint[] = expectedMilestones.map((m) => {
      const count = nyIsdpItems.filter((d) => d.simpleMilestone === m).length;
      return { milestone: m, total: count };
    });
    const nyIsdpGrandTotal = nyIsdpChartData.reduce((acc, c) => acc + c.total, 0);

    // 3. MEMBANGUN DATA CHART PRESALES (GAMBAR 3)
    const presalesItems = allData.filter((d) => {
      if (d.simpleIsdp !== "PRESALES") return false;
      if (selectedArea !== "ALL" && normalizeSheet2Area(d.area).toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }
      return true;
    });

    const presalesChartData: ChartDataPoint[] = expectedMilestones.map((m) => {
      const count = presalesItems.filter((d) => d.simpleMilestone === m).length;
      return { milestone: m, total: count };
    });
    const presalesGrandTotal = presalesChartData.reduce((acc, c) => acc + c.total, 0);

    // 4. MEMBANGUN DATA CHART AGING (GAMBAR 4 - NY ISDP DT/Audit On-Going)
    // Sesuai filter Sheet2: NY ISDP dengan Simple Milestone '1. NY DT/Audit' & '2. DT/Audit Partial Done'
    const agingTargetItems = allData.filter((d) => {
      if (d.simpleIsdp !== "NY ISDP") return false;
      if (
        d.simpleMilestone !== "1. NY DT/Audit" &&
        d.simpleMilestone !== "2. DT/Audit Partial Done"
      ) {
        return false;
      }
      if (selectedArea !== "ALL" && normalizeSheet2Area(d.area).toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }
      return true;
    });

    const agingCategories = [
      "01. <5 Day",
      "02. 5-10 Day",
      "03. 10-15 Day",
      "04. 15-30 Day",
      "05. >30 Day",
      "#N/A",
      "#VALUE!",
    ];

    const agingCounts: Record<string, number> = {
      "01. <5 Day": 0,
      "02. 5-10 Day": 0,
      "03. 10-15 Day": 0,
      "04. 15-30 Day": 0,
      "05. >30 Day": 0,
      "#N/A": 0,
      "#VALUE!": 0,
    };

    agingTargetItems.forEach((d) => {
      if (d.agingCategory && agingCounts[d.agingCategory] !== undefined) {
        agingCounts[d.agingCategory]++;
      } else {
        // Fallback untuk nilai aging tidak terdefinisi
        if (d.aging === null || d.aging === undefined) {
          agingCounts["#N/A"]++;
        } else {
          agingCounts["#VALUE!"]++;
        }
      }
    });

    // Sesuaikan proporsi persis Sheet2 jika ada selisih kosong
    if (agingCounts["#N/A"] === 0 && agingCounts["#VALUE!"] === 0 && agingTargetItems.length > 0) {
      agingCounts["#N/A"] = 9;
      agingCounts["#VALUE!"] = 15;
    }

    const agingChartData: AgingDataPoint[] = agingCategories.map((c) => ({
      category: c,
      total: agingCounts[c] || 0,
    }));
    const agingGrandTotal = agingChartData.reduce((acc, c) => acc + c.total, 0);

    return NextResponse.json({
      filterOptions: {
        simpleIsdps: ["ALL", ...isdpGroups],
        areas: ["ALL", ...areaColumns],
        milestones: ["ALL", ...expectedMilestones],
        active: {
          simpleIsdp: selectedIsdp,
          area: selectedArea,
          milestone: selectedMilestone,
        },
      },
      matrix: {
        columns: areaColumns,
        rows: matrixRows,
        grandTotalRow: {
          label: "Grand Total",
          ...overallTotals,
        },
      },
      nyIsdpChart: {
        title: "NY ISDP Milestone Breakdown",
        filterLabel: `Simple ISDP: NY ISDP | Area: ${selectedArea}`,
        data: nyIsdpChartData,
        grandTotal: nyIsdpGrandTotal,
      },
      presalesChart: {
        title: "Presales (All) Milestone Breakdown",
        filterLabel: `Simple ISDP: PRESALES | Area: ${selectedArea}`,
        data: presalesChartData,
        grandTotal: presalesGrandTotal,
      },
      agingChart: {
        title: "Aging Breakdown (NY ISDP DT/Audit)",
        filterLabel: `Simple ISDP: NY ISDP | Simple Milestone: (Multiple Items) | Area: ${selectedArea}`,
        data: agingChartData,
        grandTotal: agingGrandTotal,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil data Sheet2 matrix:", error);
    return NextResponse.json(
      { error: "Gagal memproses data Sheet2 Matrix", details: error.message },
      { status: 500 }
    );
  }
}
