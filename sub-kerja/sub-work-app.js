// Aplikasi untuk mengambil dan menampilkan data Kerja SUB dari Google Spreadsheet

let currentData = [];
let filteredData = [];

// Daftar kader
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
    
    // Setup dropdown kader
    setupKaderDropdown();
    
    refreshBtn.addEventListener('click', loadData);
    
    // Setup search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Setup kader filter
    kaderSelect.addEventListener('change', applyFilters);
    
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

// Fungsi untuk mengambil data dari Google Spreadsheet
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
        
        // Cek konfigurasi Apps Script
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
        
        // Debug: log hasil parsing
        console.log('Data loaded successfully:', data);
        if (data.length > 0) {
            console.log('First row:', data[0]);
            console.log('Headers:', Object.keys(data[0]));
        }
        
        // Apply current filters
        applyFilters();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError(error.message || 'Terjadi kesalahan saat memuat data. Pastikan Apps Script sudah di-deploy dengan benar. Buka console (F12) untuk detail error.');
        showEmptyState();
    } finally {
        loading.style.display = 'none';
        refreshBtn.disabled = false;
    }
}

// Mengambil data dari Google Apps Script
async function loadFromAppsScript() {
    const response = await fetch(CONFIG.APPS_SCRIPT_URL);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Pastikan Apps Script sudah di-deploy dengan benar.`);
    }
    
    const json = await response.json();
    
    // Handle response format dari Apps Script
    if (json.success === false) {
        throw new Error(json.message || 'Gagal mengambil data dari Apps Script');
    }
    
    // Filter out empty rows (rows where all fields are empty)
    let data = json.data || json;
    
    // Filter rows yang semua field-nya kosong
    data = data.filter(row => {
        return Object.values(row).some(value => {
            const stringValue = String(value || '').trim();
            return stringValue.length > 0;
        });
    });
    
    // Return data
    return data;
}

// Fungsi untuk preprocessing tanggal lahir menjadi format DD-MM-YYYY
function preprocessTanggalLahir(tanggalLahir) {
    if (!tanggalLahir) return null;
    
    try {
        // Convert ke string dan trim
        let tanggalStr = String(tanggalLahir).trim();
        if (!tanggalStr) return null;
        
        // Hapus karakter non-digit dan separator yang tidak perlu
        // Biarkan hanya digit, dash (-), slash (/), dan spasi
        tanggalStr = tanggalStr.replace(/[^\d\-\/\s]/g, '');
        
        // Split berdasarkan separator
        const parts = tanggalStr.split(/[-\/\s]+/).filter(p => p.trim().length > 0);
        
        if (parts.length < 3) {
            return null;
        }
        
        // Ambil 3 bagian pertama (day, month, year)
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        // Validasi angka
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return null;
        }
        
        // Handle tahun 2 digit (misal 93 -> 1993, 23 -> 2023)
        if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
        }
        
        // Validasi range
        if (day < 1 || day > 31 || month < 1 || month > 12) {
            return null;
        }
        
        // Validasi tahun
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            return null;
        }
        
        // Format ke DD-MM-YYYY
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

// Fungsi untuk menghitung umur dari tanggal lahir
// Menggunakan preprocessing terlebih dahulu untuk memastikan format DD-MM-YYYY
function calculateAge(tanggalLahir) {
    if (!tanggalLahir) return '';
    
    try {
        // Preprocessing terlebih dahulu
        const preprocessed = preprocessTanggalLahir(tanggalLahir);
        if (!preprocessed) {
            console.warn('Preprocessing failed for:', tanggalLahir);
            return '';
        }
        
        // Gunakan data yang sudah di-preprocess
        const { day, month, year } = preprocessed;
        
        // Buat Date object (month is 0-indexed)
        const birthDate = new Date(year, month - 1, day);
        
        // Validasi: pastikan tanggal valid
        // JavaScript akan auto-correct tanggal invalid (misal 31-02 menjadi 03-03)
        // Jadi kita cek apakah tahun dan bulan masih sesuai
        const createdYear = birthDate.getFullYear();
        const createdMonth = birthDate.getMonth() + 1; // +1 karena getMonth() 0-indexed
        
        // Jika tahun atau bulan berbeda, berarti tanggal tidak valid (misal 31-02)
        if (createdYear !== year || createdMonth !== month) {
            console.warn('Date validation failed:', {
                original: tanggalLahir,
                preprocessed: preprocessed,
                created: { year: createdYear, month: createdMonth, day: birthDate.getDate() },
                input: { year, month, day }
            });
            return '';
        }
        
        // Validasi tanggal masuk akal
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 150);
        maxDate.setHours(0, 0, 0, 0);
        
        birthDate.setHours(0, 0, 0, 0);
        
        // Tanggal tidak boleh lebih dari hari ini
        if (birthDate > today) {
            return '';
        }
        
        // Tanggal tidak boleh lebih dari 150 tahun lalu
        if (birthDate < maxDate) {
            return '';
        }
        
        // Hitung umur dengan tepat sampai hari ini
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        // Jika belum ulang tahun tahun ini, kurangi 1
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
        
        return age > 0 ? age : '';
    } catch (e) {
        return '';
    }
}

// Fungsi untuk format tanggal lahir ke DD-MM-YYYY
function formatTanggalLahir(tanggalLahir) {
    if (!tanggalLahir) return '';
    
    try {
        let date;
        
        // Handle berbagai format tanggal
        if (typeof tanggalLahir === 'string') {
            // Format DD-MM-YYYY atau DD/MM/YYYY (sudah benar)
            if (/^\d{2}[-\/]\d{2}[-\/]\d{4}/.test(tanggalLahir)) {
                return tanggalLahir.replace(/\//g, '-');
            }
            // Format ISO (YYYY-MM-DD atau dengan T/Z)
            else if (tanggalLahir.includes('T') || tanggalLahir.includes('Z') || /^\d{4}-\d{2}-\d{2}/.test(tanggalLahir)) {
                date = new Date(tanggalLahir);
            }
            // Format lain
            else {
                date = new Date(tanggalLahir);
            }
        } else {
            date = new Date(tanggalLahir);
        }
        
        if (!date || isNaN(date.getTime())) {
            return tanggalLahir; // Return original if can't parse
        }
        
        // Format ke DD-MM-YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        return tanggalLahir; // Return original if error
    }
}

// Menampilkan data ke tabel
function displayData(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    const kaderSelect = document.getElementById('kaderSelect');
    
    if (data.length === 0) {
        tableBody.innerHTML = '';
        return;
    }
    
    // Cek apakah harus menampilkan kolom Nama Kader
    // Tampilkan jika "Semua Kader" dipilih (value = ""), sembunyikan jika kader spesifik dipilih
    const selectedKader = kaderSelect ? kaderSelect.value : '';
    const showKaderColumn = selectedKader === '';
    
    // Kolom yang akan ditampilkan (tanpa Timestamp dan Umur Istri)
    // Tambahkan Nama Kader jika showKaderColumn = true
    let displayHeaders = ['Nama KK', 'Nama Istri', 'Tanggal Lahir Istri'];
    if (showKaderColumn && data[0]['Nama kader'] !== undefined) {
        displayHeaders.unshift('Nama kader'); // Tambahkan di awal
    }
    
    // Mapping nama kolom untuk tampilan yang lebih baik
    const headerLabels = {
        'Nama kader': 'Nama Kader',
        'Nama KK': 'Nama KK',
        'Nama Istri': 'Nama Istri',
        'Tanggal Lahir Istri': 'Tanggal Lahir Istri',
        'Umur Istri': 'Umur Istri'
    };
    
    // Create header row - tanpa Timestamp, tambahkan Umur Istri
    tableHeader.innerHTML = '';
    displayHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] || header;
        tableHeader.appendChild(th);
    });
    // Tambahkan kolom Umur Istri (dihitung)
    const umurTh = document.createElement('th');
    umurTh.textContent = 'Umur Istri';
    tableHeader.appendChild(umurTh);
    
    // Create data rows
    tableBody.innerHTML = '';
    data.forEach((row) => {
        const tr = document.createElement('tr');
        
        // Tampilkan kolom yang dipilih
        displayHeaders.forEach(header => {
            const td = document.createElement('td');
            let cellValue = row[header] || '';
            
            // Format tanggal lahir menggunakan preprocessing
            if (header === 'Tanggal Lahir Istri' && cellValue) {
                const preprocessed = preprocessTanggalLahir(cellValue);
                if (preprocessed) {
                    cellValue = preprocessed.formatted;
                } else {
                    // Jika preprocessing gagal, coba formatTanggalLahir sebagai fallback
                    cellValue = formatTanggalLahir(cellValue);
                }
            }
            
            // Buat span untuk value agar lebih mudah di-style
            const valueSpan = document.createElement('span');
            valueSpan.className = 'cell-value';
            valueSpan.textContent = cellValue;
            td.appendChild(valueSpan);
            td.setAttribute('data-label', headerLabels[header] || header); // Untuk mobile view
            tr.appendChild(td);
        });
        
        // Tambahkan kolom Umur Istri (dihitung dari Tanggal Lahir Istri)
        const umurTd = document.createElement('td');
        // Gunakan tanggal original untuk perhitungan (preprocessing dilakukan di dalam calculateAge)
        const tanggalOriginal = row['Tanggal Lahir Istri'];
        const umurValue = calculateAge(tanggalOriginal);
        const umurSpan = document.createElement('span');
        umurSpan.className = 'cell-value';
        umurSpan.textContent = umurValue || '';
        
        // Jika umur >= 50, tambahkan class untuk styling merah
        if (umurValue && parseInt(umurValue) >= 50) {
            umurTd.classList.add('umur-high');
            umurSpan.classList.add('umur-high-text');
        }
        
        umurTd.appendChild(umurSpan);
        umurTd.setAttribute('data-label', 'Umur Istri');
        tr.appendChild(umurTd);
        
        tableBody.appendChild(tr);
    });
    
    // Update result count
    updateResultCount(data.length, currentData.length);
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
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

// Apply filters (search + kader filter)
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const kaderSelect = document.getElementById('kaderSelect');
    
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedKader = kaderSelect ? kaderSelect.value : '';
    
    // Show/hide clear button
    if (clearSearchBtn) {
        if (searchTerm.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }
    
    // Filter berdasarkan kader terlebih dahulu
    let tempData = currentData;
    if (selectedKader) {
        tempData = currentData.filter(row => {
            const namaKader = String(row['Nama kader'] || '').trim();
            return namaKader === selectedKader;
        });
    }
    
    // Filter berdasarkan search term
    if (searchTerm.length > 0) {
        filteredData = tempData.filter(row => {
            // Search in all column values
            return Object.values(row).some(value => {
                const stringValue = String(value || '').toLowerCase();
                return stringValue.includes(searchTerm);
            });
        });
    } else {
        filteredData = tempData;
    }
    
    // Display filtered data
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
    
    // Apply filters
    applyFilters();
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
