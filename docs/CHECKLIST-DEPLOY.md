# ✅ CHECKLIST DEPLOY GOOGLE APPS SCRIPT

## Untuk Mengatasi Error CORS

### Checklist Deployment:

- [ ] **1. Kode sudah di-copy ke Apps Script**
  - Copy SEMUA kode dari `docs/google-apps-script-example.js`
  - Paste ke Apps Script editor
  - Pastikan ada fungsi `doGet()` dan `doPost()`

- [ ] **2. Deploy sebagai Web App**
  - Klik **Deploy** → **Manage deployments**
  - Klik **New deployment** (atau edit yang ada)
  - Pilih ikon **</>** (Web app) - BUKAN "Test deployments"

- [ ] **3. Setting Deployment:**
  - [ ] **Execute as**: "Me" ✅
  - [ ] **Who has access**: **"Anyone"** ✅ (BUKAN "Anyone with Google account")
  - [ ] **Description**: Isi dengan deskripsi (opsional)

- [ ] **4. Klik Deploy**
  - Tunggu sampai muncul dialog dengan URL
  - **JANGAN tutup dialog** sebelum copy URL

- [ ] **5. Copy URL yang Benar**
  - URL harus format: `https://script.google.com/macros/s/.../exec`
  - Pastikan ada `/exec` di akhir (BUKAN `/dev`)
  - Copy URL dari dialog deployment

- [ ] **6. Update Config Files:**
  - [ ] URL untuk **load data** → `sub-kerja/sub-work-config.js`
  - [ ] URL untuk **submit data** → `sub-kerja/detail-input-config.js`
  - Jika menggunakan 1 deployment untuk keduanya, paste URL yang sama

- [ ] **7. Test URL Langsung**
  - Buka URL Apps Script di browser baru (atau incognito)
  - Harus muncul JSON data (untuk doGet)
  - Jika muncul dialog login/error, berarti deployment salah

- [ ] **8. Clear Cache Browser**
  - Tekan **Ctrl+Shift+Delete**
  - Pilih "Cached images and files"
  - Clear data

- [ ] **9. Test di Web App**
  - Refresh halaman detail-input.html (Ctrl+F5)
  - Cek console browser (F12) untuk error
  - Data harus muncul tanpa error CORS

## ⚠️ Masalah Umum:

### Error CORS masih muncul:
1. ✅ Pastikan "Who has access" = **"Anyone"** (cek lagi!)
2. ✅ Deploy ulang setelah mengubah setting
3. ✅ Pastikan URL menggunakan `/exec` bukan `/dev`
4. ✅ Test URL langsung di browser untuk memastikan bisa diakses

### Data tidak muncul:
1. ✅ Cek apakah Apps Script sudah di-deploy
2. ✅ Cek URL di config file sudah benar
3. ✅ Cek console browser untuk error detail
4. ✅ Cek Execution log di Apps Script

### Submit data gagal:
1. ✅ Pastikan fungsi `doPost()` ada di Apps Script
2. ✅ Pastikan sudah deploy ulang setelah menambahkan `doPost()`
3. ✅ Cek Execution log di Apps Script untuk error detail
4. ✅ Pastikan sheet "Form Responses 1" ada di spreadsheet
