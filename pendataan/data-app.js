// Aplikasi untuk mengambil dan menampilkan data dari Google Spreadsheet

let currentData = [];
let filteredData = [];

// Initialize aplikasi
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const categorySelect = document.getElementById('categorySelect');
    
    refreshBtn.addEventListener('click', loadData);
    
    // Setup search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Setup category filter
    categorySelect.addEventListener('change', handleCategoryChange);
    
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
            throw new Error('Silakan konfigurasi APPS_SCRIPT_URL di file data-config.js');
        }
        
        // Menggunakan Google Apps Script (metode yang direkomendasikan)
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
        console.error('Error details:', error);
        showError(error.message || 'Terjadi kesalahan saat memuat data. Pastikan spreadsheet sudah di-publish atau cek konfigurasi. Buka console (F12) untuk detail error.');
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
    
    // Return data (bisa dalam format {data: [...]} atau langsung array)
    return json.data || json;
}


// Fungsi untuk mendapatkan kolom yang harus ditampilkan berdasarkan kategori
function getColumnsByCategory(kategori, allHeaders) {
    const kategoriStr = String(kategori || '').trim();
    const kategoriLower = kategoriStr.toLowerCase();
    
    // Kolom yang selalu ditampilkan
    const fixedColumns = ['Timestamp', 'PILIH PERTANYAAN'];
    
    // Tentukan range kolom berdasarkan kategori
    let categoryColumns = [];
    
    if (kategoriLower.includes('baduta') || kategoriLower.includes('balita')) {
        // Baduta dan balita: ambil kolom C-R (indeks 2-17 dari headers array)
        // Asumsikan struktur: A=Timestamp(0), B=PILIH PERTANYAAN(1), C-R=Baduta(2-17), S-AG=Ibu Hamil(18+)
        const startIndex = 2; // Kolom C (index 2, karena A=0, B=1)
        const endIndex = 18;  // Sampai kolom R (index 17, jadi endIndex = 18 untuk slice)
        categoryColumns = allHeaders.slice(startIndex, endIndex);
    } else if (kategoriLower.includes('ibu hamil') || kategoriLower.includes('hamil')) {
        // Ibu Hamil: ambil kolom S-AG (indeks 18-32 dari headers array)
        const startIndex = 18; // Kolom S (index 18)
        const endIndex = 33;   // Sampai kolom AG (index 32, jadi endIndex = 33 untuk slice)
        categoryColumns = allHeaders.slice(startIndex, endIndex);
    } else {
        // Jika kategori tidak diketahui, tampilkan semua kolom selain fixed (fallback)
        categoryColumns = allHeaders.filter(h => !fixedColumns.includes(h));
    }
    
    // Gabungkan kolom tetap dengan kolom kategori
    return [...fixedColumns, ...categoryColumns];
}

// Fungsi untuk mendapatkan kolom berdasarkan pilihan dropdown
function getDisplayColumnsBySelection(selectedCategory, allHeaders) {
    const fixedColumns = ['Timestamp', 'PILIH PERTANYAAN'];
    let categoryColumns = [];
    
    if (selectedCategory === 'baduta') {
        // Baduta dan balita: ambil kolom C-R (indeks 2-17)
        categoryColumns = allHeaders.slice(2, 18);
    } else if (selectedCategory === 'ibu-hamil') {
        // Ibu Hamil: ambil kolom S-AG (indeks 18-32)
        categoryColumns = allHeaders.slice(18, Math.min(33, allHeaders.length));
    } else {
        // Default: Baduta dan balita jika kategori tidak dikenali
        categoryColumns = allHeaders.slice(2, 18);
    }
    
    return [...fixedColumns, ...categoryColumns];
}

// Menampilkan data ke tabel
function displayData(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        // Don't show empty state here, let the caller handle it
        tableBody.innerHTML = '';
        return;
    }
    
    // Get semua headers dari data pertama untuk referensi
    const allHeaders = Object.keys(data[0]);
    
    // Ambil pilihan kategori dari dropdown
    const categorySelect = document.getElementById('categorySelect');
    const selectedCategory = categorySelect ? categorySelect.value : 'baduta';
    
    // Tentukan kolom yang akan ditampilkan berdasarkan pilihan dropdown
    const displayColumns = getDisplayColumnsBySelection(selectedCategory, allHeaders);
    
    // Mapping nama kolom untuk tampilan yang lebih baik
    const headerLabels = {
        'Timestamp': 'Waktu',
        'PILIH PERTANYAAN': 'Kategori',
        'NAMA IBU': 'Nama Ibu',
        'NIK IBU': 'NIK Ibu',
        'JENIS KB': 'Jenis KB',
        'Tanggal Lahir': 'Tanggal Lahir',
        'Umur Kandungan': 'Umur Kandungan',
        'Jenis Kelamin': 'Jenis Kelamin',
        'Anak keberapa': 'Anak Ke-',
        'Berat Bad': 'Berat Badan'
    };
    
    // Create header row
    tableHeader.innerHTML = '';
    displayColumns.forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] || header;
        tableHeader.appendChild(th);
    });
    
    // Create data rows
    tableBody.innerHTML = '';
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        const kategori = String(row['PILIH PERTANYAAN'] || '').trim();
        const kategoriLower = kategori.toLowerCase();
        
        // Tentukan kolom yang relevan untuk row ini
        let rowColumns = [];
        if (selectedCategory === 'baduta' && (kategoriLower.includes('baduta') || kategoriLower.includes('balita'))) {
            rowColumns = getColumnsByCategory(kategori, allHeaders);
        } else if (selectedCategory === 'ibu-hamil' && (kategoriLower.includes('ibu hamil') || kategoriLower.includes('hamil'))) {
            rowColumns = getColumnsByCategory(kategori, allHeaders);
        } else {
            // Kategori tidak cocok dengan filter, skip row ini (seharusnya sudah di-filter sebelumnya)
            return;
        }
        
        // Tampilkan nilai untuk setiap kolom di displayColumns
        displayColumns.forEach(header => {
            const td = document.createElement('td');
            let cellValue = '';
            
            // Tampilkan nilai jika kolom ini ada di rowColumns
            if (rowColumns.includes(header)) {
                cellValue = row[header] || '';
            }
            
            // Format khusus untuk beberapa kolom
            if (header === 'Timestamp' && cellValue) {
                // Format tanggal jika perlu
                try {
                    const date = new Date(cellValue);
                    if (!isNaN(date.getTime())) {
                        cellValue = date.toLocaleString('id-ID');
                    }
                } catch (e) {
                    // Keep original value
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

// Handle category change
function handleCategoryChange() {
    applyFilters();
}

// Apply all filters (category + search)
function applyFilters() {
    const categorySelect = document.getElementById('categorySelect');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // Show/hide clear button
    if (clearSearchBtn) {
        if (searchTerm.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }
    
    // Filter berdasarkan kategori
    let categoryFiltered = currentData.filter(row => {
        const kategori = String(row['PILIH PERTANYAAN'] || '').trim().toLowerCase();
        if (selectedCategory === 'baduta') {
            return kategori.includes('baduta') || kategori.includes('balita');
        } else if (selectedCategory === 'ibu-hamil') {
            return kategori.includes('ibu hamil') || kategori.includes('hamil');
        }
        return false;
    });
    
    // Filter berdasarkan search term
    if (searchTerm.length === 0) {
        filteredData = categoryFiltered;
    } else {
        filteredData = categoryFiltered.filter(row => {
            // Search in all column values
            return Object.values(row).some(value => {
                const stringValue = String(value || '').toLowerCase();
                return stringValue.includes(searchTerm);
            });
        });
    }
    
    // Display filtered data
    if (filteredData.length === 0) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        updateResultCount(0, currentData.length);
        
        if (searchTerm.length > 0) {
            const emptyState = document.getElementById('emptyState');
            emptyState.innerHTML = '<p>🔍 Tidak ada data yang cocok dengan pencarian "<strong>' + escapeHtml(searchTerm) + '</strong>"</p>';
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
    
    // Apply filters (termasuk category filter)
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
