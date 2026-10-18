@echo off
setlocal enabledelayedexpansion

:: Pastikan selalu berada di direktori tempat script ini berada
cd /d "%~dp0"

TITLE NEXWAVE National Productivity Dashboard - Port 7210
COLOR 0B

echo ===============================================================================
echo        NEXWAVE TELKOMSEL NW RF NATIONAL TRACKER & PRODUCTIVITY DASHBOARD
echo                     PRODUCTION RUNNER SCRIPT (PORT 7210)
echo ===============================================================================
echo [Direktori Kerja]: %CD%
echo.

:: 1. Verifikasi Instalasi Node.js
echo [1/4] Memeriksa instalasi Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ===============================================================================
    echo [ERROR KRITIS] Node.js TIDAK TERDETEKSI di VPS ini!
    echo.
    echo Inilah penyebab jendela ini langsung tertutup jika dijalankan sebelumnya.
    echo.
    echo LANGKAH PENYELESAIAN:
    echo 1. Unduh Node.js LTS (versi 18 atau 20) untuk Windows Server:
    echo    https://nodejs.org/en/download
    echo 2. Pasang (Install) installer .msi tersebut sampai selesai (centang "Add to PATH").
    echo 3. Buka ulang Command Prompt atau jalankan kembali file start.bat ini.
    echo ===============================================================================
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [INFO] Node.js terdeteksi: %NODE_VERSION% ^| npm: %NPM_VERSION%

:: 2. Periksa Berkas .env
echo.
echo [2/4] Memeriksa konfigurasi environment (.env)...
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Berkas .env belum ada. Menyalin dari .env.example...
        copy .env.example .env >nul
    ) else (
        echo [WARN] Berkas .env dan .env.example tidak ditemukan!
    )
) else (
    echo [INFO] Berkas .env ditemukan.
)

:: 3. Periksa dan Pasang Dependensi node_modules jika belum ada
echo.
echo [3/4] Memeriksa paket dependensi (node_modules)...
if not exist "node_modules\" (
    echo [INFO] Folder node_modules belum ada. Menjalankan npm install...
    echo (Proses ini hanya berjalan sekali saat awal, harap tunggu 1-2 menit)...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Gagal memasang dependensi via 'npm install'.
        echo Periksa koneksi internet VPS Anda.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependensi node_modules sudah terpasang.
)

:: 4. Jalankan Aplikasi pada Port 7210
echo.
echo [4/4] Memulai Server Dashboard pada Port 7210...
echo.
echo ===============================================================================
echo  APLIKASI SIAP DIJALANKAN PADA PORT 7210!
echo  - Akses Lokal VPS   : http://localhost:7210
echo  - Akses Publik VPS  : http://IP_VPS_ANDA:7210
echo  - Kredensial Login  : admin / 4dmin123
echo ===============================================================================
echo.
echo Tekan sembarang tombol untuk memulai server Next.js sekarang...
pause >nul

echo.
echo Menjalankan: npm run start ...
echo (Jendela ini akan tetap terbuka untuk menjaga server tetap hidup).
echo (Tekan Ctrl + C jika ingin menghentikan server).
echo ===============================================================================
echo.

call npm run start

echo.
echo ===============================================================================
echo [INFO] Server Next.js telah dihentikan.
echo ===============================================================================
pause
