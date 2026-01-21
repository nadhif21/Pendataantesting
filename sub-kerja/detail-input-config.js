// Konfigurasi Google Apps Script untuk Submit Data Detail KB
// 
// CARA MENGGUNAKAN:
// 1. Buat Google Apps Script di spreadsheet yang akan menerima data (lihat contoh di docs/google-apps-script-example.js)
// 2. Tambahkan fungsi doPost() di Apps Script (lihat contoh di docs/google-apps-script-example.js)
// 3. Deploy sebagai Web App dan dapatkan URL
// 4. Paste URL di bawah ini

const SUBMIT_CONFIG = {
    // URL Google Apps Script Web App untuk SUBMIT DATA (doPost)
    // Format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
    // 
    // INSTRUKSI:
    // - URL ini digunakan untuk MENGIRIM data detail KB ke spreadsheet "Form Responses 1"
    // - Pastikan Apps Script sudah di-deploy sebagai Web App dengan akses "Anyone"
    // - Pastikan Apps Script memiliki fungsi doPost() untuk menerima data
    // - URL ini BISA SAMA atau BERBEDA dengan URL untuk load data, tergantung deployment
    // - Lihat contoh script di: docs/google-apps-script-example.js
    // 
    // CATATAN: URL untuk submit data bisa berbeda dengan URL untuk load data
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwtyiB8VVcmb838PrC5Px9Kdf7uwn5yurG56YtKCE2rRgqUTJy-4WOSvJeLn6kHsCuL/exec'
};
