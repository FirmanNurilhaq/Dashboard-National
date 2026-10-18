import path from "path";
import fs from "fs";
import * as xlsx from "xlsx";
import { getMssqlPool, sql } from "../lib/db/mssql";
import {
  cleanseAssignmentRow,
  cleanseIsdpRow,
  CleanedIsdpRecord,
} from "../lib/data-cleansing";
import { Assignment } from "../types/assignment";

function buildSqlTable(): sql.Table {
  const table = new sql.Table("Staging_Assignments");
  table.create = false;

  // Master Columns (29)
  table.columns.add("Record_ID", sql.NVarChar(205), { nullable: false, primary: true });
  table.columns.add("PMO_Uniq", sql.NVarChar(100), { nullable: true });
  table.columns.add("DU_ID", sql.NVarChar(100), { nullable: false });
  table.columns.add("Site_ID", sql.NVarChar(50), { nullable: false });
  table.columns.add("Site_Name", sql.NVarChar(255), { nullable: false });
  table.columns.add("Program_ID", sql.NVarChar(255), { nullable: true });
  table.columns.add("DU_Model", sql.NVarChar(100), { nullable: true });
  table.columns.add("Area", sql.NVarChar(100), { nullable: false });
  table.columns.add("Kabupaten", sql.NVarChar(150), { nullable: false });
  table.columns.add("Longitude", sql.Decimal(11, 7), { nullable: true });
  table.columns.add("Latitude", sql.Decimal(10, 7), { nullable: true });
  table.columns.add("PO_Release", sql.NVarChar(100), { nullable: true });
  table.columns.add("Status_PO", sql.NVarChar(50), { nullable: true });
  table.columns.add("M06_Date", sql.Date, { nullable: true });
  table.columns.add("OA_Date", sql.Date, { nullable: true });
  table.columns.add("DT_Date", sql.Date, { nullable: true });
  table.columns.add("Audit_Date", sql.Date, { nullable: true });
  table.columns.add("QC_Accepted_Done_Review", sql.Date, { nullable: true });
  table.columns.add("QC_RF_Date", sql.Date, { nullable: true });
  table.columns.add("RF_Cat_Issue_Level2", sql.NVarChar(100), { nullable: true });
  table.columns.add("PIC_Progress_RF", sql.NVarChar(100), { nullable: true });
  table.columns.add("PIC_RF", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_Status", sql.NVarChar(100), { nullable: true });
  table.columns.add("Remark", sql.NVarChar(sql.MAX), { nullable: true });
  table.columns.add("Milestone_NW", sql.NVarChar(100), { nullable: false });
  table.columns.add("Issue_DT_Audit", sql.NVarChar(255), { nullable: true });
  table.columns.add("Aging", sql.Int, { nullable: true });
  table.columns.add("Aging_Category", sql.NVarChar(50), { nullable: true });
  table.columns.add("Current_Status_ISDP", sql.NVarChar(100), { nullable: true });
  table.columns.add("Simple_ISDP", sql.NVarChar(100), { nullable: true });
  table.columns.add("Simple_Milestone", sql.NVarChar(100), { nullable: true });

  // ISDP Columns (9)
  table.columns.add("ISDP_PO_NO", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_QC_RF_Date", sql.Date, { nullable: true });
  table.columns.add("ISDP_QC_RF", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_SAPLO", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_Remark", sql.NVarChar(sql.MAX), { nullable: true });
  table.columns.add("ISDP_Aging", sql.Int, { nullable: true });
  table.columns.add("ISDP_Area", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_Appendix_Simple_ISDP", sql.NVarChar(100), { nullable: true });
  table.columns.add("ISDP_Appendix_Simple_Milestone", sql.NVarChar(100), { nullable: true });

  // Operasional & Auditing Columns (7)
  table.columns.add("Report_Submit_Date", sql.Date, { nullable: true });
  table.columns.add("Acc_Date", sql.Date, { nullable: true });
  table.columns.add("Coordinate_Raw", sql.NVarChar(100), { nullable: true });
  table.columns.add("Extra_Col1", sql.NVarChar(100), { nullable: true });
  table.columns.add("Extra_Col2", sql.NVarChar(100), { nullable: true });
  table.columns.add("Status_OA", sql.NVarChar(50), { nullable: false });
  table.columns.add("Status_DT", sql.NVarChar(50), { nullable: false });
  table.columns.add("Final_Status", sql.NVarChar(50), { nullable: false });
  table.columns.add("RowHash", sql.Char(64), { nullable: false });
  table.columns.add("CreatedAt", sql.DateTime2, { nullable: false });
  table.columns.add("UpdatedAt", sql.DateTime2, { nullable: false });

  return table;
}

async function seedExcelToMssql() {
  console.log("=========================================================================");
  console.log("   SEEDING TELKOMSEL NW RF TRACKER & ISDP (45 KOLOM) KE REMOTE MS SQL   ");
  console.log("=========================================================================");
  const startTime = new Date();

  try {
    const pool = await getMssqlPool();
    console.log("Berhasil terhubung ke Microsoft SQL Server db_productivity_tsel di nusa.mahavikri.net:4842.");

    // Tentukan path sumber file utama (utamakan file baru Telkomsel NW RF National Tracker - National Dashboard.xlsb)
    let filePath = process.env.EXCEL_SEED_FILE_PATH
      ? path.resolve(process.cwd(), process.env.EXCEL_SEED_FILE_PATH)
      : path.resolve(process.cwd(), "Telkomsel NW RF National Tracker  - National Dashboard.xlsb");

    if (!fs.existsSync(filePath)) {
      const fallbackList = [
        path.resolve(process.cwd(), "Telkomsel NW RF National Tracker  - National Dashboard.xlsb"),
        path.resolve(process.cwd(), "Telkomsel NW RF National Tracker.xlsb"),
        path.resolve(process.cwd(), "Book1.xlsx"),
      ];
      const found = fallbackList.find((f) => fs.existsSync(f));
      if (found) {
        console.warn(`File default tidak ditemukan, menggunakan alternatif: ${found}`);
        filePath = found;
      } else {
        throw new Error(`File sumber tidak ditemukan di: ${filePath}`);
      }
    }

    console.log(`Membaca workbook dari: ${filePath}`);
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    console.log("Daftar sheet yang tersedia:", workbook.SheetNames);

    // 1. Ekstraksi Sheet Data ISDP
    const isdpLookup = new Map<string, CleanedIsdpRecord>();
    const isdpSheetName = workbook.SheetNames.find((s) =>
      s.toLowerCase().includes("isdp")
    );

    if (isdpSheetName) {
      console.log(`Mengekstrak data dari sheet ISDP: '${isdpSheetName}'...`);
      const isdpSheet = workbook.Sheets[isdpSheetName];
      const isdpRawRows = xlsx.utils.sheet_to_json<any[]>(isdpSheet, { header: 1 });
      for (let i = 2; i < isdpRawRows.length; i++) {
        const cleaned = cleanseIsdpRow(isdpRawRows[i]);
        if (cleaned && cleaned.duId) {
          isdpLookup.set(cleaned.duId, cleaned);
        }
      }
      console.log(`Ditemukan ${isdpLookup.size} record unik ISDP.`);
    }

    // 2. Ekstraksi Sheet Utama Tracker dengan Deduplikasi Record_ID (Latest Wins)
    const masterSheetName =
      process.env.EXCEL_SEED_SHEET_NAME ||
      workbook.SheetNames.find(
        (s) =>
          s.toLowerCase().includes("tracke") ||
          s.toLowerCase().includes("national") ||
          s.toLowerCase().includes("telkomsel")
      ) ||
      workbook.SheetNames[0];

    console.log(`Mengekstrak data dari sheet master: '${masterSheetName}'...`);
    const masterSheet = workbook.Sheets[masterSheetName];
    const rawRows = xlsx.utils.sheet_to_json<any[]>(masterSheet, { header: 1 });

    const assignmentMap = new Map<string, Assignment>();
    let duplicateCount = 0;

    for (let i = 1; i < rawRows.length; i++) {
      const raw = rawRows[i];
      if (!raw || (!raw[0] && !raw[1])) continue;
      const c = cleanseAssignmentRow(raw, i, isdpLookup);
      if (c) {
        if (assignmentMap.has(c.recordId)) {
          duplicateCount++;
        }
        // Aturan Deduplikasi: baris paling bawah/terbaru menimpa baris sebelumnya
        assignmentMap.set(c.recordId, c);
      }
    }

    const cleansedList = Array.from(assignmentMap.values());
    console.log(`Total data unik setelah deduplikasi: ${cleansedList.length} baris (Deduplikasi: ${duplicateCount} baris).`);

    // 3. Siapkan Tabel Staging Fisik di MS SQL
    console.log("Menyiapkan tabel Staging_Assignments di remote database...");
    await pool.request().query(`
      IF OBJECT_ID('Staging_Assignments') IS NOT NULL DROP TABLE Staging_Assignments;
      SELECT TOP 0 * INTO Staging_Assignments FROM Assignments;
    `);

    // 4. Lakukan Bulk Insert dalam batch per 2.500 baris
    const BATCH_SIZE = 2500;
    const now = new Date();

    for (let i = 0; i < cleansedList.length; i += BATCH_SIZE) {
      const chunk = cleansedList.slice(i, i + BATCH_SIZE);
      const table = buildSqlTable();

      chunk.forEach((c) => {
        table.rows.add(
          c.recordId,
          c.pmoUniq,
          c.duId,
          c.siteId,
          c.siteName,
          c.programId,
          c.duModel,
          c.area,
          c.kabupaten,
          c.longitude,
          c.latitude,
          c.poRelease,
          c.statusPo,
          c.m06Date ? new Date(c.m06Date) : null,
          c.oaDate ? new Date(c.oaDate) : null,
          c.dtDate ? new Date(c.dtDate) : null,
          c.auditDate ? new Date(c.auditDate) : null,
          c.qcAcceptedDoneReview ? new Date(c.qcAcceptedDoneReview) : null,
          c.qcRfDate ? new Date(c.qcRfDate) : null,
          c.rfCatIssueLevel2,
          c.picProgressRf,
          c.picRf,
          c.isdpStatus,
          c.remark,
          c.milestoneNw,
          c.issueDtAudit,
          c.aging,
          c.agingCategory,
          c.currentStatusIsdp,
          c.simpleIsdp,
          c.simpleMilestone,
          c.isdpPoNo,
          c.isdpQcRfDate ? new Date(c.isdpQcRfDate) : null,
          c.isdpQcRf,
          c.isdpSaplo,
          c.isdpRemark,
          c.isdpAging,
          c.isdpArea,
          c.isdpAppendixSimpleIsdp,
          c.isdpAppendixSimpleMilestone,
          c.reportSubmitDate ? new Date(c.reportSubmitDate) : null,
          c.accDate ? new Date(c.accDate) : null,
          c.coordinateRaw,
          c.extraCol1,
          c.extraCol2,
          c.statusOa,
          c.statusDt,
          c.finalStatus,
          c.rowHash,
          now,
          now
        );
      });

      console.log(`Mengirim batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} baris) ke Staging_Assignments...`);
      await pool.request().bulk(table);
    }

    // 5. Jalankan Transaksi MERGE Berkecepatan Tinggi
    console.log("Menjalankan transaksi MERGE INTO Assignments di remote database...");
    await pool.request().query(`
      MERGE INTO Assignments AS Target
      USING Staging_Assignments AS Source
      ON (Target.Record_ID = Source.Record_ID)
      WHEN MATCHED AND Target.RowHash <> Source.RowHash THEN
        UPDATE SET
          Target.PMO_Uniq = Source.PMO_Uniq,
          Target.Site_ID = Source.Site_ID,
          Target.Site_Name = Source.Site_Name,
          Target.Program_ID = Source.Program_ID,
          Target.DU_Model = Source.DU_Model,
          Target.Area = Source.Area,
          Target.Kabupaten = Source.Kabupaten,
          Target.Longitude = Source.Longitude,
          Target.Latitude = Source.Latitude,
          Target.PO_Release = Source.PO_Release,
          Target.Status_PO = Source.Status_PO,
          Target.M06_Date = Source.M06_Date,
          Target.OA_Date = Source.OA_Date,
          Target.DT_Date = Source.DT_Date,
          Target.Audit_Date = Source.Audit_Date,
          Target.QC_Accepted_Done_Review = Source.QC_Accepted_Done_Review,
          Target.QC_RF_Date = Source.QC_RF_Date,
          Target.RF_Cat_Issue_Level2 = Source.RF_Cat_Issue_Level2,
          Target.PIC_Progress_RF = Source.PIC_Progress_RF,
          Target.PIC_RF = Source.PIC_RF,
          Target.ISDP_Status = Source.ISDP_Status,
          Target.Remark = Source.Remark,
          Target.Milestone_NW = Source.Milestone_NW,
          Target.Issue_DT_Audit = Source.Issue_DT_Audit,
          Target.Aging = Source.Aging,
          Target.Aging_Category = Source.Aging_Category,
          Target.Current_Status_ISDP = Source.Current_Status_ISDP,
          Target.Simple_ISDP = Source.Simple_ISDP,
          Target.Simple_Milestone = Source.Simple_Milestone,
          Target.ISDP_PO_NO = Source.ISDP_PO_NO,
          Target.ISDP_QC_RF_Date = Source.ISDP_QC_RF_Date,
          Target.ISDP_QC_RF = Source.ISDP_QC_RF,
          Target.ISDP_SAPLO = Source.ISDP_SAPLO,
          Target.ISDP_Remark = Source.ISDP_Remark,
          Target.ISDP_Aging = Source.ISDP_Aging,
          Target.ISDP_Area = Source.ISDP_Area,
          Target.ISDP_Appendix_Simple_ISDP = Source.ISDP_Appendix_Simple_ISDP,
          Target.ISDP_Appendix_Simple_Milestone = Source.ISDP_Appendix_Simple_Milestone,
          Target.Report_Submit_Date = Source.Report_Submit_Date,
          Target.Acc_Date = Source.Acc_Date,
          Target.Coordinate_Raw = Source.Coordinate_Raw,
          Target.Extra_Col1 = Source.Extra_Col1,
          Target.Extra_Col2 = Source.Extra_Col2,
          Target.Status_OA = Source.Status_OA,
          Target.Status_DT = Source.Status_DT,
          Target.Final_Status = Source.Final_Status,
          Target.RowHash = Source.RowHash,
          Target.UpdatedAt = SYSDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          Record_ID, PMO_Uniq, DU_ID, Site_ID, Site_Name, Program_ID, DU_Model,
          Area, Kabupaten, Longitude, Latitude, PO_Release, Status_PO,
          M06_Date, OA_Date, DT_Date, Audit_Date, QC_Accepted_Done_Review, QC_RF_Date,
          RF_Cat_Issue_Level2, PIC_Progress_RF, PIC_RF, ISDP_Status, Remark, Milestone_NW,
          Issue_DT_Audit, Aging, Aging_Category, Current_Status_ISDP, Simple_ISDP, Simple_Milestone,
          ISDP_PO_NO, ISDP_QC_RF_Date, ISDP_QC_RF, ISDP_SAPLO, ISDP_Remark, ISDP_Aging, ISDP_Area,
          ISDP_Appendix_Simple_ISDP, ISDP_Appendix_Simple_Milestone,
          Report_Submit_Date, Acc_Date, Coordinate_Raw, Extra_Col1, Extra_Col2,
          Status_OA, Status_DT, Final_Status, RowHash, CreatedAt, UpdatedAt
        ) VALUES (
          Source.Record_ID, Source.PMO_Uniq, Source.DU_ID, Source.Site_ID, Source.Site_Name, Source.Program_ID, Source.DU_Model,
          Source.Area, Source.Kabupaten, Source.Longitude, Source.Latitude, Source.PO_Release, Source.Status_PO,
          Source.M06_Date, Source.OA_Date, Source.DT_Date, Source.Audit_Date, Source.QC_Accepted_Done_Review, Source.QC_RF_Date,
          Source.RF_Cat_Issue_Level2, Source.PIC_Progress_RF, Source.PIC_RF, Source.ISDP_Status, Source.Remark, Source.Milestone_NW,
          Source.Issue_DT_Audit, Source.Aging, Source.Aging_Category, Source.Current_Status_ISDP, Source.Simple_ISDP, Source.Simple_Milestone,
          Source.ISDP_PO_NO, Source.ISDP_QC_RF_Date, Source.ISDP_QC_RF, Source.ISDP_SAPLO, Source.ISDP_Remark, Source.ISDP_Aging, Source.ISDP_Area,
          Source.ISDP_Appendix_Simple_ISDP, Source.ISDP_Appendix_Simple_Milestone,
          Source.Report_Submit_Date, Source.Acc_Date, Source.Coordinate_Raw, Source.Extra_Col1, Source.Extra_Col2,
          Source.Status_OA, Source.Status_DT, Source.Final_Status, Source.RowHash, SYSDATETIME(), SYSDATETIME()
        );

      -- Bersihkan tabel staging setelah selesai
      TRUNCATE TABLE Staging_Assignments;
    `);

    // 6. Catat Audit ke SyncLogs
    const endTime = new Date();
    await pool.request()
      .input("SyncSource", sql.NVarChar(50), "EXCEL_SEED")
      .input("StartTime", sql.DateTime2, startTime)
      .input("EndTime", sql.DateTime2, endTime)
      .input("TotalRowsRead", sql.Int, cleansedList.length)
      .input("InsertedCount", sql.Int, cleansedList.length)
      .input("Status", sql.NVarChar(50), "SUCCESS")
      .query(`
        INSERT INTO SyncLogs (SyncSource, StartTime, EndTime, TotalRowsRead, InsertedCount, Status)
        VALUES (@SyncSource, @StartTime, @EndTime, @TotalRowsRead, @InsertedCount, @Status)
      `);

    console.log(`Seeding 45 kolom ke remote MS SQL selesai dalam ${Date.now() - startTime.getTime()}ms. Status: SUCCESS.`);
    process.exit(0);
  } catch (err: any) {
    console.error("Gagal melakukan seeding ke remote MS SQL:", err.message);
    process.exit(1);
  }
}

seedExcelToMssql();
