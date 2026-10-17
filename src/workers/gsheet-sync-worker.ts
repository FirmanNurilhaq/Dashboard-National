import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

console.log("=== TELECOM PRODUCTIVITY: GSHEET SYNC WORKER INITIATED ===");
console.log(`Jadwal Cron: ${process.env.CRON_SCHEDULE || "0 * * * *"}`);

async function runHourlySync() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Memulai siklus penarikan data Google Sheets 'National'...`);
  
  // Periksa apakah kredensial GSheets dan MS SQL sudah terkonfigurasi
  if (!process.env.GSHEET_SPREADSHEET_ID || !process.env.MSSQL_HOST) {
    console.log(`[${timestamp}] Kredensial GSHEET_SPREADSHEET_ID / MSSQL_HOST belum aktif di .env. Sinkronisasi standby.`);
    return;
  }

  try {
    console.log(`[${timestamp}] Worker standby dan siap mengeksekusi diffing SHA-256 saat database MS SQL diaktifkan.`);
  } catch (err: any) {
    console.error(`[${timestamp}] Error saat siklus sinkronisasi:`, err.message);
  }
}

// Jalankan cronjob per jam
cron.schedule(process.env.CRON_SCHEDULE || "0 * * * *", () => {
  runHourlySync();
});

console.log("Worker sedang berjalan di latar belakang (daemon mode)...");
