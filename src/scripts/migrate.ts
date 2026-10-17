import fs from "fs";
import path from "path";
import { getMssqlPool } from "../lib/db/mssql";

async function runMigration() {
  console.log("=== MENJALANKAN DDL MIGRATION MS SQL SERVER ===");
  try {
    const pool = await getMssqlPool();
    const sqlPath = path.resolve(__dirname, "sql", "001_initial_schema.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    // Eksekusi per batch 'GO'
    const batches = sqlContent.split(/^GO\s*$/im);
    for (const batch of batches) {
      const trimmed = batch.trim();
      if (trimmed) {
        await pool.request().query(trimmed);
      }
    }

    console.log("Migrasi skema database berhasil diselesaikan!");
    process.exit(0);
  } catch (err: any) {
    console.error("Gagal menjalankan migrasi:", err.message);
    process.exit(1);
  }
}

runMigration();
