Ide Visualisasi Data Dashboard Assignment

Berikut adalah daftar ide visualisasi data yang dapat diimplementasikan pada dashboard web Anda berdasarkan alur kerja (assignment -> track -> dt -> audit -> report -> acc/reject) dan struktur data dari Book1.xlsx dengan primary key DU ID:

1. Funnel Chart (Grafik Corong): Pipeline Alur Kerja

Tujuan: Memvisualisasikan tingkat konversi, bottleneck, atau penyusutan jumlah assignment pada setiap tahapan operasional secara berurutan.

Sumbu/Data: Mengambil total metrik dari primary key DU ID yang mengalir mengikuti alur: Total Assignment -> On Air -> Drive Test -> Audit -> Report -> Final Status (Acc/Reject).

Implementasi UI: Menampilkan persentase keberhasilan (conversion rate) antar tahap, misalnya rasio Site yang sudah On Air dan berhasil melewati tahap Audit tanpa tertahan.

2. Peta Persebaran Geospasial (Interactive Map)

Tujuan: Memantau lokasi koordinat Site telekomunikasi secara real-time berdasarkan status progres operasionalnya di lapangan.

Sumbu/Data: Memanfaatkan kolom lat, long, Site ID, dan Site Name.

Implementasi UI: Peta interaktif (misalnya menggunakan pustaka OpenStreetMap atau Google Maps) di mana titik koordinat diberikan kode warna berbeda. Merah untuk Not Yet On Air, kuning untuk DT/Audit in Progress, dan hijau untuk status Accepted/Done.

3. Stacked Bar Chart: Distribusi Status per Area / Kabupaten

Tujuan: Membandingkan beban kerja (workload) dan pencapaian operasional antar wilayah administratif secara paralel.

Sumbu/Data: Sumbu X berisi Area atau Kabupaten, sedangkan sumbu Y adalah akumulasi jumlah DU ID.

Implementasi UI: Batang diagram ditumpuk (stacked) berdasarkan kategori status. Hal ini memudahkan identifikasi cepat terkait wilayah mana yang memiliki tumpukan (backlog) Not Yet On Air terbanyak dibandingkan dengan wilayah yang mayoritas Site-nya sudah Acc.

4. Line Chart: Tren Penyelesaian (Velocity Trend)

Tujuan: Menganalisis kecepatan penyelesaian (live KPI reporting) dari waktu ke waktu untuk memantau ritme kerja tim.

Sumbu/Data: Sumbu X merepresentasikan deret waktu (harian/mingguan/bulanan), sumbu Y adalah jumlah assignment. Menggunakan metrik timestamp seperti tanggal On Air atau tanggal Accepted.

Implementasi UI: Beberapa garis tren yang menunjukkan pergerakan assignment yang baru masuk berbanding dengan tren assignment yang berhasil diselesaikan pada periode waktu tertentu.

5. Donut Chart: Rasio Status Akhir (Approval Rate)

Tujuan: Menampilkan proporsi metrik final (Acc, Not Yet Acc, Reject) secara padat dan intuitif.

Sumbu/Data: Agregasi pengelompokan dari status final.

Implementasi UI: Persentase Approval/Acc diletakkan di bagian tengah lingkaran sebagai angka sentral. Potongan (slice) yang merepresentasikan status Reject dapat diatur agar menampilkan detail isi dari kolom Remark atau alasan penolakan ketika kursor di-hover.

6. KPI Scorecards (Top-Level Metrics)

Tujuan: Memberikan ringkasan angka absolut (high-level view) bagi manajemen sebelum menganalisis rincian data di bawahnya.

Sumbu/Data: Perhitungan dinamis (Count) dari total DU ID yang tersaring berdasarkan kondisional status masing-masing tahap.

Implementasi UI: Deretan kartu ringkasan di panel atas yang secara live menampilkan metrik seperti:

Total Assignment

Site On Air (vs Not Yet On Air)

Menunggu Drive Test & Audit

Total Accepted

Total Rejected

7. Interactive Data Grid (Tabel Dinamis)

Tujuan: Memfasilitasi kegiatan pemantauan data tingkat baris yang sering mengalami update in-place pada nilai status tanpa penambahan baris baru, serta melihat assignment baru yang masuk.

Sumbu/Data: Menampilkan DU ID, Site ID, informasi tanggal untuk setiap tahapan, status saat ini, dan Remark.

Implementasi UI: Tabel data reaktif yang mendukung fungsi pencarian global berdasarkan DU ID atau Site ID, pengurutan (sorting), dan filter multi-kolom berjenjang. Tabel ini memastikan antarmuka tetap bersih sambil mengakomodasi refresh status secara dinamis.