# PROJECT MEMORY & ARCHITECTURAL BLUEPRINT: TELECOM PRODUCTIVITY DASHBOARD

> **INSTRUKSI UNTUK AI IDE / CODING ASSISTANT:**
> Dokumen ini adalah sumber kebenaran tunggal (*Single Source of Truth*) untuk proyek **Productivity & Assignment Tracking Dashboard**. Setiap kali Anda men-generate kode, merancang database, membuat API, atau membangun komponen UI, Anda **WAJIB** mematuhi seluruh spesifikasi arsitektur, desain, skema data, dan standar perusahaan yang tertulis di dokumen ini tanpa terkecuali.

---

## 1. RINGKASAN EKSEKUTIF & ARSITEKTUR SISTEM
Proyek ini adalah aplikasi web **Enterprise Productivity Dashboard** untuk memantau alur kerja (*pipeline*) operasional telekomunikasi secara *near real-time* mengikuti tahapan:
`Assignment -> On Air -> Drive Test (DT) -> Audit -> Report -> Final Status (Acc / Reject)`.

### Alur Data Utama (Decoupled Architecture):
1. **Initial Seeding (Fase Awal):** Tersedia *script* khusus (`seed-from-excel.ts`) untuk membaca file lokal `Book1.xlsx` dan melakukan *bulk insert* data awal ke **Microsoft SQL Server (MS SQL)**.
2. **Continuous Sync (Fase Produksi):** Worker otomatis berjalan setiap **1 jam sekali** (dimulai tepat pukul `00:00`, `01:00`, dst.) menarik data dari **Google Sheets** pada lembaran (*sheet*) bernama **`"National"`**, lalu melakukan sinkronisasi cerdas (*delta sync* berbasis SHA-256 *Row Hashing*) ke **MS SQL Server**.
3. **Web Consumption:** Aplikasi Website **HANYA** membaca data dari **Microsoft SQL Server** (tidak pernah memanggil API Google Sheets secara langsung saat user membuka halaman) untuk menjamin performa tinggi (<100ms response time) dan menghindari limit kuota API Google Sheets.
4. **Infrastruktur Deployment:**
   - **Database:** Microsoft SQL Server berada di Server Database terpisah.
   - **Aplikasi & Worker:** Berjalan di **VPS Windows Server** yang dikelola menggunakan **PM2** (dipisahkan menjadi 2 proses: `dashboard-web` dan `gsheet-sync-worker`) serta didaftarkan sebagai *Windows Service* agar otomatis menyala saat VPS *reboot*.

---

## 2. TECH STACK YANG DIGUNAKAN
- **Frontend & Fullstack Framework:** Next.js (App Router) + TypeScript (atau React Vite + Node.js/Express TypeScript).
- **Styling:** Tailwind CSS (konfigurasi khusus untuk *Glassmorphism* dan *Grid 12 Columns*).
- **Font Utama:** `Inter` (bobot: 300, 400, 500, 600, 700).
- **Icons:** `lucide-react` (`layout-dashboard`, `bar-chart-2`, `trending-up`, `users`, `calendar`, `filter`, dll.).
- **Animasi & 3D Interaksi:** `framer-motion` (untuk *staggered entry animation* 50ms dan *subtle 3D hover tilt* pada KPI Cards).
- **Visualisasi Grafik:** Custom SVG & `recharts` / `visx` (mendukung `vector-effect="non-scaling-stroke"`, gradien transparan, dan `aria-label` aksesibilitas).
- **Peta Geospasial:** `react-leaflet` (OpenStreetMap) + `supercluster` / WebGL clustering (agar kuat merender puluhan ribu hingga jutaan titik koordinat `lat`/`long`).
- **Data Grid / Tabel:** `@tanstack/react-table` + `@tanstack/react-virtual` (wajib menggunakan *virtualization* untuk mendukung ratusan ribu/jutaan baris dengan *sticky header*).
- **Database Driver:** `mssql` (Node.js driver untuk Microsoft SQL Server dengan *Connection Pooling* & `mssql.Table` Bulk Insert).
- **Excel & GSheets Parser:** `xlsx` / `exceljs` (untuk *seeding* awal dari `Book1.xlsx`) dan `googleapis` (Google Sheets API v4 menggunakan *Service Account*).
- **Scheduler & Auth:** `node-cron` (jadwal per jam `0 * * * *`), `jose` / `jsonwebtoken` (JWT di dalam `HttpOnly` Cookie), dan `bcryptjs` / `argon2`.

---

## 3. KONFIGURASI ENVIRONMENT (`.env.example`)
AI harus selalu membaca variabel koneksi dari file `.env` (jangan pernah melakukan *hardcode* kredensial). Buat file `.env.example` dengan struktur berikut agar pengguna dapat mengisi sendiri kredensial MS SQL dan Google Sheets-nya:

```env
# ==========================================
# 1. MICROSOFT SQL SERVER CONFIGURATION
# (Diisi oleh Developer sesuai kredensial Server Database)
# ==========================================
MSSQL_HOST=192.168.x.x_atau_domain_server
MSSQL_PORT=1433
MSSQL_USER=isi_username_mssql_disini
MSSQL_PASSWORD=isi_password_mssql_disini
MSSQL_DATABASE=TelecomProductivityDB
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
MSSQL_POOL_MAX=20
MSSQL_POOL_MIN=2

# ==========================================
# 2. GOOGLE SHEETS API CONFIGURATION
# ==========================================
GSHEET_SPREADSHEET_ID=isi_id_spreadsheet_disini
GSHEET_SHEET_NAME=National
GSHEET_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GSHEET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GSHEET_CHUNK_SIZE=50000

# ==========================================
# 3. EXCEL INITIAL SEED CONFIGURATION
# ==========================================
EXCEL_SEED_FILE_PATH=./Book1.xlsx
EXCEL_SEED_SHEET_NAME=National

# ==========================================
# 4. APP & AUTH CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV=production
JWT_SECRET=isi_secret_key_panjang_dan_acak
CRON_SCHEDULE=0 * * * *
```

---

## 4. STRUKTUR DATA (`Book1.xlsx` & GSheets `"National"`) DAN SKEMA MS SQL
Data sumber memiliki **26 kolom** (Kolom A sampai Z).

### Daftar 26 Kolom Asli:
1. `PMO Uniq` (String - Contoh: `'25XLB02B0488'`)
2. `DU ID` (String - Contoh: `'Swap-18-0432'`, `'XLB-25-2828'`) -> **Kunci Utama Operasional**
3. `Site ID` (String - Contoh: `'4553121E'`)
4. `Site Name` (String - Contoh: `'Cakru_Timur'`)
5. `Region` (String - Contoh: `'East'`)
6. `Area` (String - Contoh: `'East Java'`, `'Central Java'`, `'West Java'`, `'Jabodetabek'`, `'Kalimantan'`, `'Sulawesi'`, `'Sumatera Selatan'`, `'Sumatera Utara'`, `'Bali Nusra'`)
7. `Kabupaten` (String - Contoh: `'Jember'`, `'Bangkalan'`)
8. `lat` (Float/Decimal - Contoh: `-8.28895`)
9. `long` (Float/Decimal - Contoh: `113.38953`)
10. `Program` (String - Contoh: `'NRO-RAN'`, `'Swap'`)
11. `PO Release` (Date / Nullable - Perhatian: di Excel ada nilai `'#VALUE!'` atau serial angka rusak yang harus diubah jadi `NULL`)
12. `SOW` (String - Contoh: `'L900'`, `'1800'`)
13. `Vendor` (String - Contoh: `'ZTE'`, `'HWI'`)
14. `Team Category` (String - Contoh: `'Internal'`, `'Subcon'`)
15. `PIC RF` (String - Contoh: `'Suherman'`)
16. `Assign Date` (Date / Nullable)
17. `OA Date` (Date / Nullable - Tanggal *On Air*)
18. `DT Date` (Date / Nullable - Tanggal *Drive Test*)
19. `Audit Date` (Date / Nullable)
20. `Report Submit Date` (Date / Nullable)
21. `Acc Date` (Date / Nullable - Tanggal *Accepted*)
22. `Status OA` (String - Contoh: `'On Air'`, `'Not Yet OA'`)
23. `Status DT` (String - Contoh: `'Done'`, `'NY DT'`)
24. `Milestone NW` (String - Contoh: `'1. NY OA'`, `'2. DT/Audit On-Going'`, `'3. Waiting Report'`, `'4. Waiting Review'`, `'5. Rejected'`, `'6.1 Regional Accepted'`, `'6.2 SAPLO Accepted'`)
25. `Final Status` (String - Contoh: `'Acc'`, `'Not Yet Acc'`, `'Reject'`)
26. `Remark` (String / Nullable - Catatan detail atau alasan penolakan/kendala)

### Standar Data Cleansing (WAJIB dijalankan saat Import Excel & Sync GSheets):
- **Penanganan Duplikasi Primary Key:** Pada data asli `Book1.xlsx` (10.236 baris), terdapat ~160 baris di mana `DU ID` berulang dengan `PMO Uniq` berbeda. Gunakan `Record_ID` (gabungan `DU_ID` + `|'` + `PMO_Uniq` atau `DU_ID` yang telah di-deduplikasi ambil baris paling bawah/terbaru) sebagai `PRIMARY KEY`, dan pasang *Non-Clustered Index* pada `DU_ID`, `Site_ID`, `Area`, `Kabupaten`, `Final_Status`, dan `Milestone_NW`.
- **Sanitasi Nilai Error Excel:** Semua teks yang bernilai `'#N/A'`, `'#VALUE!'`, `'#REF!'`, `'#DIV/0!'`, `'-'`, atau string kosong `''` harus dikonversi menjadi `NULL` (atau `'Unknown'` untuk kolom dimensi seperti `Area`).
- **Normalisasi Teks Wilayah:** Lakukan *Title Case / Trim* pada kolom `Area` dan `Kabupaten` (contoh: `'East java'` dan `'East Java'` harus disatukan menjadi `'East Java'`).
- **Validasi Tanggal & Penanganan Khusus '0-Jan-00' (Milestone Belum Tercapai):** 
  - Nilai `'0-Jan-00'` atau serial number `0` pada setiap kolom tanggal (misalnya `M06 Date`, `Connected Date` / `OA Date`, `DT Date`, `Audit Date`, `QC Accepted`, `QC RF Date` / `Acc Date`) **menandakan bahwa assignment site tersebut BELUM melewati/menyelesaikan tahapan tersebut** (misalnya `Connected Date` = `'0-Jan-00'` artinya site **belum Connected / belum On Air**; `DT Date` = `'0-Jan-00'` artinya **belum Drive Test**; `QC RF Date` = `'0-Jan-00'` artinya **belum Accepted**).
  - Pada database MS SQL, semua nilai `'0-Jan-00'`, serial `0`, atau format tanggal cacat/tidak wajar (misal serial PO yang salah masuk atau tahun > 2100) **wajib diubah menjadi `NULL`** (kolom bertipe `DATE`).
  - Kondisi `IS NULL` (belum tercapai / Not Yet) vs `IS NOT NULL` (sudah selesai / Done) pada masing-masing kolom tanggal ini dijadikan dasar utama kalkulasi konversi Funnel Pipeline, rasio On Air, metrik KPI, dan filter status operasional.
- **Validasi Koordinat:** Koordinat `lat` harus berada di rentang `-90` s/d `90` dan `long` di `-180` s/d `180`.

### Skema Tabel MS SQL Server:
1. **`Assignments` (Tabel Utama):**
   - Menyimpan 26 kolom di atas dengan tipe data yang presisi (`NVARCHAR`, `DECIMAL(10,6)`, `DATE`).
   - Kolom Metadata Tambahan Wajib:
     - `RowHash CHAR(64) NOT NULL` (Hash SHA-256 dari gabungan 26 kolom untuk deteksi perubahan).
     - `CreatedAt DATETIME2 DEFAULT SYSDATETIME()`.
     - `UpdatedAt DATETIME2 DEFAULT SYSDATETIME()`.
2. **`Users` (Tabel Autentikasi):**
   - `Id INT IDENTITY(1,1) PRIMARY KEY`, `Username NVARCHAR(100) UNIQUE`, `PasswordHash NVARCHAR(255)`, `FullName NVARCHAR(150)`, `Role NVARCHAR(50)` (`'Admin'`, `'Management'`, `'PIC_RF'`, `'Viewer'`), `IsActive BIT`, `CreatedAt DATETIME2`.
3. **`SyncLogs` (Tabel Audit Sinkronisasi Per Jam):**
   - `Id INT IDENTITY(1,1) PRIMARY KEY`, `SyncSource NVARCHAR(50)` (`'EXCEL_SEED'` atau `'GSHEET_CRON'`), `StartTime DATETIME2`, `EndTime DATETIME2`, `TotalRowsRead INT`, `InsertedCount INT`, `UpdatedCount INT`, `UnchangedCount INT`, `GlobalSheetHash CHAR(64)`, `Status NVARCHAR(50)` (`'SUCCESS'`, `'NO_CHANGES'`, `'FAILED'`), `ErrorMessage NVARCHAR(MAX)`.

---

## 5. SKENARIO 1: FITUR IMPORT AWAL DARI EXCEL KE MS SQL (`seed-from-excel`)
AI harus menyediakan script CLI (`npm run seed:excel`) dan/atau endpoint khusus Admin untuk memasukkan data dari `Book1.xlsx` ke MS SQL Server:
1. Membaca file `Book1.xlsx` menggunakan streaming/buffer parser.
2. Membersihkan data sesuai aturan **Data Cleansing** di Bagian 4.
3. Menghitung `RowHash` SHA-256 untuk setiap baris:
   $$\text{RowHash} = \text{SHA256}(\text{Col}_1 \mathbin{\Vert} \text{'|'} \mathbin{\Vert} \text{Col}_2 \mathbin{\Vert} \dots \mathbin{\Vert} \text{Col}_{26})$$
4. Menggunakan fitur **`mssql.Table` (Bulk Insert)** ke tabel *staging* sementara `#StagingAssignments` dalam *batch* (misal per 5.000 baris), lalu menjalankan perintah `MERGE INTO Assignments` agar 10.236+ baris masuk ke MS SQL hanya dalam waktu 1-2 detik.
5. Mencatat hasilnya ke tabel `SyncLogs` dengan source `'EXCEL_SEED'`.

---

## 6. SKENARIO 2: ALGORITMA SINKRONISASI GSHEETS KE MS SQL PER JAM (SKALA JUTAAN DATA)
Worker berjalan otomatis setiap jam mulai pukul `00:00` (`0 * * * *`) mengambil data dari sheet **`"National"`** dan menangani **3 Kasus Utama** secara ekstrem cepat (mampu menangani ratusan ribu hingga jutaan *assignment*):

### Tahap 1: Penarikan Aman Tanpa Terkena Limit API GSheets
- Menggunakan Google Sheets API v4 (`spreadsheets.values.get`) dengan *chunked pagination* (misal menarik per 50.000 baris jika sheet sangat besar) dari lembaran `"National"`.
- Karena hanya berjalan 1x per jam (24 request/hari), penggunaan kuota berada di bawah 0,01% batas Google (300 req/menit). Tambahkan *exponential backoff retry* jika terjadi gangguan jaringan sementara.

### Tahap 2: Deteksi 3 Kasus Perubahan Data (Algoritma SHA-256 Diffing)
Untuk setiap baris yang ditarik dari GSheets, lakukan *Data Cleansing* lalu hitung `RowHash` (SHA-256 dari 26 kolom). Hitung pula `GlobalSheetHash` (SHA-256 dari gabungan seluruh `RowHash`).

- **KASUS 3 — Tidak Ada Update Sama Sekali (Zero Update / No-Op):**
  - Bandingkan `GlobalSheetHash` saat ini dengan `GlobalSheetHash` terakhir di `SyncLogs`.
  - Jika **SAMA PERSIS**, hentikan proses saat itu juga! Catat log `'NO_CHANGES'`. Beban tulis ke MS SQL = **0 query**.
- **Jika `GlobalSheetHash` Berbeda, Tarik Peta Hash dari MS SQL:**
  - Lakukan 1 kali query ringan: `SELECT PrimaryKey, RowHash FROM Assignments`.
  - Simpan ke dalam struktur `Map<string, string>` di memori Node.js (`dbHashMap`).
- **KASUS 2 — Ada Baris Baru (Contoh: Baris ke-10.001 dst.):**
  - Jika `PrimaryKey` pada baris GSheets **TIDAK DITEMUKAN** di `dbHashMap`, masukkan baris tersebut ke array `toInsert[]`.
- **KASUS 1 — Ada Update Nilai Kolom pada Baris Lama (Contoh: Baris di antara 1 - 10.000 berubah status/tanggalnya):**
  - Jika `PrimaryKey` **DITEMUKAN** di `dbHashMap`, bandingkan `RowHash` GSheets dengan `RowHash` di `dbHashMap`.
  - Jika **BERBEDA** (artinya minimal ada 1 sel dari 26 kolom yang berubah nilainya), masukkan baris tersebut ke array `toUpdate[]`.
  - Jika **SAMA**, abaikan baris tersebut (`unchangedCount++`).

### Tahap 3: Eksekusi Bulk Write ke MS SQL
- Jangan pernah melakukan *looping* query `UPDATE` satu per satu!
- Masukkan seluruh isi `toInsert[]` dan `toUpdate[]` ke dalam `mssql.Table` (`#StagingDelta`), lakukan `bulk()` ke MS SQL, lalu jalankan 1 transaksi `UPDATE ... FROM Assignments INNER JOIN #StagingDelta` dan `INSERT INTO Assignments SELECT ... FROM #StagingDelta`.
- Dengan metode ini, meskipun ada **1.000.000 baris**, jika hanya 5 baris yang kolomnya di-update dan 2 baris baru, MS SQL hanya memproses **7 baris** tersebut dalam waktu < 50ms.

---

## 7. SPESIFIKASI DESAIN UI/UX (WAJIB SESUAI `design.md`)
1. **Gaya Global & Glassmorphism:**
   - Warna latar belakang utama halaman: `#f5f5f7` (abu-abu terang yang nyaman di mata).
   - Setiap kartu/panel widget menggunakan efek *Glassmorphism*: `background: rgba(255, 255, 255, 0.7)`, `backdrop-filter: blur(12px)`, border tipis semi-transparan (`border-white/50`), dan *soft drop shadow*.
   - *Scrollbar* pada area konten utama diminimalkan, dan *scrollbar* pada panel sekunder/tabel disembunyikan (`scrollbar-none` / custom tipis).
2. **Struktur Tata Letak (Grid System):**
   - **Sidebar Navigasi (Kiri - Fixed `z-40`):** Latar putih solid, memuat menu utama (Dashboard, Analitik, Peta Geospasial, Data Tabel, Status Sync GSheets, Pengaturan/Users). Menyusut menjadi ikon saja (*collapsed*) pada layar kecil.
   - **Header / Topbar (Atas - Sticky `z-30`):** Memuat judul halaman, **Global Filter** (Rentang Waktu, Area, Region, Vendor, Program), indikator status sinkronisasi terakhir, dan profil user yang sedang login. Memiliki efek `backdrop-blur` saat halaman di-scroll.
   - **Area Konten Utama (Grid 12 Kolom):** Responsif penuh (1 kolom di mobile, 2-3 kolom di tablet, 12 kolom di desktop).
3. **Aturan Animasi, Kinerja & Aksesibilitas:**
   - **Entry Animation (Staggered Load):** Kartu muncul berurutan dari atas ke bawah dengan transisi *fade-in* & *slide-up* halus, jeda (*delay*) `50ms` per kartu.
   - **Subtle 3D Hover (Parallax Tilt):** HANYA diterapkan pada **KPI Summary Cards** (gunakan `perspective: 1000px`, `transform-style: preserve-3d`, kemiringan halus maksimal `2-3 derajat` pada `rotateX` dan `rotateY` mengikuti kursor). Dilarang memasang efek 3D ini pada widget besar agar *rendering* tetap ringan.
   - **Interactive Tooltips & Filter Transition:** Garis vertikal penunjuk (*crosshair*) pada grafik mengikuti mouse. Perubahan filter global memicu animasi pergerakan *path* SVG / tinggi *bar*, **bukan** *reload* halaman.
   - **Aksesibilitas:** Setiap elemen grafik SVG wajib memiliki atribut `aria-label` yang mendeskripsikan tren/nilai. Rasio kontras warna grafik (hijau emerald, biru, ungu) minimal **4.5:1** terhadap latar putih transparan. Gunakan `will-change: transform, opacity` pada elemen animasi hover.

---

## 8. SPESIFIKASI 7 WIDGET VISUALISASI DATA (WAJIB SESUAI `list.md`)
Susun widget di dalam Grid 12 Kolom dengan komponen berikut:

1. **KPI Scorecards / Summary Cards (Baris Atas - 4 s/d 5 Kartu Sejajar):**
   - Menampilkan metrik tingkat tinggi dari perhitungan dinamis `DU ID`:
     1. **Total Assignment**
     2. **Site On Air** (beserta rasio vs *Not Yet On Air*)
     3. **Menunggu Drive Test & Audit** (*DT/Audit On-Going*)
     4. **Total Accepted** (*Final Status = Acc*)
     5. **Total Rejected** (*Final Status = Reject*)
   - Dilengkapi indikator tren (panah hijau/merah) dan *sparkline* SVG kecil di latar belakang kartu.
2. **Main Visualization — Line Chart: Tren Penyelesaian / Velocity Trend (Tengah Kiri - Span 8 Kolom):**
   - Menggunakan custom SVG dengan `vector-effect="non-scaling-stroke"` dan area gradien memudar di bawah garis.
   - Membandingkan deret waktu (harian/mingguan/bulanan) antara jumlah *Assignment Masuk* (`Assign Date`), *Site On Air* (`OA Date`), hingga *Assignment Selesai/Accepted* (`Acc Date`).
3. **Secondary Chart — Donut Chart: Rasio Status Akhir / Approval Rate (Tengah Kanan - Span 4 Kolom):**
   - Menampilkan proporsi `Final Status` (`Acc`, `Not Yet Acc`, `Reject`).
   - Persentase **Approval/Acc Rate** diletakkan besar di tengah lingkaran.
   - *Hover* pada potongan (*slice*) **Reject** akan menampilkan ringkasan top alasan penolakan dari kolom `Remark`.
4. **Funnel Chart (Grafik Corong): Pipeline Alur Kerja (Baris Tengah Kedua - Span 5 Kolom):**
   - Memvisualisasikan konversi & *bottleneck* jumlah `DU ID` secara berurutan:
     `Total Assignment -> On Air -> Drive Test -> Audit -> Report Submit -> Final Accepted`.
   - Menampilkan persentase *conversion rate* antar tahap.
5. **Stacked Bar Chart: Distribusi Status per Area / Kabupaten (Baris Tengah Kedua - Span 7 Kolom):**
   - Sumbu X: `Area` (bisa di-*drill-down* ke `Kabupaten`), Sumbu Y: akumulasi jumlah `DU ID`.
   - Batang ditumpuk (*stacked*) berdasarkan kategori status (`Not Yet OA`, `DT/Audit In Progress`, `Accepted`, `Rejected`) untuk mengidentifikasi wilayah dengan *backlog* tertinggi.
6. **Peta Persebaran Geospasial / Interactive Map (Baris Bawah Atas - Span 12 Kolom):**
   - Memanfaatkan kolom `lat`, `long`, `Site ID`, `Site Name`, `DU ID`, dan statusnya.
   - Titik koordinat diberi kode warna: **Merah** (*Not Yet On Air* / *Rejected*), **Kuning** (*DT/Audit/Report In Progress*), **Hijau** (*Accepted/Done*).
   - Wajib menggunakan *marker clustering* agar ribuan titik koordinat tidak membuat browser lambat.
7. **Interactive Data Grid / Tabel Dinamis (Baris Paling Bawah - Span 12 Kolom):**
   - Tabel dengan *sticky header* di dalam wadah ber-overflow tersembunyi.
   - Menampilkan `DU ID`, `PMO Uniq`, `Site ID`, `Site Name`, `Area`, `Kabupaten`, `Vendor`, `PIC RF`, tanggal tahapan (`Assign`, `OA`, `DT`, `Audit`, `Acc`), `Milestone NW`, `Final Status`, dan `Remark`.
   - Mendukung pencarian global cepat (`DU ID` / `Site ID`), *sorting* kolom, filter multi-kolom berjenjang, dan *pagination / virtual scrolling* dari MS SQL Server.

---

## 9. KONFIGURASI DEPLOYMENT VPS WINDOWS & PM2 (`ecosystem.config.js`)
Buatkan file `ecosystem.config.js` di root proyek agar siap dijalankan di VPS Windows menggunakan PM2:
- **App 1 (`productivity-web`):** Menjalankan server web produksi (Next.js / Express) pada port yang ditentukan di `.env`.
- **App 2 (`productivity-sync-worker`):** Menjalankan proses *background cronjob* penarikan GSheets `"National"` ke MS SQL setiap jam (`00:00`, `01:00`, dst.) secara terpisah agar beban komputasi *hashing* jutaan data tidak pernah mengganggu kelancaran website saat diakses pengguna.
- Sertakan dokumentasi singkat di `README.md` cara menjalankan `npm run db:migrate`, `npm run seed:excel`, serta cara mendaftarkan PM2 agar *auto-start* di Windows Server menggunakan `pm2-windows-service` atau *Windows Task Scheduler*.