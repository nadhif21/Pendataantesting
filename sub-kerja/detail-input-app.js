// Aplikasi untuk Input Detail KB dari Data Kerja SUB

let currentData = [];
let filteredData = [];
let selectedRowData = null;

// Daftar kader (sama dengan sub-work-app.js)
const DAFTAR_KADER = [
    "Tri Murtini",
    "Mauzun",
    "Utami Budiarti",
    "Erniati",
    "Prihatmi",
    "Nurmaya Sari",
    "Rumiyati",
    "Suparti",
    "Nuke Yuni Astuti",
    "Reni Puspita Sari",
    "Malinda Jatinirwana",
    "Elizabeth Thlia Frastika",
    "Siswati",
    "Noviyana",
    "Bena Suntari",
    "Ana Raufa",
    "Marhama Yuli",
    "Elsa Bellina",
    "Vika Feriana",
    "Desma Zelvia",
    "Nevi Herawati"
];

// Initialize aplikasi
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const kaderSelect = document.getElementById('kaderSelect');
    const modal = document.getElementById('detailModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const kbForm = document.getElementById('kbForm');
    
    // Setup dropdown kader
    setupKaderDropdown();
    
    refreshBtn.addEventListener('click', loadData);
    
    // Setup search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Setup kader filter
    kaderSelect.addEventListener('change', applyFilters);
    
    // Setup modal
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalHandler();
        }
    });
    
    // Setup form conditional logic
    setupFormLogic();
    
    // Setup form submit
    kbForm.addEventListener('submit', handleFormSubmit);
    
    // Allow Enter key to trigger search
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
            searchInput.blur();
        }
    });
    
    // Load data saat pertama kali dibuka
    loadData();
});

// Setup dropdown kader
function setupKaderDropdown() {
    const kaderSelect = document.getElementById('kaderSelect');
    if (!kaderSelect) return;
    
    // Tambahkan opsi kader
    DAFTAR_KADER.forEach(kader => {
        const option = document.createElement('option');
        option.value = kader;
        option.textContent = kader;
        kaderSelect.appendChild(option);
    });
}

// Setup form conditional logic
function setupFormLogic() {
    const statusKBInputs = document.querySelectorAll('input[name="statusKB"]');
    const pesertaKBGroup = document.getElementById('pesertaKBGroup');
    const bukanPesertaKBGroup = document.getElementById('bukanPesertaKBGroup');
    
    statusKBInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Reset pilihan kedua
            document.querySelectorAll('input[name="jenisKB"]').forEach(radio => radio.checked = false);
            document.querySelectorAll('input[name="kategori"]').forEach(radio => radio.checked = false);
            
            if (this.value === 'Peserta KB') {
                pesertaKBGroup.classList.remove('hidden');
                bukanPesertaKBGroup.classList.add('hidden');
                // Set required untuk jenisKB
                document.querySelectorAll('input[name="jenisKB"]').forEach(radio => {
                    radio.required = true;
                });
                document.querySelectorAll('input[name="kategori"]').forEach(radio => {
                    radio.required = false;
                });
            } else if (this.value === 'Bukan Peserta KB') {
                pesertaKBGroup.classList.add('hidden');
                bukanPesertaKBGroup.classList.remove('hidden');
                // Set required untuk kategori
                document.querySelectorAll('input[name="jenisKB"]').forEach(radio => {
                    radio.required = false;
                });
                document.querySelectorAll('input[name="kategori"]').forEach(radio => {
                    radio.required = true;
                });
            }
        });
    });
}

// Fungsi untuk mengambil data dari Google Spreadsheet (menggunakan config dari sub-work)
async function loadData() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const emptyState = document.getElementById('emptyState');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Show loading
    loading.style.display = 'flex';
    errorMessage.style.display = 'none';
    refreshBtn.disabled = true;
    tableBody.innerHTML = '';
    
    try {
        let data;
        
        // Cek konfigurasi Apps Script (gunakan CONFIG dari sub-work-config.js)
        if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('YOUR_')) {
            throw new Error('Silakan konfigurasi APPS_SCRIPT_URL di file sub-work-config.js');
        }
        
        // Menggunakan Google Apps Script
        data = await loadFromAppsScript();
        
        if (!data || data.length === 0) {
            showEmptyState();
            return;
        }
        
        currentData = data;
        filteredData = data;
        
        // Apply current filters
        applyFilters();
        
    } catch (error) {
        console.error('Error loading data:', error);
        let errorMessage = error.message || 'Terjadi kesalahan saat memuat data.';
        
        // Tambahkan instruksi jika error terkait konfigurasi
        if (errorMessage.includes('konfigurasi') || errorMessage.includes('YOUR_')) {
            errorMessage += '\n\nSilakan edit file sub-work-config.js dan isi APPS_SCRIPT_URL dengan URL Apps Script Anda.';
        }
        
        showError(errorMessage);
        showEmptyState();
    } finally {
        loading.style.display = 'none';
        refreshBtn.disabled = false;
    }
}

// Mengambil data dari Google Apps Script
async function loadFromAppsScript() {
    try {
        // Cek URL Apps Script
        if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('YOUR_')) {
            throw new Error('URL Apps Script belum dikonfigurasi. Silakan edit file sub-work-config.js');
        }
        
        // Cek apakah URL menggunakan /exec (bukan /dev)
        if (CONFIG.APPS_SCRIPT_URL.includes('/dev')) {
            throw new Error('URL Apps Script menggunakan /dev. Pastikan menggunakan URL dengan /exec setelah deploy sebagai Web App.');
        }
        
        // Validasi format URL
        if (!CONFIG.APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/') || !CONFIG.APPS_SCRIPT_URL.endsWith('/exec')) {
            throw new Error('Format URL Apps Script tidak valid. Pastikan URL menggunakan format: https://script.google.com/macros/s/.../exec');
        }
        
        console.log('Mencoba mengambil data dari:', CONFIG.APPS_SCRIPT_URL);
        
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'GET',
            mode: 'cors', // Explicitly set CORS mode
            cache: 'no-cache',
            redirect: 'follow' // Follow redirects if any
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. Pastikan Apps Script sudah di-deploy sebagai Web App dengan akses "Anyone".`);
        }
        
        const json = await response.json();
        
        // Handle response format dari Apps Script
        if (json.success === false) {
            throw new Error(json.message || 'Gagal mengambil data dari Apps Script');
        }
        
        // Filter out empty rows
        let data = json.data || json;
        data = data.filter(row => {
            return Object.values(row).some(value => {
                const stringValue = String(value || '').trim();
                return stringValue.length > 0;
            });
        });
        
        return data;
    } catch (error) {
        // Handle network errors atau CORS issues
        if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('CORS'))) {
            const errorMsg = 'Gagal terhubung ke server karena CORS. Pastikan:\n\n' +
                '1. Apps Script sudah di-deploy sebagai Web App (bukan hanya save)\n' +
                '2. "Who has access" = "Anyone" (bukan "Anyone with Google account")\n' +
                '3. URL menggunakan /exec bukan /dev\n' +
                '4. Deploy ulang Apps Script setelah membuat perubahan\n' +
                '5. Coba akses URL Apps Script langsung di browser untuk memastikan bisa diakses\n\n' +
                'Lihat file docs/INSTRUKSI-DEPLOY-APPS-SCRIPT.md untuk panduan lengkap.';
            throw new Error(errorMsg);
        }
        throw error;
    }
}

// Menampilkan data ke tabel dengan row yang bisa diklik
function displayData(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const kaderSelect = document.getElementById('kaderSelect');
    
    if (data.length === 0) {
        tableBody.innerHTML = '';
        return;
    }
    
    const selectedKader = kaderSelect ? kaderSelect.value : '';
    const showKaderColumn = selectedKader === '';
    
    let displayHeaders = ['Nama KK', 'Nama Istri', 'Tanggal Lahir Istri'];
    if (showKaderColumn && data[0]['Nama kader'] !== undefined) {
        displayHeaders.unshift('Nama kader');
    }
    
    const headerLabels = {
        'Nama kader': 'Nama Kader',
        'Nama KK': 'Nama KK',
        'Nama Istri': 'Nama Istri',
        'Tanggal Lahir Istri': 'Tanggal Lahir Istri',
        'Umur Istri': 'Umur Istri'
    };
    
    // Create header row
    tableHeader.innerHTML = '';
    displayHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] || header;
        tableHeader.appendChild(th);
    });
    const umurTh = document.createElement('th');
    umurTh.textContent = 'Umur Istri';
    tableHeader.appendChild(umurTh);
    const statusTh = document.createElement('th');
    statusTh.textContent = 'Status';
    tableHeader.appendChild(statusTh);
    
    // Create data rows dengan click handler
    tableBody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-clickable';
        tr.addEventListener('click', () => openDetailModal(row));
        
        displayHeaders.forEach(header => {
            const td = document.createElement('td');
            let cellValue = row[header] || '';
            
            if (header === 'Tanggal Lahir Istri' && cellValue) {
                const preprocessed = preprocessTanggalLahir(cellValue);
                if (preprocessed) {
                    cellValue = preprocessed.formatted;
                }
            }
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'cell-value';
            valueSpan.textContent = cellValue;
            td.appendChild(valueSpan);
            td.setAttribute('data-label', headerLabels[header] || header);
            tr.appendChild(td);
        });
        
        // Tambahkan kolom Umur Istri
        const umurTd = document.createElement('td');
        const tanggalOriginal = row['Tanggal Lahir Istri'];
        const umurValue = calculateAge(tanggalOriginal);
        const umurSpan = document.createElement('span');
        umurSpan.className = 'cell-value';
        umurSpan.textContent = umurValue || '';
        
        if (umurValue && parseInt(umurValue) >= 50) {
            umurTd.classList.add('umur-high');
            umurSpan.classList.add('umur-high-text');
        }
        
        umurTd.appendChild(umurSpan);
        umurTd.setAttribute('data-label', 'Umur Istri');
        tr.appendChild(umurTd);
        
        // Tambahkan kolom Status (✓ jika sudah di-input)
        const statusTd = document.createElement('td');
        const isSubmitted = checkIfSubmitted(row);
        const statusSpan = document.createElement('span');
        statusSpan.className = 'cell-value';
        if (isSubmitted) {
            statusSpan.textContent = '✓';
            statusSpan.style.color = '#28a745';
            statusSpan.style.fontWeight = 'bold';
            statusSpan.style.fontSize = '18px';
        } else {
            statusSpan.textContent = '-';
            statusSpan.style.color = '#999';
        }
        statusTd.appendChild(statusSpan);
        statusTd.setAttribute('data-label', 'Status');
        tr.appendChild(statusTd);
        
        tableBody.appendChild(tr);
    });
    
    updateResultCount(data.length, currentData.length);
}

// Fungsi untuk mengecek apakah data sudah di-input
function checkIfSubmitted(row) {
    // Cek apakah kolom PUS ada dan berisi "✓"
    if (row['PUS'] === '✓' || row['PUS'] === '✓') {
        return true;
    }
    // Atau cek apakah ada salah satu kolom detail KB yang sudah diisi
    const detailKBColumns = ['IUD', 'MOP', 'MOW', 'IMP', 'STK', 'PIL', 'KDM', 'HAMIL', 'IAS', 'IAT', 'TIAL'];
    for (const col of detailKBColumns) {
        if (row[col] === '✓' || row[col] === '✓') {
            return true;
        }
    }
    return false;
}

// Fungsi helper untuk preprocessing tanggal lahir (dari sub-work-app.js)
function preprocessTanggalLahir(tanggalLahir) {
    if (!tanggalLahir) return null;
    
    try {
        let tanggalStr = String(tanggalLahir).trim();
        if (!tanggalStr) return null;
        
        tanggalStr = tanggalStr.replace(/[^\d\-\/\s]/g, '');
        const parts = tanggalStr.split(/[-\/\s]+/).filter(p => p.trim().length > 0);
        
        if (parts.length < 3) return null;
        
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        
        if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
        }
        
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;
        
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) return null;
        
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        const yearStr = String(year);
        
        return {
            formatted: `${dayStr}-${monthStr}-${yearStr}`,
            day: day,
            month: month,
            year: year
        };
    } catch (e) {
        return null;
    }
}

// Fungsi helper untuk menghitung umur (dari sub-work-app.js)
function calculateAge(tanggalLahir) {
    if (!tanggalLahir) return '';
    
    try {
        const preprocessed = preprocessTanggalLahir(tanggalLahir);
        if (!preprocessed) return '';
        
        const { day, month, year } = preprocessed;
        const birthDate = new Date(year, month - 1, day);
        
        const createdYear = birthDate.getFullYear();
        const createdMonth = birthDate.getMonth() + 1;
        
        if (createdYear !== year || createdMonth !== month) return '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 150);
        maxDate.setHours(0, 0, 0, 0);
        
        birthDate.setHours(0, 0, 0, 0);
        
        if (birthDate > today || birthDate < maxDate) return '';
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
        
        return age > 0 ? age : '';
    } catch (e) {
        return '';
    }
}

// Buka modal dengan detail data
function openDetailModal(rowData) {
    selectedRowData = rowData;
    const modal = document.getElementById('detailModal');
    const detailInfo = document.getElementById('detailInfo');
    
    // Cek apakah data sudah di-input
    const isSubmitted = checkIfSubmitted(rowData);
    
    // Tampilkan detail data
    const detailHTML = `
        <div class="detail-info-item">
            <span class="detail-info-label">Nama Kader:</span>
            <span class="detail-info-value">${escapeHtml(rowData['Nama kader'] || '-')}</span>
        </div>
        <div class="detail-info-item">
            <span class="detail-info-label">Nama KK:</span>
            <span class="detail-info-value">${escapeHtml(rowData['Nama KK'] || '-')}</span>
        </div>
        <div class="detail-info-item">
            <span class="detail-info-label">Nama Istri:</span>
            <span class="detail-info-value">${escapeHtml(rowData['Nama Istri'] || '-')}</span>
        </div>
        <div class="detail-info-item">
            <span class="detail-info-label">Tanggal Lahir Istri:</span>
            <span class="detail-info-value">${escapeHtml(formatTanggalLahir(rowData['Tanggal Lahir Istri']) || '-')}</span>
        </div>
        <div class="detail-info-item">
            <span class="detail-info-label">Umur Istri:</span>
            <span class="detail-info-value">${escapeHtml(calculateAge(rowData['Tanggal Lahir Istri']) || '-')} tahun</span>
        </div>
        ${isSubmitted ? `
        <div class="detail-info-item" style="background: #d4edda; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #28a745;">
            <span class="detail-info-label" style="color: #155724; font-weight: 700;">Status:</span>
            <span class="detail-info-value" style="color: #155724; font-weight: 700;">✓ Sudah Di-input</span>
        </div>
        ` : ''}
    `;
    
    detailInfo.innerHTML = detailHTML;
    
    // Isi form dengan data yang sudah ada (jika sudah di-input)
    const existingDataInfo = document.getElementById('existingDataInfo');
    if (isSubmitted) {
        fillFormWithExistingData(rowData);
        if (existingDataInfo) {
            existingDataInfo.style.display = 'block';
        }
    } else {
        resetForm();
        if (existingDataInfo) {
            existingDataInfo.style.display = 'none';
        }
    }
    
    // Update button submit text
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = isSubmitted ? 'Update Data' : 'Kirim Data';
    
    // Tampilkan modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Format tanggal lahir helper
function formatTanggalLahir(tanggalLahir) {
    if (!tanggalLahir) return '';
    
    try {
        const preprocessed = preprocessTanggalLahir(tanggalLahir);
        if (preprocessed) {
            return preprocessed.formatted;
        }
        return tanggalLahir;
    } catch (e) {
        return tanggalLahir;
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('kbForm');
    form.reset();
    
    // Reset conditional groups
    document.getElementById('pesertaKBGroup').classList.add('hidden');
    document.getElementById('bukanPesertaKBGroup').classList.add('hidden');
    
    // Reset required attributes
    document.querySelectorAll('input[name="jenisKB"]').forEach(radio => {
        radio.required = false;
    });
    document.querySelectorAll('input[name="kategori"]').forEach(radio => {
        radio.required = false;
    });
    
    // Reset textarea
    document.getElementById('keterangan').value = '';
}

// Isi form dengan data yang sudah ada
function fillFormWithExistingData(rowData) {
    // Reset form dulu
    resetForm();
    
    // Cek status KB berdasarkan kolom yang ada
    const pesertaKBColumns = ['IUD', 'MOP', 'MOW', 'IMP', 'STK', 'PIL'];
    const bukanPesertaKBColumns = ['KDM', 'HAMIL', 'IAS', 'IAT', 'TIAL'];
    
    let statusKB = '';
    let detailKB = '';
    
    // Cek apakah ada kolom Peserta KB yang diisi
    for (const col of pesertaKBColumns) {
        if (rowData[col] === '✓' || rowData[col] === '✓') {
            statusKB = 'Peserta KB';
            detailKB = col;
            break;
        }
    }
    
    // Jika belum, cek kolom Bukan Peserta KB
    if (!statusKB) {
        for (const col of bukanPesertaKBColumns) {
            if (rowData[col] === '✓' || rowData[col] === '✓') {
                statusKB = 'Bukan Peserta KB';
                detailKB = col;
                break;
            }
        }
    }
    
    // Set status KB
    if (statusKB === 'Peserta KB') {
        document.getElementById('pesertaKB').checked = true;
        document.getElementById('pesertaKBGroup').classList.remove('hidden');
        document.querySelectorAll('input[name="jenisKB"]').forEach(radio => {
            radio.required = true;
            if (radio.value === detailKB) {
                radio.checked = true;
            }
        });
    } else if (statusKB === 'Bukan Peserta KB') {
        document.getElementById('bukanPesertaKB').checked = true;
        document.getElementById('bukanPesertaKBGroup').classList.remove('hidden');
        document.querySelectorAll('input[name="kategori"]').forEach(radio => {
            radio.required = true;
            if (radio.value === detailKB) {
                radio.checked = true;
            }
        });
    }
    
    // Set keterangan
    if (rowData['Keterangan']) {
        document.getElementById('keterangan').value = rowData['Keterangan'];
    }
}

// Close modal
function closeModalHandler() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    selectedRowData = null;
    resetForm();
    
    // Sembunyikan info existing data
    const existingDataInfo = document.getElementById('existingDataInfo');
    if (existingDataInfo) {
        existingDataInfo.style.display = 'none';
    }
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!selectedRowData) {
        showError('Tidak ada data yang dipilih');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const formData = new FormData(e.target);
    
    // Validasi
    const statusKB = formData.get('statusKB');
    if (!statusKB) {
        showError('Silakan pilih Status KB terlebih dahulu');
        return;
    }
    
    let detailKB = '';
    if (statusKB === 'Peserta KB') {
        detailKB = formData.get('jenisKB');
        if (!detailKB) {
            showError('Silakan pilih Jenis KB');
            return;
        }
    } else {
        detailKB = formData.get('kategori');
        if (!detailKB) {
            showError('Silakan pilih Kategori');
            return;
        }
    }
    
    const keterangan = formData.get('keterangan') || '';
    
    // Prepare data untuk dikirim
    const dataToSubmit = {
        // Data dari row yang dipilih
        namaKader: selectedRowData['Nama kader'] || '',
        namaKK: selectedRowData['Nama KK'] || '',
        namaIstri: selectedRowData['Nama Istri'] || '',
        tanggalLahirIstri: selectedRowData['Tanggal Lahir Istri'] || '',
        umurIstri: calculateAge(selectedRowData['Tanggal Lahir Istri']) || '',
        // Data dari form
        statusKB: statusKB,
        detailKB: detailKB,
        keterangan: keterangan,
        timestamp: new Date().toISOString()
    };
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    
    try {
        // Cek konfigurasi submit URL
        if (!SUBMIT_CONFIG.APPS_SCRIPT_URL || SUBMIT_CONFIG.APPS_SCRIPT_URL.includes('YOUR_')) {
            throw new Error('Silakan konfigurasi APPS_SCRIPT_URL di file detail-input-config.js');
        }
        
        // Kirim data ke Google Apps Script sebagai form-urlencoded
        // Ini lebih kompatibel dengan Google Apps Script dan menghindari CORS preflight issues
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(dataToSubmit));
        
        // Gunakan fetch dengan method POST
        // Pastikan Google Apps Script sudah di-deploy dengan akses "Anyone"
        const response = await fetch(SUBMIT_CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        // Cek response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Baca response sebagai text dulu untuk handle berbagai format
        const responseText = await response.text();
        let result;
        
        // Log response untuk debugging (hanya di console, tidak tampilkan ke user)
        console.log('Response dari server:', responseText.substring(0, 200)); // Log 200 karakter pertama
        
        // Cek jika response adalah URL-encoded string (dimulai dengan "data=")
        if (responseText && responseText.trim().startsWith('data=')) {
            console.warn('Response adalah URL-encoded, kemungkinan error dari server');
            throw new Error('Server mengembalikan format yang tidak diharapkan. Pastikan Apps Script sudah di-deploy dengan benar dan memiliki fungsi doPost().');
        }
        
        // Coba parse sebagai JSON
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            // Jika response bukan JSON, cek apakah itu error message atau success
            console.warn('Response bukan JSON:', responseText.substring(0, 100));
            
            // Jika response kosong atau hanya whitespace, anggap success
            if (!responseText || responseText.trim() === '') {
                result = { success: true, message: 'Data berhasil dikirim (tidak ada response dari server)' };
            }
            // Jika response mengandung kata "error", "failed", atau "404", anggap error
            else if (responseText.toLowerCase().includes('error') || 
                     responseText.toLowerCase().includes('failed') ||
                     responseText.toLowerCase().includes('404') ||
                     responseText.toLowerCase().includes('not found')) {
                throw new Error('Server mengembalikan error. Pastikan:\n1. Apps Script sudah di-deploy sebagai Web App\n2. URL Apps Script sudah benar\n3. Fungsi doPost() sudah ada di Apps Script');
            }
            // Jika response adalah HTML (biasanya error page)
            else if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                throw new Error('Server mengembalikan HTML (kemungkinan error page). Pastikan Apps Script sudah di-deploy dengan benar.');
            }
            // Selain itu, anggap success (karena Apps Script mungkin return text lain)
            else {
                // Coba decode URL-encoded string jika ada
                try {
                    const decoded = decodeURIComponent(responseText);
                    result = JSON.parse(decoded);
                } catch (e) {
                    // Jika masih gagal, anggap success tapi log warning
                    console.warn('Tidak bisa parse response, anggap success:', responseText.substring(0, 50));
                    result = { success: true, message: 'Data berhasil dikirim (response tidak bisa di-parse)' };
                }
            }
        }
        
        // Cek jika result ada dan success = false
        if (result && result.success === false) {
            throw new Error(result.message || 'Gagal mengirim data');
        }
        
        // Jika result tidak ada, anggap success
        if (!result) {
            result = { success: true, message: 'Data berhasil dikirim' };
        }
        
        // Success
        const isUpdate = checkIfSubmitted(selectedRowData);
        showSuccess(isUpdate ? 'Data berhasil diupdate di spreadsheet!' : 'Data berhasil dikirim ke spreadsheet!');
        
        // Refresh data setelah submit berhasil
        setTimeout(async () => {
            try {
                await loadData();
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }, 500);
        
        // Close modal setelah 1.5 detik
        setTimeout(() => {
            closeModalHandler();
        }, 1500);
        
    } catch (error) {
        console.error('Error submitting data:', error);
        let errorMessage = error.message || 'Terjadi kesalahan saat mengirim data.';
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Gagal terhubung ke server. Pastikan:\n1. URL Apps Script sudah benar di detail-input-config.js\n2. Apps Script sudah di-deploy sebagai Web App dengan akses "Anyone"\n3. Apps Script memiliki fungsi doPost()\n4. Koneksi internet stabil';
        }
        
        // Handle JSON parse errors (kemungkinan response bukan JSON)
        if (error.message && error.message.includes('not valid JSON')) {
            errorMessage = 'Server mengembalikan response yang tidak valid. Pastikan:\n1. Apps Script sudah di-deploy ulang setelah menambahkan fungsi doPost()\n2. URL Apps Script di detail-input-config.js sudah benar\n3. Fungsi doPost() di Apps Script sudah benar (lihat docs/google-apps-script-example.js)';
        }
        
        // Tambahkan instruksi jika error terkait konfigurasi
        if (errorMessage.includes('konfigurasi') || errorMessage.includes('YOUR_')) {
            errorMessage += '\n\nSilakan edit file detail-input-config.js dan isi APPS_SCRIPT_URL dengan URL Apps Script untuk submit data.';
        }
        
        // Tampilkan error dengan format yang lebih baik (ganti \n dengan <br> untuk HTML)
        const errorMessageHTML = errorMessage.replace(/\n/g, '<br>');
        showError(errorMessageHTML);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Data';
    }
}

// Apply filters (sama seperti sub-work-app.js)
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const kaderSelect = document.getElementById('kaderSelect');
    
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedKader = kaderSelect ? kaderSelect.value : '';
    
    if (clearSearchBtn) {
        if (searchTerm.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }
    
    let tempData = currentData;
    if (selectedKader) {
        tempData = currentData.filter(row => {
            const namaKader = String(row['Nama kader'] || '').trim();
            return namaKader === selectedKader;
        });
    }
    
    if (searchTerm.length > 0) {
        filteredData = tempData.filter(row => {
            return Object.values(row).some(value => {
                const stringValue = String(value || '').toLowerCase();
                return stringValue.includes(searchTerm);
            });
        });
    } else {
        filteredData = tempData;
    }
    
    if (filteredData.length === 0) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        updateResultCount(0, currentData.length);
        
        if (searchTerm.length > 0 || selectedKader) {
            const emptyState = document.getElementById('emptyState');
            let message = '🔍 Tidak ada data yang cocok';
            if (selectedKader && searchTerm) {
                message += ` dengan filter kader "${selectedKader}" dan pencarian "${escapeHtml(searchTerm)}"`;
            } else if (selectedKader) {
                message += ` dengan filter kader "${selectedKader}"`;
            } else {
                message += ` dengan pencarian "${escapeHtml(searchTerm)}"`;
            }
            emptyState.innerHTML = '<p>' + message + '</p>';
            emptyState.style.display = 'block';
            const tableWrapper = document.querySelector('.table-wrapper');
            if (tableWrapper) {
                tableWrapper.style.display = 'none';
            }
        } else {
            showEmptyState();
        }
    } else {
        displayData(filteredData);
        hideEmptyState();
    }
}

// Handle search input
function handleSearch() {
    applyFilters();
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.value = '';
    }
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    applyFilters();
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    // Gunakan innerHTML jika message mengandung HTML, jika tidak gunakan textContent
    if (message.includes('<br>') || message.includes('<')) {
        errorMessage.innerHTML = message;
    } else {
        errorMessage.textContent = message;
    }
    errorMessage.style.display = 'block';
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('show');
}

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableWrapper = document.querySelector('.table-wrapper');
    emptyState.style.display = 'block';
    if (tableWrapper) {
        tableWrapper.style.display = 'none';
    }
}

// Hide empty state
function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableWrapper = document.querySelector('.table-wrapper');
    emptyState.style.display = 'none';
    if (tableWrapper) {
        tableWrapper.style.display = 'block';
    }
}

// Update result count
function updateResultCount(filtered, total) {
    const resultCount = document.getElementById('resultCount');
    if (filtered === total) {
        resultCount.textContent = `Menampilkan ${total} data`;
    } else {
        resultCount.textContent = `Menampilkan ${filtered} dari ${total} data`;
    }
}

// Escape HTML untuk keamanan
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
