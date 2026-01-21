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
    const sheet = spreadsheet.getActiveSheet();
    
    // Atau ambil sheet tertentu berdasarkan nama (uncomment jika perlu)
    // const sheet = spreadsheet.getSheetByName('Sheet1');
    
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


