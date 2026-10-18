#!/bin/bash
# ===============================================================================
#        NEXWAVE TELKOMSEL NW RF NATIONAL TRACKER & PRODUCTIVITY DASHBOARD
#                       PRODUCTION RUNNER SCRIPT (PORT 7210)
# ===============================================================================

echo "=== Memeriksa environment Node.js ==="
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js belum terinstall. Install Node.js LTS (v18 atau v20)."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] node_modules belum ditemukan, menjalankan npm install..."
    npm install
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[INFO] Membuat file .env dari .env.example..."
    cp .env.example .env
fi

echo "=== Menjalankan aplikasi pada PORT 7210 ==="
PORT=7210 npm run start
