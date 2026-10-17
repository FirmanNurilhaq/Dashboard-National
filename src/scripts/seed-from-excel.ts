import path from "path";
import * as xlsx from "xlsx";
import { getMssqlPool, sql } from "../lib/db/mssql";
import { cleanseAssignmentRow } from "../lib/data-cleansing";
import { Assignment } from "../types/assignment";

async function seedExcelToMssql() {
  console.log("=== SEEDING DATA AWAL DARI BOOK1.XLSX KE MS SQL SERVER ===");
  const startTime = new Date();

  try {
    const pool = await getMssqlPool();
    console.log("Terhubung ke Microsoft SQL Server.");

    const filePath = path.resolve(process.cwd(), "Book1.xlsx");
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    const cleansedList: Assignment[] = [];
    for (let i = 1; i < rawRows.length; i++) {
      const raw = rawRows[i];
      if (!raw || (!raw[0] && !raw[1])) continue;
      const c = cleanseAssignmentRow(raw, i);
      if (c) cleansedList.push(c);
    }

    console.log(`Berhasil membersihkan ${cleansedList.length} baris dari Book1.xlsx.`);

    // 1. Buat Tabel Staging Sementara
    await pool.request().query(`
      IF OBJECT_ID('tempdb..#StagingAssignments') IS NOT NULL DROP TABLE #StagingAssignments;
      SELECT TOP 0 * INTO #StagingAssignments FROM Assignments;
    `);

    // 2. Buat objek mssql.Table untuk Bulk Insert
    const table = new sql.Table("#StagingAssignments");
    table.create = false;

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
    table.columns.add("Report_Submit_Date", sql.Date, { nullable: true });
    table.columns.add("Acc_Date", sql.Date, { nullable: true });
    table.columns.add("RF_Cat_Issue_Level2", sql.NVarChar(100), { nullable: true });
    table.columns.add("PIC_RF", sql.NVarChar(100), { nullable: true });
    table.columns.add("ISDP_Status", sql.NVarChar(100), { nullable: true });
    table.columns.add("Remark", sql.NVarChar(sql.MAX), { nullable: true });
    table.columns.add("Milestone_NW", sql.NVarChar(100), { nullable: false });
    table.columns.add("Coordinate_Raw", sql.NVarChar(100), { nullable: true });
    table.columns.add("Extra_Col1", sql.NVarChar(100), { nullable: true });
    table.columns.add("Extra_Col2", sql.NVarChar(100), { nullable: true });
    table.columns.add("Status_OA", sql.NVarChar(50), { nullable: false });
    table.columns.add("Status_DT", sql.NVarChar(50), { nullable: false });
    table.columns.add("Final_Status", sql.NVarChar(50), { nullable: false });
    table.columns.add("RowHash", sql.Char(64), { nullable: false });
    table.columns.add("CreatedAt", sql.DateTime2, { nullable: false });
    table.columns.add("UpdatedAt", sql.DateTime2, { nullable: false });

    const now = new Date();
    cleansedList.forEach((c) => {
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
        c.reportSubmitDate ? new Date(c.reportSubmitDate) : null,
        c.accDate ? new Date(c.accDate) : null,
        c.rfCatIssueLevel2,
        c.picRf,
        c.isdpStatus,
        c.remark,
        c.milestoneNw,
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

    console.log("Melakukan Bulk Insert ke #StagingAssignments...");
    await pool.request().bulk(table);

    // 3. Jalankan SQL MERGE transaksional berkecepatan tinggi
    console.log("Menjalankan transaksi MERGE INTO Assignments...");
    const mergeResult = await pool.request().query(`
      MERGE INTO Assignments AS Target
      USING #StagingAssignments AS Source
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
          Target.Report_Submit_Date = Source.Report_Submit_Date,
          Target.Acc_Date = Source.Acc_Date,
          Target.RF_Cat_Issue_Level2 = Source.RF_Cat_Issue_Level2,
          Target.PIC_RF = Source.PIC_RF,
          Target.ISDP_Status = Source.ISDP_Status,
          Target.Remark = Source.Remark,
          Target.Milestone_NW = Source.Milestone_NW,
          Target.Status_OA = Source.Status_OA,
          Target.Status_DT = Source.Status_DT,
          Target.Final_Status = Source.Final_Status,
          Target.RowHash = Source.RowHash,
          Target.UpdatedAt = SYSDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (
          Record_ID, PMO_Uniq, DU_ID, Site_ID, Site_Name, Program_ID, DU_Model,
          Area, Kabupaten, Longitude, Latitude, PO_Release, Status_PO,
          M06_Date, OA_Date, DT_Date, Audit_Date, Report_Submit_Date, Acc_Date,
          RF_Cat_Issue_Level2, PIC_RF, ISDP_Status, Remark, Milestone_NW,
          Coordinate_Raw, Extra_Col1, Extra_Col2, Status_OA, Status_DT, Final_Status,
          RowHash, CreatedAt, UpdatedAt
        ) VALUES (
          Source.Record_ID, Source.PMO_Uniq, Source.DU_ID, Source.Site_ID, Source.Site_Name, Source.Program_ID, Source.DU_Model,
          Source.Area, Source.Kabupaten, Source.Longitude, Source.Latitude, Source.PO_Release, Source.Status_PO,
          Source.M06_Date, Source.OA_Date, Source.DT_Date, Source.Audit_Date, Source.Report_Submit_Date, Source.Acc_Date,
          Source.RF_Cat_Issue_Level2, Source.PIC_RF, Source.ISDP_Status, Source.Remark, Source.Milestone_NW,
          Source.Coordinate_Raw, Source.Extra_Col1, Source.Extra_Col2, Source.Status_OA, Source.Status_DT, Source.Final_Status,
          Source.RowHash, SYSDATETIME(), SYSDATETIME()
        );
    `);

    // 4. Catat Audit ke SyncLogs
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

    console.log(`Seeding selesai dalam ${Date.now() - startTime.getTime()}ms. Status: SUCCESS.`);
    process.exit(0);
  } catch (err: any) {
    console.error("Gagal melakukan seeding ke MS SQL:", err.message);
    process.exit(1);
  }
}

seedExcelToMssql();
