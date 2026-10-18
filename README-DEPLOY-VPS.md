# PANDUAN DEPLOYMENT VPS MENGGUNAKAN GITHUB & PORT 7210
## Proyek: NEXWAVE Telkomsel NW RF National Productivity Dashboard

Dokumen ini memandu Anda menyelesaikan masalah `start.bat` yang tertutup tiba-tiba, serta menyajikan tutorial langkah-demi-langkah melakukan deployment menggunakan **Git Pull / Git Clone** langsung di VPS Windows Anda pada **Port 7210**.

---

### 1. KENAPA `start.bat` LANGSUNG MATI SAAT DIBUKA?

Ada 3 penyebab utama mengapa file `.bat` langsung tertutup ketika di-double-click di Windows VPS:
1. **Node.js Belum Terpasang (Penyebab Paling Sering):**
   Windows Server baru biasanya belum memiliki Node.js. Saat script mengeksekusi perintah `node` atau `npm`, Windows mengalami error dan langsung menutup jendela konsol seketika dalam hitungan milidetik.
2. **File Terblokir oleh Sistem Keamanan Windows (Zone.Identifier):**
   File yang diunduh dari internet / diekstrak dari ZIP seringkali otomatis diberi status *Blocked* oleh Windows Security.
3. **Double-Click vs Command Prompt:**
   Jika Anda men-double-click file `.bat`, Windows akan membuat jendela baru dan langsung menghancurkannya saat script selesai atau error. **Cara paling tepat adalah membuka Command Prompt (CMD) terlebih dahulu, lalu menjalankan `start.bat` dari dalam CMD agar log tetap terbaca.**

---

### 2. PRASYARAT WAJIB DI VPS WINDOWS

Sebelum menjalankan aplikasi, pastikan Anda telah memasang 2 aplikasi gratis berikut di VPS Windows Anda:

1. **Pasang Node.js LTS (Versi 18 atau 20):**
   - Buka browser di VPS, kunjungi: [https://nodejs.org/en/download](https://nodejs.org/en/download)
   - Unduh **Windows Installer (.msi) 64-bit**.
   - Jalankan installer, klik **Next** hingga selesai (pastikan opsi *"Add to PATH"* tetap tercentang).
2. **Pasang Git for Windows:**
   - Unduh dari: [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - Jalankan installer dan ikuti instruksi default hingga selesai.

---

### 3. CARA DEPLOY / PULL MENGGUNAKAN GITHUB DI VPS WINDOWS

Menggunakan GitHub jauh lebih bersih, cepat, dan otomatis dibandingkan mengunggah file zip manual.

#### Langkah 1: Buka Command Prompt (CMD) di VPS
- Tekan tombol `Win + R` di keyboard, ketik `cmd`, lalu tekan **Enter**.
- Pindah ke folder tempat Anda ingin menyimpan proyek, misalnya drive `C:\apps`:
  ```cmd
  mkdir C:\apps
  cd C:\apps
  ```

#### Langkah 2: Clone Repository dari GitHub
Jalankan perintah berikut di CMD:
```cmd
git clone https://github.com/FirmanNurilhaq/Dashboard-National.git
cd Dashboard-National
```

*(Jika repository sudah pernah Anda clone sebelumnya, Anda cukup melakukan update data terbaru dengan perintah):*
```cmd
git pull origin main
```

#### Langkah 3: Install Dependensi & Build
Jalankan instalasi paket:
```cmd
npm install
npm run build
```

#### Langkah 4: Jalankan Aplikasi pada Port 7210
Cukup jalankan:
```cmd
start.bat
```
Atau langsung jalankan via npm:
```cmd
npm run start
```
Aplikasi Anda sekarang aktif pada port **7210**!

---

### 4. MEMBUKA PORT 7210 DI WINDOWS FIREWALL (AGAR BISA DIAKSES DARI LUAR)

Agar dashboard dapat diakses dari browser laptop/HP Anda melalui `http://IP_VPS:7210`, buka port 7210 di Windows Firewall VPS dengan salah satu cara berikut:

#### Cara Cepat (Jalankan di PowerShell Administrator VPS):
Buka **PowerShell as Administrator** di VPS, lalu copy-paste perintah ini:
```powershell
New-NetFirewallRule -DisplayName "NEXWAVE Dashboard Port 7210" -Direction Inbound -LocalPort 7210 -Protocol TCP -Action Allow
```

#### Atau Cara Manual via GUI:
1. Buka **Control Panel** -> **Windows Defender Firewall** -> **Advanced Settings**.
2. Klik **Inbound Rules** di panel sebelah kiri, lalu klik **New Rule...** di panel sebelah kanan.
3. Pilih **Port** -> Klik **Next**.
4. Pilih **TCP** dan masukkan port: `7210` -> Klik **Next**.
5. Pilih **Allow the connection** -> Klik **Next**.
6. Centang **Domain**, **Private**, **Public** -> Klik **Next**.
7. Beri nama: `NEXWAVE Dashboard 7210` -> Klik **Finish**.

> **Catatan Provider VPS:** Jika Anda menyewa VPS di cloud provider seperti AWS, Google Cloud, Azure, Alibaba Cloud, DigitalOcean, atau Niagahoster, pastikan juga membuka port **7210** di menu **Security Group / Firewall Rules** pada web dashboard provider VPS Anda.

---

### 5. AKSES DASHBOARD & KREDENSIAL LOGIN

- **URL Akses:** `http://IP_VPS_ANDA:7210`
- **Username:** `admin`
- **Password:** `4dmin123`
- **Role:** `System Administrator`

---

### 6. MENJALANKAN DENGAN PM2 (AGAR OTOMATIS BERJALAN 24/7)

Jika Anda ingin aplikasi tetap berjalan di latar belakang meskipun Anda menutup remote desktop VPS:
```cmd
# 1. Install PM2 secara global
npm install -g pm2

# 2. Jalankan dashboard
npx pm2 start ecosystem.config.js

# 3. Simpan state PM2 agar auto-start saat VPS restart
npx pm2 save
```
Untuk memantau layanan:
- `npx pm2 status`
- `npx pm2 logs`
- `npx pm2 restart all`
