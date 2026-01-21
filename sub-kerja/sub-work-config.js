// Konfigurasi Google Spreadsheet menggunakan Google Apps Script untuk Data Kerja SUB
// 
// CARA MENGGUNAKAN:
// 1. Buat Google Apps Script di spreadsheet Data Kerja SUB (lihat contoh di docs/google-apps-script-example.js)
// 2. Deploy sebagai Web App dan dapatkan URL
// 3. Paste URL di bawah ini

const CONFIG = {
    // URL Google Apps Script Web App untuk LOAD DATA (doGet)
    // Format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
    // 
    // INSTRUKSI:
    // - URL ini digunakan untuk MENGAMBIL data dari spreadsheet "Data Kerja SUB"
    // - Pastikan Apps Script sudah di-deploy sebagai Web App dengan akses "Anyone"
    // - Pastikan Apps Script memiliki fungsi doGet() untuk membaca data
    // - URL ini BISA SAMA dengan URL untuk submit data (detail-input-config.js)
    // - Lihat contoh script di: docs/google-apps-script-example.js
    // 
    // CATATAN: Menggunakan URL yang sama dengan submit data karena 1 deployment bisa handle doGet dan doPost
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwtyiB8VVcmb838PrC5Px9Kdf7uwn5yurG56YtKCE2rRgqUTJy-4WOSvJeLn6kHsCuL/exec'
};
