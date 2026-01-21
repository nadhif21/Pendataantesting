# INSTRUKSI DEPLOY GOOGLE APPS SCRIPT

## ⚠️ PENTING: Mengatasi Error CORS

Jika Anda mengalami error CORS saat load data, ikuti langkah-langkah berikut dengan TEPAT:

## Langkah-langkah Deploy (UNTUK LOAD DATA):

### 1. Buka Google Apps Script Editor
- Buka spreadsheet **"input data kerja (response)"**
- Klik **Extensions** → **Apps Script**

### 2. Copy Kode Lengkap untuk doGet()
- Buka file `docs/google-apps-script-example.js` di project Anda
- **COPY fungsi doGet()** (baris 14-68)
- Paste ke Apps Script editor di file yang sesuai (misalnya `Code.gs` atau buat file baru)

### 3. Deploy sebagai Web App (UNTUK LOAD DATA)
- Klik **Deploy** → **New deployment**
- **PENTING:** Klik ikon **</>** (Web app) di bagian "Select type"
- **JANGAN** pilih "Test deployments" atau "Add-on"
- Set:
  - **Description**: "Load Data Kerja SUB" (opsional)
  - **Execute as**: "Me" (dropdown pertama)
  - **Who has access**: **"Anyone"** ⚠️ PENTING! 
    - Pilih dari dropdown, BUKAN "Anyone with Google account"
    - Harus tepat "Anyone"
- Klik **Deploy**
- **Akan muncul dialog authorization** - klik **Authorize access**
- Pilih akun Google Anda
- Klik **Advanced** → **Go to [project name] (unsafe)**
- Klik **Allow**
- **Copy URL** yang muncul di dialog (format: `https://script.google.com/macros/s/.../exec`)
- **JANGAN tutup dialog** sebelum copy URL

### 4. Update Config untuk Load Data
- Buka file `sub-kerja/sub-work-config.js`
- Paste URL ke `APPS_SCRIPT_URL`

## Langkah-langkah Deploy (UNTUK SUBMIT DATA):

### 1. Copy Kode Lengkap untuk doPost()
- Copy fungsi `doPost()` dari `docs/google-apps-script-example.js` (baris 80-280)
- Paste ke Apps Script editor (di file yang sama atau file terpisah)

### 2. Deploy sebagai Web App (UNTUK SUBMIT DATA)
- **OPSI 1: Gunakan deployment yang sama** (disarankan)
  - Jika sudah ada deployment untuk load data, gunakan URL yang sama
  - Pastikan deployment tersebut memiliki fungsi `doGet()` dan `doPost()`
  
- **OPSI 2: Buat deployment baru**
  - Klik **Deploy** → **New deployment**
  - Klik ikon **</>** (Web app)
  - Set:
    - **Description**: "Submit Detail KB"
    - **Execute as**: "Me"
    - **Who has access**: **"Anyone"** ⚠️ PENTING!
  - Klik **Deploy**
  - **Copy URL** yang diberikan

### 3. Update Config untuk Submit Data
- Buka file `sub-kerja/detail-input-config.js`
- Paste URL ke `APPS_SCRIPT_URL`

## ⚠️ CATATAN PENTING:

1. **Dua Deployment Terpisah (OPSIONAL):**
   - Anda bisa menggunakan 1 deployment untuk kedua fungsi (doGet dan doPost)
   - Atau membuat 2 deployment terpisah (satu untuk load, satu untuk submit)
   - Jika menggunakan 1 deployment, pastikan URL-nya sama di kedua config

2. **Setelah Update Kode:**
   - **HARUS deploy ulang** setiap kali mengubah kode
   - Edit deployment yang ada → Klik **Deploy**
   - URL akan tetap sama, tapi versi akan update

3. **"Who has access" = "Anyone":**
   - Ini **WAJIB** untuk menghindari CORS
   - Bukan "Anyone with Google account"
   - Bukan "Only myself"

4. **URL harus menggunakan /exec:**
   - ✅ Benar: `https://script.google.com/macros/s/.../exec`
   - ❌ Salah: `https://script.google.com/macros/s/.../dev`

## Test Deployment:

### Test Load Data:
1. Buka URL Apps Script (dari sub-work-config.js) langsung di browser
2. **Harus muncul JSON data**, contoh: `{"success":true,"data":[...]}`
3. **Jika muncul "Page Not Found":**
   - Deployment belum dibuat atau URL salah
   - Buat deployment baru dan copy URL yang benar
4. **Jika muncul dialog login:**
   - "Who has access" bukan "Anyone"
   - Edit deployment dan ubah ke "Anyone", lalu deploy ulang
5. **Jika muncul error lain:**
   - Cek Execution log di Apps Script untuk detail error

### Test Submit Data:
1. Coba submit data dari form
2. Cek spreadsheet "Form Responses 1" apakah data sudah masuk
3. Cek **Execution log** di Apps Script jika ada error

## Troubleshooting CORS:

### Jika masih error CORS setelah deploy:
1. **Pastikan "Who has access" = "Anyone"** (cek lagi di Manage deployments)
2. **Deploy ulang** setelah mengubah setting
3. **Clear cache browser** (Ctrl+Shift+Delete)
4. **Test URL langsung** di browser baru (incognito mode)
5. **Pastikan URL menggunakan /exec** bukan /dev

### Jika error "404 Not Found":
- URL Apps Script salah
- Deployment belum dibuat
- Copy URL dari deployment, bukan dari editor

### Jika error "Authorization required":
- "Who has access" bukan "Anyone"
- Deploy ulang dengan setting yang benar
