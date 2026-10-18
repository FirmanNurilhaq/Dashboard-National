import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import {
  cleanseAssignmentRow,
  cleanseIsdpRow,
  CleanedIsdpRecord,
} from "../lib/data-cleansing";
import { Assignment } from "../types/assignment";

async function main() {
  console.log("=========================================================================");
  console.log("   MEMULAI PARSING & DATA CLEANSING TELKOMSEL NW RF TRACKER & ISDP (45)  ");
  console.log("=========================================================================");
  const startTime = Date.now();

  // Tentukan path sumber file utama (utamakan Telkomsel NW RF National Tracker - National Dashboard.xlsb)
  let filePath = path.resolve(process.cwd(), "Telkomsel NW RF National Tracker  - National Dashboard.xlsb");
  if (!fs.existsSync(filePath)) {
    const fallbackList = [
      path.resolve(process.cwd(), "Telkomsel NW RF National Tracker.xlsb"),
      path.resolve(process.cwd(), "Book1.xlsx"),
    ];
    const found = fallbackList.find((f) => fs.existsSync(f));
    if (found) {
      console.warn(`File default tidak ditemukan, menggunakan alternatif: ${found}`);
      filePath = found;
    } else {
      console.error(`File sumber tidak ditemukan di: ${filePath}`);
      process.exit(1);
    }
  }

  console.log(`Membaca workbook dari: ${filePath}`);
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  console.log(`Daftar sheet yang tersedia di file:`, workbook.SheetNames);

  // 1. Ekstraksi Sheet "Data ISDP" jika tersedia
  const isdpLookup = new Map<string, CleanedIsdpRecord>();
  const isdpSheetName = workbook.SheetNames.find((s) =>
    s.toLowerCase().includes("isdp")
  );

  if (isdpSheetName) {
    console.log(`Menemukan sheet ISDP: '${isdpSheetName}'. Memulai ekstraksi...`);
    const isdpSheet = workbook.Sheets[isdpSheetName];
    const isdpRawRows = xlsx.utils.sheet_to_json<any[]>(isdpSheet, { header: 1 });
    console.log(`Total baris mentah di sheet '${isdpSheetName}': ${isdpRawRows.length}`);

    // Baris 0 = header, baris 1 = agregat total, data mulai dari baris 2
    for (let i = 2; i < isdpRawRows.length; i++) {
      const row = isdpRawRows[i];
      const cleaned = cleanseIsdpRow(row);
      if (cleaned && cleaned.duId) {
        isdpLookup.set(cleaned.duId, cleaned);
      }
    }
    console.log(`Berhasil mengekstrak ${isdpLookup.size} record unik ISDP untuk pencocokan.`);
  } else {
    console.warn(`Sheet 'Data ISDP' tidak ditemukan, melanjutkan tanpa integrasi ISDP.`);
  }

  // 2. Ekstraksi Sheet Utama "Telkomsel NW RF National Tracke"
  const masterSheetName =
    workbook.SheetNames.find(
      (s) =>
        s.toLowerCase().includes("tracke") ||
        s.toLowerCase().includes("national") ||
        s.toLowerCase().includes("telkomsel")
    ) || workbook.SheetNames[0];

  console.log(`Mengonversi master sheet: '${masterSheetName}' ke array baris...`);
  const masterSheet = workbook.Sheets[masterSheetName];
  const rawRows = xlsx.utils.sheet_to_json<any[]>(masterSheet, { header: 1 });
  console.log(`Total baris mentah di sheet '${masterSheetName}': ${rawRows.length}`);

  const assignmentMap = new Map<string, Assignment>();
  let duplicateCount = 0;
  let skippedEmpty = 0;
  let isdpMatchedCount = 0;

  // Baris 0 adalah Header
  for (let i = 1; i < rawRows.length; i++) {
    const raw = rawRows[i];
    if (!raw || (!raw[0] && !raw[1])) {
      skippedEmpty++;
      continue;
    }

    const cleansed = cleanseAssignmentRow(raw, i, isdpLookup);
    if (cleansed) {
      if (cleansed.isdpMatched) {
        isdpMatchedCount++;
      }
      if (assignmentMap.has(cleansed.recordId)) {
        duplicateCount++;
      }
      // Aturan Deduplikasi: Baris paling baru menimpa baris lama
      assignmentMap.set(cleansed.recordId, cleansed);
    } else {
      skippedEmpty++;
    }
  }

  const cleansedAssignments = Array.from(assignmentMap.values());
  console.log(`Total baris unik berhasil di-cleanse: ${cleansedAssignments.length}`);
  console.log(`Total baris duplikasi di-handle: ${duplicateCount}`);
  console.log(`Total baris yang berhasil di-match dengan Data ISDP: ${isdpMatchedCount}`);
  console.log(`Total baris kosong/dilewati: ${skippedEmpty}`);

  // 3. Simpan ke src/data/assignments.json
  const outputDir = path.resolve(process.cwd(), "src", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "assignments.json");
  fs.writeFileSync(outputPath, JSON.stringify(cleansedAssignments, null, 2), "utf-8");

  // 4. Hitung & simpan summary metadata
  const metadataPath = path.join(outputDir, "summary-metadata.json");
  const areas = Array.from(new Set(cleansedAssignments.map((a) => a.area))).sort();
  const milestones = Array.from(
    new Set(cleansedAssignments.map((a) => a.milestoneNw))
  ).sort();

  const totalAccepted = cleansedAssignments.filter((a) => a.finalStatus === "Acc").length;
  const totalRejected = cleansedAssignments.filter((a) => a.finalStatus === "Reject").length;
  const totalOa = cleansedAssignments.filter((a) => a.statusOa === "On Air").length;
  const totalDtDone = cleansedAssignments.filter((a) => a.statusDt === "Done").length;

  const metadata = {
    dataSource: path.basename(filePath),
    masterSheet: masterSheetName,
    isdpSheet: isdpSheetName || null,
    totalRecords: cleansedAssignments.length,
    isdpMatchedRecords: isdpMatchedCount,
    totalAccepted,
    totalRejected,
    totalNotYetAcc: cleansedAssignments.length - totalAccepted - totalRejected,
    totalOnAir: totalOa,
    totalNotYetOa: cleansedAssignments.length - totalOa,
    totalDtDone,
    approvalRate: ((totalAccepted / cleansedAssignments.length) * 100).toFixed(2) + "%",
    areas,
    milestones,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

  console.log(`Berhasil menyimpan ${cleansedAssignments.length} record ke: ${outputPath}`);
  console.log(`Summary Metadata:`, metadata);
  console.log(`Proses selesai dalam ${Date.now() - startTime}ms.`);
}

main().catch((err) => {
  console.error("Gagal melakukan parsing data Telkomsel Tracker:", err);
  process.exit(1);
});
