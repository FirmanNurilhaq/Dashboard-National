# DOKUMEN SPESIFIKASI & DAFTAR FITUR VISUALISASI TERBARU (LIST.MD)
# PROYEK: TELKOMSEL NW RF NATIONAL TRACKER & ISDP PRODUCTIVITY DASHBOARD

> **Single Source of Truth Update:**
> Dokumen ini memuat arsitektur database baru berbasis **Telkomsel NW RF National Tracker** dengan integrasi dua sheet utama: lembaran **`"Telkomsel NW RF National Tracke"`** (Tracking Operasional RF) dan **`"Data ISDP"`** (Status Sistem Verifikasi & Approval ISDP). Seluruh visualisasi, metrik KPI, skema basis data, dan modul backend Next.js disesuaikan mengikuti blueprint di bawah ini.

---

## 1. RESTRUKTURISASI SUMBER BASIS DATA (MULTI-SHEET INTEGRATION)

Perubahan mendasar beralih dari satu lembar tabel statis ke sistem data terintegrasi multi-dimensi:

```
+---------------------------------------------+       +------------------------------------+
|  Sheet: "Telkomsel NW RF National Tracke"   |       |        Sheet: "Data ISDP"          |
|  (Master Operasional Lapangan & RF)         |       |  (Sistem Verifikasi & Approval)    |
+---------------------------------------------+       +------------------------------------+
| - DU ID (Kunci Utama Operasional)           |<----->| - DU ID / Site ID (Kunci Relasi)   |
| - PMO Uniq / PO Release                     | (JOIN)| - ISDP Status (Submitted/Approved) |
| - Site ID & Site Name                       |       | - ISDP Submit Date                 |
| - Area & Kabupaten                          |       | - ISDP Approve Date                |
| - Koordinat (Latitude, Longitude)           |       | - Plan PACR / Actual PACR          |
| - Tanggal: Assign, OA, DT, Audit, Acc       |       | - PIC Verifier / Reviewer          |
| - Milestone NW, Status OA, Status DT        |       | - Remark ISDP / Rejection Reason   |
+---------------------------------------------+       +------------------------------------+
                                      \               /
                                       v             v
                    +-------------------------------------------------+
                    |     Combined Cleaned Data Model (Assignments)    |
                    |      Disimpan di MS SQL / JSON Cache Lokal      |
                    +-------------------------------------------------+
```

### 1.1 Kunci Relasi & Strategi Deduplikasi
- **Primary Key:** `Record_ID = CONCAT(DU_ID, '|', ISNULL(PMO_Uniq, 'NA'))`.
- **Foreign Key / Join Logic:** Baris pada sheet `"Telkomsel NW RF National Tracke"` di-lookup secara real-time ke sheet `"Data ISDP"` menggunakan `DU_ID` (dan fallback pencocokan sekunder menggunakan `Site_ID` jika `DU_ID` di ISDP memiliki variasi penamaan).
- **Aturan Konflik Data:** Jika terdapat selisih tanggal atau status antara kedua sheet, sheet `"Data ISDP"` bertindak sebagai penentu validitas status approval formal (*Source of Truth for Final Approval*), sedangkan sheet `"Telkomsel NW RF National Tracke"` bertindak sebagai penentu riwayat progres fisik lapangan (*Source of Truth for Field Progress*).

---

## 2. MATRIKS KOLOM GABUNGAN BARU (DATABASE SCHEMA MAPPING)

| No | Kolom Gabungan | Sumber Sheet | Tipe Data SQL | Keterangan & Aturan Transformasi |
|:---|:---|:---|:---|:---|
| 1 | `Record_ID` | Computed | `NVARCHAR(205)` | **PRIMARY KEY**: `DU_ID \| PMO_Uniq` |
| 2 | `DU_ID` | Telkomsel Tracke & ISDP | `NVARCHAR(100)` | Kunci Operasional Utama, Trim whitespace |
| 3 | `PMO_Uniq` | Telkomsel Tracke | `NVARCHAR(100)` | ID unik PMO Telkomsel |
| 4 | `Site_ID` | Telkomsel Tracke & ISDP | `NVARCHAR(50)` | ID Site Menara BTS (Indexed) |
| 5 | `Site_Name` | Telkomsel Tracke | `NVARCHAR(255)` | Nama lokasi Site |
| 6 | `Program_ID` | Telkomsel Tracke | `NVARCHAR(255)` | Program (Capacity, Swap, New Site, Rollout) |
| 7 | `Area` | Telkomsel Tracke | `NVARCHAR(100)` | Normalisasi Title Case (`JABO`, `Central Java`, dll.) |
| 8 | `Kabupaten` | Telkomsel Tracke | `NVARCHAR(150)` | Nama kota/kabupaten administratif |
| 9 | `Latitude` | Telkomsel Tracke | `DECIMAL(10,7)` | Validasi rentang `-90` s/d `90` |
| 10 | `Longitude` | Telkomsel Tracke | `DECIMAL(11,7)` | Validasi rentang `-180` s/d `180` |
| 11 | `PO_Release` | Telkomsel Tracke | `NVARCHAR(100)` | Nomor PO, sanitasi `#VALUE!` menjadi `NULL` |
| 12 | `Status_PO` | Telkomsel Tracke | `NVARCHAR(50)` | Status PO (`PO Release`, `Unreleased`) |
| 13 | `Assign_Date` | Telkomsel Tracke | `DATE` | Tanggal penugasan awal, `0-Jan-00` -> `NULL` |
| 14 | `OA_Date` | Telkomsel Tracke | `DATE` | Tanggal On Air (Koneksi aktif ke jaringan) |
| 15 | `DT_Date` | Telkomsel Tracke | `DATE` | Tanggal pelaksanaan Drive Test |
| 16 | `Audit_Date` | Telkomsel Tracke | `DATE` | Tanggal verifikasi teknis/audit parameter |
| 17 | `Report_Submit_Date` | Telkomsel Tracke | `DATE` | Tanggal penyerahan laporan dokumen teknis |
| 18 | `QC_RF_Date` | Telkomsel Tracke | `DATE` | Tanggal Acceptance internal tim RF |
| 19 | `ISDP_Submit_Date` | **Data ISDP** | `DATE` | Tanggal submisi dokumen ke sistem ISDP |
| 20 | `ISDP_Approve_Date` | **Data ISDP** | `DATE` | Tanggal approval resmi dari reviewer ISDP |
| 21 | `ISDP_Status` | **Data ISDP** | `NVARCHAR(100)` | Status verifikasi ISDP (`Approved`, `Submitted`, `Rejected`) |
| 22 | `Milestone_NW` | Telkomsel Tracke | `NVARCHAR(100)` | Tahapan milestone operasional (`1. NY OA` s/d `6.2 Accepted`) |
| 23 | `Final_Status` | Telkomsel & ISDP | `NVARCHAR(50)` | `Acc`, `Not Yet Acc`, `Reject` (Sinkron dengan ISDP) |
| 24 | `Remark_RF` | Telkomsel Tracke | `NVARCHAR(MAX)` | Catatan teknis operasional lapangan |
| 25 | `Remark_ISDP` | **Data ISDP** | `NVARCHAR(MAX)` | Alasan penolakan / revisi dari sistem ISDP |
| 26 | `RowHash` | Computed | `CHAR(64)` | SHA-256 Hash gabungan seluruh kolom untuk Delta Sync |

---

## 3. SPESIFIKASI 7 WIDGET VISUALISASI DATA TERBARU

Tujuh komponen visualisasi data disusun di dalam tata letak Grid 12 Kolom dengan sistem desain *Glassmorphism* (`backdrop-filter: blur(12px)`, background `rgba(255, 255, 255, 0.7)`), tipografi `Inter`, dan ikon garis presisi `@tabler/icons-react`:

### Widget 1: KPI Summary Scorecards (Top-Level Metrics)
- **Tujuan:** Memberikan gambaran performa makro nasional secara instan bagi jajaran pimpinan dan manajemen sebelum memeriksa rincian teknis.
- **Implementasi Visual:** 5 kartu metrik dengan efek *Subtle 3D Hover Tilt* (2-3°), animasi staggered entry load 50ms, dan *sparkline* tren SVG.
- **Daftar Kartu Metrik:**
  1. **Total Assignment:** Jumlah seluruh `DU ID` unik yang masuk dalam scope penugasan.
  2. **Site On Air:** Akumulasi site dengan `OA_Date` terisi valid beserta persentase terhadap total penugasan.
  3. **Milestone On-Going:** Site yang sedang dalam tahap Drive Test, Audit, atau Report Submit (`DT/Audit In Progress`).
  4. **ISDP Approved (Acc):** Total site yang telah mengantongi persetujuan final di sistem ISDP (`Final Status = Acc`).
  5. **Rejected / Revision:** Total penugasan yang ditolak atau membutuhkan revisi dokumen/RF (`Final Status = Reject`).

### Widget 2: Line Chart Velocity Trend (Tren Kecepatan Penyelesaian)
- **Tujuan:** Mengukur ritme kecepatan eksekusi tim dari minggu ke minggu dan mendeteksi tren keterlambatan pekerjaan.
- **Dimensi Data:** Sumbu X (Deret Waktu Mingguan/Bulanan), Sumbu Y (Jumlah Unit Site).
- **Kurva Multi-Series:**
  - Garis Biru: *Incoming Assignment* (`Assign_Date`).
  - Garis Ungu: *Site On Air* (`OA_Date`).
  - Garis Oranye: *ISDP Submission* (`ISDP_Submit_Date`).
  - Garis Hijau Emerald: *Final ISDP Accepted* (`ISDP_Approve_Date` / `QC_RF_Date`).
- **Fitur Interaktif:** Tooltip vertikal (*crosshair*) mengikuti kursor kursor dengan gradien area memudar (*fading gradient*) di bawah garis kurva.

### Widget 3: Donut Chart Approval Rate & ISDP Review Status
- **Tujuan:** Menampilkan rasio persetujuan kualitas dokumen dan performa kelulusan review di sistem ISDP.
- **Visualisasi Sentral:** Angka persentase kelulusan (*Approval Rate*) berukuran besar di pusat lingkaran (misal: `88.4% Acc`).
- **Segmen Lingkaran:**
  - Hijau: `Accepted / Approved`
  - Kuning/Biru: `In Review / Submitted to ISDP`
  - Merah: `Rejected / Need Revision`
- **Interaksi Drilldown:** Saat kursor melakukan hover pada irisan *Reject*, muncul panel popover yang menampilkan **Top 5 Alasan Penolakan** (berdasarkan kompilasi kolom `Remark_ISDP` dan `Remark_RF`).

### Widget 4: Funnel Pipeline Chart (Corong Konversi 6 Tahap)
- **Tujuan:** Memetakan alur konversi berjenjang dan mendeteksi di tahap mana hambatan (*bottleneck*) operasional terbesar terjadi.
- **Tahapan Corong Berurutan:**
  $$\text{Assignment} \xrightarrow{\quad} \text{On Air} \xrightarrow{\quad} \text{Drive Test} \xrightarrow{\quad} \text{Audit Parameter} \xrightarrow{\quad} \text{ISDP Submit} \xrightarrow{\quad} \text{Final Accepted}$$
- **Metrik Tambahan:** Menampilkan rasio konversi antar-tahap (*drop rate*) dan durasi rata-rata hari yang dihabiskan site pada setiap milestone.

### Widget 5: Stacked Bar Chart Distribusi Beban per Area
- **Tujuan:** Membandingkan kapasitas beban kerja (*workload*) dan progres penyelesaian antar wilayah regional operasional Telkomsel.
- **Dimensi Data:** Sumbu X (Area: `JABO`, `West Java`, `Central Java`, `East Java`, `Bali Nusra`, `South Sumatera`, dll.), Sumbu Y (Total DU ID).
- **Tumpukan Status (Stacked):**
  - Lapisan Abu-abu: *Not Yet OA*
  - Lapisan Kuning: *DT/Audit In Progress*
  - Lapisan Biru: *Waiting ISDP Approval*
  - Lapisan Hijau: *Completed / Accepted*
- **Interaksi:** Klik pada salah satu batang wilayah Area untuk melakukan *drill-down* ke visualisasi tingkat **Kabupaten**.

### Widget 6: Peta Geospasial Interaktif 3D (Interactive Geospatial Map)
- **Tujuan:** Menampilkan visualisasi lokasi menara BTS fisik secara geospasial di seluruh Indonesia dengan penanda menara telekomunikasi dan gedung 3D.
- **Teknologi:** MapLibre GL + OpenFreeMap (Zero API Key) + WebGL Clustering.
- **Kode Warna Pin Penanda:**
  - **Hijau:** Site *Accepted / ISDP Approved*.
  - **Kuning:** Site *In Progress* (sedang Drive Test / Audit / menunggu ISDP).
  - **Merah:** Site *Not Yet On Air* atau *Rejected*.
- **Fitur Popup:** Klik pada pin site menampilkan kartu informasi detail: `Site ID`, `Site Name`, `Area`, `Vendor`, `Milestone Saat Ini`, dan `Status ISDP`.

### Widget 7: Interactive Virtualized Data Grid (Tabel Dinamis Multi-Kolom)
- **Tujuan:** Eksplorasi data tingkat baris secara mendalam dengan performa render instan untuk ratusan ribu data.
- **Teknologi:** `@tanstack/react-table` + `@tanstack/react-virtual` dengan *sticky header*.
- **Fitur Tabel:**
  - Pencarian pintar multi-kategori dengan saran autocomplete kata kunci (`DU ID`, `Site ID`, `PIC RF`).
  - Filter multi-kolom berjenjang: Rentang Tanggal, Area, Vendor, Milestone NW, dan Status ISDP.
  - Pagination bebas loncat (*anti-jump pagination*) dengan opsi ukuran halaman (25, 50, 100 baris).
  - Ekspor data hasil filter ke format **CSV** dan **Excel**.

---

## 4. RENCANA PERUBAHAN TEKNIS IMPLEMENTASI

1. **Parser & Seeding (`src/scripts/parse-local-data.ts` & `seed-from-excel.ts`):**
   - Membaca sheet `"Telkomsel NW RF National Tracke"` sebagai master array.
   - Membaca sheet `"Data ISDP"` dan membuat lookup map berbasis `DU ID` (`Map<string, ISDPData>`).
   - Melakukan merge kolom ISDP ke dalam setiap record penugasan.
2. **Definisi Tipe TypeScript (`src/types/assignment.ts`):**
   - Menambahkan field `isdpSubmitDate`, `isdpApproveDate`, `remarkIsdp`, `remarkRf`, dan normalisasi penamaan kolom.
3. **Penyelarasan API Endpoints (`src/app/api/dashboard/*`):**
   - Menyesuaikan endpoint agregasi KPI, Funnel, Approval Rate, dan Workload agar membaca status gabungan ISDP.
4. **Sinkronisasi Otomatis Google Sheets (`src/workers/gsheet-sync-worker.ts`):**
   - Mendukung penarikan dua sheet sekaligus secara batch dan penggabungan delta sync sebelum commit ke basis data.