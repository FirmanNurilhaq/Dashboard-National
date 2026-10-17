import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import { cleanseAssignmentRow } from "../lib/data-cleansing";
import { Assignment } from "../types/assignment";

async function main() {
  console.log("=== MEMULAI PARSING & DATA CLEANSING BOOK1.XLSX ===");
  const startTime = Date.now();

  const filePath = path.resolve(process.cwd(), "Book1.xlsx");
  if (!fs.existsSync(filePath)) {
    console.error(`File tidak ditemukan: ${filePath}`);
    process.exit(1);
  }

  console.log("Membaca file Book1.xlsx...");
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  console.log(`Mengonversi sheet '${sheetName}' ke array baris...`);
  const rawRows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  console.log(`Total baris mentah di sheet: ${rawRows.length}`);

  const cleansedAssignments: Assignment[] = [];
  let skippedEmpty = 0;

  // Baris 0 adalah Header
  for (let i = 1; i < rawRows.length; i++) {
    const raw = rawRows[i];
    if (!raw || (!raw[0] && !raw[1])) {
      skippedEmpty++;
      continue;
    }

    const cleansed = cleanseAssignmentRow(raw, i);
    if (cleansed) {
      cleansedAssignments.push(cleansed);
    } else {
      skippedEmpty++;
    }
  }

  console.log(`Total baris data valid berhasil di-cleanse: ${cleansedAssignments.length}`);
  console.log(`Total baris kosong/dilewati: ${skippedEmpty}`);

  // Simpan ke src/data/assignments.json
  const outputDir = path.resolve(process.cwd(), "src", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "assignments.json");
  fs.writeFileSync(outputPath, JSON.stringify(cleansedAssignments, null, 2), "utf-8");

  // Buat juga summary metadata
  const metadataPath = path.join(outputDir, "summary-metadata.json");
  const areas = Array.from(new Set(cleansedAssignments.map((a) => a.area))).sort();
  const milestones = Array.from(new Set(cleansedAssignments.map((a) => a.milestoneNw))).sort();

  const totalAccepted = cleansedAssignments.filter((a) => a.finalStatus === "Acc").length;
  const totalRejected = cleansedAssignments.filter((a) => a.finalStatus === "Reject").length;
  const totalOa = cleansedAssignments.filter((a) => a.statusOa === "On Air").length;

  const metadata = {
    totalRecords: cleansedAssignments.length,
    totalAccepted,
    totalRejected,
    totalNotYetAcc: cleansedAssignments.length - totalAccepted - totalRejected,
    totalOnAir: totalOa,
    totalNotYetOa: cleansedAssignments.length - totalOa,
    approvalRate: ((totalAccepted / cleansedAssignments.length) * 100).toFixed(2) + "%",
    areas,
    milestones,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

  console.log(`Berhasil menyimpan ${cleansedAssignments.length} record ke: ${outputPath}`);
  console.log(`Summary Metadata:`, metadata);
  console.log(`Selesai dalam ${Date.now() - startTime}ms.`);
}

main().catch((err) => {
  console.error("Gagal melakukan parsing Book1.xlsx:", err);
  process.exit(1);
});
