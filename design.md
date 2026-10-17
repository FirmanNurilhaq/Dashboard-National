# Dokumen Desain: Dashboard Visualisasi Data Interaktif

## Bagian 1: Visi Utama dan Gaya Global
Dashboard ini dirancang untuk menyajikan data analitik dan KPI (*Key Performance Indicators*) secara *real-time* dengan antarmuka yang bersih, modern, dan sangat responsif. Estetika yang diusung mempertahankan elemen *glassmorphism* dan kedalaman 3D halus untuk memisahkan lapisan informasi tanpa mengorbankan keterbacaan data.

*   **Tipografi:** Menggunakan font **Inter** (bobot 300, 400, 500, 600, 700) untuk memastikan keterbacaan angka dan label data berukuran kecil secara maksimal.
*   **Warna Latar:** Latar belakang utama menggunakan `#f5f5f7` (abu-abu terang) untuk memberikan kontras yang nyaman bagi mata saat melihat grafik berwarna.
*   **Estetika Widget (Glassmorphism):** Panel grafik dan metrik menggunakan efek *backdrop-filter: blur(12px)*, latar belakang putih semi-transparan (`rgba(255, 255, 255, 0.7)`), batas garis tipis transparan, dan bayangan lembut (*soft drop shadow*) untuk efek melayang.
*   **Kebersihan UI:** *Scrollbar* di area konten utama diminimalkan, sementara *scrollbar* pada panel tabel atau panel sekunder disembunyikan.

## Bagian 2: Struktur Tata Letak (Grid System)
Dashboard meninggalkan gaya presentasi *scrolling hero* tunggal dan beralih ke tata letak berbasis Grid/Flexbox yang padat data:

*   **Sidebar Navigasi (Kiri - Fixed z-40):** Panel navigasi vertikal berlatar putih solid yang memuat ikon menu utama (Dashboard, Analitik, Laporan, Pengaturan). Menyusut menjadi ikon saja (*collapsed*) di layar kecil.
*   **Header / Topbar (Atas - Sticky z-30):** Menampung judul halaman, filter rentang waktu global (mis. "7 Hari Terakhir"), dan profil pengguna. Memiliki efek *backdrop-blur* saat konten digulir ke bawahnya.
*   **Area Konten Utama (Grid 12 Kolom):** Wadah fleksibel di mana widget disusun. Kolom akan menyesuaikan secara responsif (1 kolom di mobile, 2-3 kolom di tablet, 12 kolom penuh di desktop).

## Bagian 3: Spesifikasi Widget (Cards)
Setiap panel data direpresentasikan sebagai "Kartu" independen yang menempati area grid tertentu:

1.  **KPI Summary Cards (Baris Atas):** 4 kartu kecil sejajar. Masing-masing berisi judul metrik (misalnya "Total Pengguna", "Tingkat Retensi"), nilai angka yang besar, ikon indikator tren (panah naik/turun hijau/merah), dan grafik *sparkline* SVG kecil di latar belakang.
2.  **Main Visualization (Tengah - Span 8 Kolom):** Panel utama yang menampilkan grafik garis atau area (mis. "Tren Pertumbuhan"). Menggunakan *custom* SVG dengan `vector-effect="non-scaling-stroke"` agar ketebalan garis tetap konsisten saat grid berubah ukuran. Area di bawah garis menggunakan gradien yang memudar ke bawah.
3.  **Secondary Chart (Tengah - Span 4 Kolom):** Panel untuk distribusi porsi, seperti grafik Donut atau bar horizontal (mis. "Distribusi Perangkat" atau "Sumber Trafik").
4.  **Data Table / Feed (Baris Bawah - Span 12 Kolom):** Tabel data tabular terperinci dengan header kolom yang lengket (*sticky header*) di dalam wadah ber-overflow, menampilkan data mentah dari visualisasi di atasnya.

## Bagian 4: Aturan Animasi dan Interaksi
Animasi tidak lagi difokuskan pada manipulasi *scroll* yang ekstrem, melainkan pada kejelasan data dan respon interaktif:

*   **Entry Animation (Staggered Load):** Saat dashboard dimuat, kartu-kartu akan muncul berurutan dari atas ke bawah menggunakan transisi *fade-in* dan *slide-up* yang halus, dengan jeda (delay) sekitar 50ms per kartu.
*   **Interactive Tooltips:** Saat kursor melayang di atas titik data pada grafik, garis vertikal penunjuk (*crosshair*) dan *tooltip* berisi detail angka akan muncul mengikuti posisi mouse.
*   **Subtle 3D Hover (Parallax Tilt):** Khusus untuk KPI Cards, interaksi kursor tetikus akan memberikan efek kemiringan 3D yang sangat halus (maksimal 2-3 derajat pada *rotateX* dan *rotateY*) menggunakan manipulasi kursor, memberi kesan antarmuka yang hidup.
*   **Transisi Filter:** Perubahan data akibat filter rentang waktu akan memicu animasi perubahan tinggi elemen batang pada *bar chart* atau pergerakan *path* pada *line chart*, bukan *reload* halaman.

## Bagian 5: Batasan Kinerja dan Aksesibilitas
*   Penggunaan `perspective: 1000px` dan `transform-style: preserve-3d` dibatasi hanya pada widget ukuran kecil (KPI Cards) untuk mencegah beban *rendering* berat.
*   Setiap elemen grafik SVG wajib memiliki atribut `aria-label` yang menjelaskan tren atau nilai saat ini untuk *screen reader*.
*   Warna grafik (hijau emerald, biru, ungu) harus dipastikan memiliki rasio kontras minimal 4.5:1 terhadap latar putih transparan widget.
*   Akselerasi perangkat keras (`will-change: transform, opacity`) diterapkan pada animasi *hover* widget.

## Bagian 6: Manajemen Aset
*   **Ikonografi:** Sepenuhnya menggunakan **Lucide Icons** (`layout-dashboard`, `bar-chart-2`, `trending-up`, `users`, `calendar`, `filter`).
*   **Vektor & Grafik:** Tidak ada gambar eksternal. Grafik dirender menggunakan elemen DOM, CSS murni untuk diagram batang statis, dan elemen `path` SVG untuk diagram garis/area.