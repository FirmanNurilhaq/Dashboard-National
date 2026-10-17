# Nexwave Telecom Productivity & Assignment Tracking Dashboard

Aplikasi web **Enterprise Productivity Dashboard** modern untuk memantau alur kerja (*pipeline*) operasional telekomunikasi nasional secara *real-time* mengikuti tahapan:
`Assignment -> On Air -> Drive Test (DT) -> Audit -> Report -> Final Status (Acc / Reject)`.

---

## 💻 Panduan Instalasi Cepat (Quick Start di Laptop Baru)

Jika Anda melakukan `git clone` atau `git pull` dari laptop lain, ikuti 3 langkah mudah berikut untuk langsung menjalankannya:

### 1. Kloning Repository
```bash
git clone https://github.com/FirmanNurilhaq/Dashboard-National.git
cd Dashboard-National
```

### 2. Pasang Dependencies
Pastikan Node.js (v18, v20, atau v22) sudah terpasang di sistem Anda:
```bash
npm install
```

### 3. Jalankan Aplikasi
Tersedia dua opsi:

- **Mode Development (Live Reload):**
  ```bash
  npm run dev
  ```
- **Mode Production (Performa Tinggi):**
  ```bash
  npm run build
  npm start
  ```

Buka browser dan buka:
👉 **`http://localhost:3000`**

---

## 🔑 Akun Demo Login (Halaman `/login`)
Tersedia fitur **1-Click Quick Demo Login** tanpa perlu mengetik manual:
- **Admin**: `admin_rf` (RF Operations Admin)
- **Executive**: `mgmt_lead` (Management Executive)
- **Engineer**: `pic_rf` (PIC RF Field Engineer)

---

## 🌟 Fitur Utama & Keunggulan
1. **7 Widget Visualisasi Data Interaktif**:
   - **KPI Scorecards 3D**: 5 kartu metrik dengan efek *Subtle 3D Parallax Tilt* (2-3°), animasi staggered load, dan sparkline SVG.
   - **Velocity Trend Line Chart**: Perbandingan deret waktu Incoming vs On Air vs Accepted dengan area gradien memudar.
   - **Approval Rate Donut Chart**: Proporsi status akhir (88.4% Acc) dengan detail alasan reject pada hover/drilldown.
   - **Funnel Pipeline Chart**: Konversi 6 tahap alur kerja operasional dan identifikasi drop rate.
   - **Stacked Bar Workload**: Distribusi status per wilayah Area (JABO, Central Java, East Java, dll).
   - **Peta 3D Geospasial Site (Zero API Key)**: Menggunakan **MapLibre GL** + **OpenFreeMap** + gedung 3D vektor dari OpenMapTiles / OpenStreetMap & penanda menara telekomunikasi BTS.
   - **Interactive Data Grid**: Tabel data virtual dengan pencarian kategorikal, autocomplete saran kata kunci, filter multi-kolom, pagination anti-jump, dan ekspor CSV.
2. **Koleksi Ikon Profesional Tabler Icons**: Seluruh ikon menggunakan `@tabler/icons-react` dengan goresan garis presisi.
3. **Pembersihan Data Terpadu (10.134 Baris Riil)**:
   - Bersih dari nilai kotor seperti `#VALUE!`.
   - Aturan bisnis `'0-Jan-00'` (milestone belum tercapai) otomatis dinormalisasi menjadi `NULL`.
   - Normalisasi Title Case untuk nama Area & Kabupaten.
4. **Offline / Standalone Ready**:
   - Seluruh 10.134 data telah ter-cache di `src/data/assignments.json`. Aplikasi dapat langsung dijalankan tanpa harus terhubung ke Microsoft SQL Server.

---

## 🗄️ Menghubungkan ke Microsoft SQL Server (Opsional)
Ketika server database MS SQL Anda sudah siap digunakan:

1. Konfigurasikan `.env`:
   ```env
   MSSQL_HOST=192.168.x.x
   MSSQL_PORT=1433
   MSSQL_USER=sa
   MSSQL_PASSWORD=YourPassword
   MSSQL_DATABASE=TelecomProductivityDB
   MSSQL_ENCRYPT=true
   MSSQL_TRUST_SERVER_CERTIFICATE=true
   ```

2. Jalankan migrasi DDL:
   ```bash
   npm run db:migrate
   ```

3. Jalankan seeding bulk data dari `Book1.xlsx` ke MS SQL:
   ```bash
   npm run seed:excel
   ```

---

## 🚀 Deployment Windows Server VPS dengan PM2
Aplikasi siap dideploy sebagai layanan background otomatis di Windows Server:
```bash
# 1. Jalankan aplikasi web dan background worker
pm2 start ecosystem.config.js

# 2. Simpan konfigurasi PM2
pm2 save

# 3. Setup auto-start saat VPS Windows reboot
npm install -g pm2-windows-service
pm2-service-install -n PM2_Telecom_Dashboard
```
