/**
 * CONTOH GOOGLE APPS SCRIPT UNTUK BKKBN
 * 
 * INSTRUKSI:
 * 1. Buka Google Spreadsheet Anda
 * 2. Klik Extensions → Apps Script
 * 3. Copy kode ini ke editor Apps Script
 * 4. Klik Deploy → New deployment → Web app
 * 5. Set "Who has access" menjadi "Anyone"
 * 6. Klik Deploy dan copy URL yang diberikan
 * 7. Paste URL di file config.js (pendataan/data-config.js atau assets/bkkbn/homepage-config.js)
 */

function doGet() {
  try {
    // Ambil spreadsheet aktif
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ambil sheet aktif (sheet yang sedang dibuka)
    //const sheet = spreadsheet.getActiveSheet();
    
    // Atau ambil sheet tertentu berdasarkan nama (uncomment jika perlu)
    const sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    // Ambil semua data dari sheet
    const data = sheet.getDataRange().getValues();
    
    // Cek apakah ada data
    if (data.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Tidak ada data di spreadsheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ambil header (baris pertama)
    const headers = data[0];
    
    // Convert data menjadi array of objects
    const result = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        // Handle header yang kosong
        const headerName = header || `Kolom${index + 1}`;
        // Ambil nilai, jika kosong gunakan string kosong
        row[headerName] = data[i][index] || '';
      });
      result.push(row);
    }
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      total: result.length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error message
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString(),
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * FUNGSI doPost() - Untuk Menerima Data dari Form dan Menulis ke Spreadsheet
 * 
 * INSTRUKSI:
 * 1. Fungsi ini digunakan untuk menerima data yang dikirim dari form (POST request)
 * 2. Data akan ditulis ke sheet yang ditentukan
 * 3. Pastikan sheet sudah memiliki header kolom yang sesuai
 * 4. Deploy ulang Apps Script setelah menambahkan fungsi ini
 */

function doPost(e) {
  try {
    // Log untuk debugging
    console.log('doPost called');
    console.log('e.postData type:', e.postData ? e.postData.type : 'null');
    console.log('e.parameter keys:', e.parameter ? Object.keys(e.parameter) : 'null');
    
    // Parse data yang diterima
    let postData;
    
    // PENTING: Untuk form-urlencoded, Google Apps Script OTOMATIS parse ke e.parameter
    // SELALU gunakan e.parameter.data, JANGAN gunakan e.postData.contents untuk form-urlencoded
    
    // Cek e.parameter.data (untuk form-urlencoded)
    if (e.parameter && e.parameter.data) {
      console.log('Menggunakan e.parameter.data');
      console.log('Data length:', String(e.parameter.data).length);
      console.log('Data preview:', String(e.parameter.data).substring(0, 100));
      
      try {
        // e.parameter.data sudah di-decode oleh Google Apps Script
        // Langsung parse sebagai JSON
        postData = JSON.parse(e.parameter.data);
        console.log('JSON parsed successfully');
      } catch (parseError) {
        console.error('Parse error:', parseError.toString());
        console.error('Data yang gagal di-parse:', String(e.parameter.data).substring(0, 200));
        throw new Error('Gagal parse JSON dari parameter "data". Error: ' + parseError.toString() + '. Data preview: ' + String(e.parameter.data).substring(0, 200));
      }
    }
    // Cek e.postData.contents (untuk JSON langsung, BUKAN form-urlencoded)
    else if (e.postData && e.postData.contents && e.postData.type === 'application/json') {
      console.log('Menggunakan e.postData.contents (JSON)');
      try {
        postData = JSON.parse(e.postData.contents);
        console.log('JSON parsed successfully');
      } catch (parseError) {
        throw new Error('Gagal parse JSON: ' + parseError.toString());
      }
    }
    // Jika tidak ada data
    else {
      console.error('Tidak ada data ditemukan');
      console.error('e.parameter:', e.parameter);
      console.error('e.postData:', e.postData ? {type: e.postData.type, contentsLength: e.postData.contents ? e.postData.contents.length : 0} : 'null');
      throw new Error('Tidak ada data yang diterima. Pastikan data dikirim sebagai form-urlencoded dengan key "data".');
    }
    
    // Validasi postData
    if (!postData || typeof postData !== 'object') {
      throw new Error('Data tidak valid atau format tidak dikenali');
    }
    
    console.log('postData keys:', Object.keys(postData));
    
    // Ambil spreadsheet aktif
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ambil sheet "Form Responses 1" (sheet utama yang berisi data kerja)
    let sheet = spreadsheet.getSheetByName('Form Responses 1');
    if (!sheet) {
      throw new Error('Sheet "Form Responses 1" tidak ditemukan. Pastikan sheet sudah ada di spreadsheet.');
    }
    
    // Ambil semua data dari sheet untuk mencari row yang sesuai
    const allData = sheet.getDataRange().getValues();
    if (allData.length < 2) {
      throw new Error('Sheet "Form Responses 1" tidak memiliki data');
    }
    
    // Ambil header (baris pertama)
    const headers = allData[0];
    
    // Cari index kolom yang ada
    const getColumnIndex = (headerName) => {
      return headers.findIndex(h => String(h).trim() === headerName);
    };
    
    // Pastikan kolom detail KB ada, jika belum ada tambahkan
    const detailKBHeaders = ['PUS', 'IUD', 'MOP', 'MOW', 'IMP', 'STK', 'PIL', 'KDM', 'HAMIL', 'IAS', 'IAT', 'TIAL', 'Keterangan'];
    let lastColumn = headers.length;
    
    detailKBHeaders.forEach(header => {
      const colIndex = getColumnIndex(header);
      if (colIndex === -1) {
        // Kolom belum ada, tambahkan
        sheet.getRange(1, lastColumn + 1).setValue(header);
        headers.push(header);
        lastColumn++;
      }
    });
    
    // Format header baru jika ada yang ditambahkan
    if (lastColumn > headers.length - detailKBHeaders.length) {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // Cari row yang sesuai berdasarkan Nama KK, Nama Istri, dan Nama Kader
    // Gunakan kombinasi untuk memastikan ketepatan matching
    const namaKK = String(postData.namaKK || '').trim();
    const namaIstri = String(postData.namaIstri || '').trim();
    const namaKader = String(postData.namaKader || '').trim();
    
    // Cari index kolom untuk matching
    const colNamaKK = getColumnIndex('Nama KK');
    const colNamaIstri = getColumnIndex('Nama Istri');
    const colNamaKader = getColumnIndex('Nama kader');
    
    if (colNamaKK === -1 || colNamaIstri === -1) {
      throw new Error('Kolom "Nama KK" atau "Nama Istri" tidak ditemukan di sheet "Form Responses 1"');
    }
    
    // Cari row yang cocok
    let matchedRowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      const rowNamaKK = String(row[colNamaKK] || '').trim();
      const rowNamaIstri = String(row[colNamaIstri] || '').trim();
      const rowNamaKader = colNamaKader !== -1 ? String(row[colNamaKader] || '').trim() : '';
      
      // Match berdasarkan Nama KK dan Nama Istri (wajib)
      // Jika ada Nama Kader, juga match dengan Nama Kader
      if (rowNamaKK === namaKK && rowNamaIstri === namaIstri) {
        // Jika ada Nama Kader, pastikan juga match
        if (colNamaKader !== -1 && namaKader && rowNamaKader !== namaKader) {
          continue; // Skip jika Nama Kader tidak match
        }
        matchedRowIndex = i + 1; // +1 karena array index 0-based, tapi row di sheet 1-based
        break;
      }
    }
    
    if (matchedRowIndex === -1) {
      throw new Error('Data tidak ditemukan di sheet "Form Responses 1". Pastikan Nama KK dan Nama Istri sesuai dengan data yang ada.');
    }
    
    // Siapkan data untuk ditulis dalam format tabel
    // Setiap kolom KB akan berisi "✓" jika dipilih, "" jika tidak
    const pus = '✓'; // PUS selalu "✓" (hidden, tidak perlu input dari form)
    const keterangan = postData.keterangan || '';
    
    // Tentukan nilai untuk setiap kolom KB (✓ atau "")
    const detailKB = postData.detailKB || '';
    
    // Inisialisasi semua kolom dengan ""
    let iud = '';
    let mop = '';
    let mow = '';
    let imp = '';
    let stk = '';
    let pil = '';
    let kdm = '';
    let hamil = '';
    let ias = '';
    let iat = '';
    let tial = '';
    
    // Set nilai "✓" untuk kolom yang dipilih
    if (detailKB === 'IUD') iud = '✓';
    else if (detailKB === 'MOP') mop = '✓';
    else if (detailKB === 'MOW') mow = '✓';
    else if (detailKB === 'IMP') imp = '✓';
    else if (detailKB === 'STK') stk = '✓';
    else if (detailKB === 'PIL') pil = '✓';
    else if (detailKB === 'KDM') kdm = '✓';
    else if (detailKB === 'HAMIL') hamil = '✓';
    else if (detailKB === 'IAS') ias = '✓';
    else if (detailKB === 'IAT') iat = '✓';
    else if (detailKB === 'TIAL') tial = '✓';
    
    // Update row yang sudah ada dengan data detail KB
    // Ambil index kolom untuk setiap kolom detail KB
    const getColIndex = (headerName) => {
      const idx = headers.findIndex(h => String(h).trim() === headerName);
      return idx !== -1 ? idx + 1 : null; // +1 karena getRange menggunakan 1-based index
    };
    
    // Update kolom detail KB di row yang sudah ada
    const colPUS = getColIndex('PUS');
    const colIUD = getColIndex('IUD');
    const colMOP = getColIndex('MOP');
    const colMOW = getColIndex('MOW');
    const colIMP = getColIndex('IMP');
    const colSTK = getColIndex('STK');
    const colPIL = getColIndex('PIL');
    const colKDM = getColIndex('KDM');
    const colHAMIL = getColIndex('HAMIL');
    const colIAS = getColIndex('IAS');
    const colIAT = getColIndex('IAT');
    const colTIAL = getColIndex('TIAL');
    const colKeterangan = getColIndex('Keterangan');
    
    // Update setiap kolom jika ada
    if (colPUS) sheet.getRange(matchedRowIndex, colPUS).setValue(pus);
    if (colIUD) sheet.getRange(matchedRowIndex, colIUD).setValue(iud);
    if (colMOP) sheet.getRange(matchedRowIndex, colMOP).setValue(mop);
    if (colMOW) sheet.getRange(matchedRowIndex, colMOW).setValue(mow);
    if (colIMP) sheet.getRange(matchedRowIndex, colIMP).setValue(imp);
    if (colSTK) sheet.getRange(matchedRowIndex, colSTK).setValue(stk);
    if (colPIL) sheet.getRange(matchedRowIndex, colPIL).setValue(pil);
    if (colKDM) sheet.getRange(matchedRowIndex, colKDM).setValue(kdm);
    if (colHAMIL) sheet.getRange(matchedRowIndex, colHAMIL).setValue(hamil);
    if (colIAS) sheet.getRange(matchedRowIndex, colIAS).setValue(ias);
    if (colIAT) sheet.getRange(matchedRowIndex, colIAT).setValue(iat);
    if (colTIAL) sheet.getRange(matchedRowIndex, colTIAL).setValue(tial);
    if (colKeterangan) sheet.getRange(matchedRowIndex, colKeterangan).setValue(keterangan);
    
    // Return success response
    // Pastikan selalu return JSON yang valid
    const successResponse = {
      success: true,
      message: 'Data berhasil disimpan',
      timestamp: new Date().toISOString(),
      data: {
        namaKader: postData.namaKader || '',
        namaKK: postData.namaKK || '',
        namaIstri: postData.namaIstri || ''
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(successResponse))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error untuk debugging (hanya di Apps Script execution log)
    console.error('Error di doPost:', error.toString());
    console.error('Error message:', error.message);
    
    // Return error message sebagai JSON yang valid
    const errorResponse = {
      success: false,
      message: 'Error: ' + (error.message || error.toString()),
      error: error.message || 'Unknown error',
      hint: 'Pastikan data dikirim dalam format yang benar. Cek execution log di Apps Script untuk detail lebih lanjut.'
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CATATAN PENTING:
 * 
 * 1. Setelah menambahkan fungsi doPost(), Anda HARUS deploy ulang Apps Script:
 *    - Klik Deploy → Manage deployments
 *    - Klik edit (ikon pensil) pada deployment yang ada
 *    - Klik Deploy
 * 
 * 2. Pastikan "Who has access" tetap "Anyone"
 * 
 * 3. Data akan ditulis ke sheet "Form Responses 1" (bukan sheet terpisah)
 *    - Script akan mencari row yang sesuai berdasarkan Nama KK dan Nama Istri
 *    - Update row tersebut dengan menambahkan kolom detail KB
 *    - Jika kolom detail KB belum ada, akan ditambahkan otomatis
 * 
 * 4. Jika ingin menambahkan kolom baru, tambahkan di array headers dan rowData
 * 
 * 5. Format data yang diterima dari form:
 *    {
 *      namaKader: string,
 *      namaKK: string,
 *      namaIstri: string,
 *      tanggalLahirIstri: string,
 *      umurIstri: string,
 *      statusKB: "Peserta KB" | "Bukan Peserta KB",
 *      detailKB: string (IUD/MOP/MOW/IMP/STK/PIL untuk Peserta KB, atau KDM/HAMIL/IAS/IAT/TIAL untuk Bukan Peserta KB),
 *      keterangan: string (optional),
 *      timestamp: string (ISO format)
 *    }
 * 
 * 6. Format spreadsheet yang dihasilkan:
 *    - Data detail KB akan ditulis ke sheet "Form Responses 1"
 *    - Kolom detail KB akan ditambahkan otomatis jika belum ada: PUS (selalu "✓"), IUD, MOP, MOW, IMP, STK, PIL, KDM, HAMIL, IAS, IAT, TIAL, Keterangan
 *    - Setiap kolom KB akan berisi "✓" jika dipilih, "" jika tidak dipilih
 *    - Kolom PUS selalu berisi "✓" (tidak perlu input dari form)
 *    - Script akan mencari row yang sesuai berdasarkan Nama KK dan Nama Istri, lalu update row tersebut
 *    - Dengan cara ini, Anda bisa melihat di sheet "Form Responses 1" mana data yang sudah di-input detail KB-nya
 */


