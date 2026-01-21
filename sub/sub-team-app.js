// Aplikasi untuk mengambil dan menampilkan data SUB dari Google Spreadsheet

let currentData = [];
let filteredData = [];

// Initialize aplikasi
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const kaderSelect = document.getElementById('kaderSelect');
    
    refreshBtn.addEventListener('click', loadData);
    
    // Setup search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Setup filter Kader
    if (kaderSelect) {
        kaderSelect.addEventListener('change', applyFilters);
    }
    
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
            throw new Error('Silakan konfigurasi APPS_SCRIPT_URL di file sub-team-config.js');
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
    
    // Return data (bisa dalam format {data: [...]} atau langsung array)
    return json.data || json;
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
    
    // Get semua headers dari data pertama, kecuali Timestamp
    // Jika kader spesifik dipilih, juga kecualikan Nama Kader
    let allHeaders = Object.keys(data[0]).filter(header => header !== 'Timestamp');
    if (!showKaderColumn) {
        allHeaders = allHeaders.filter(header => header !== 'Nama Kader');
    }
    
    // Mapping nama kolom untuk tampilan yang lebih baik
    const headerLabels = {
        'Nama Kader': 'Nama Kader',
        'Nama Akseptor': 'Nama Akseptor',
        'NIK': 'NIK',
        'No. HP': 'No. HP',
        'Usia': 'Usia',
        'Jumlah Anak': 'Jumlah Anak',
        'Nama Suami': 'Nama Suami'
    };
    
    // Create header row
    tableHeader.innerHTML = '';
    allHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] || header;
        tableHeader.appendChild(th);
    });
    
    // Create data rows
    tableBody.innerHTML = '';
    data.forEach((row) => {
        const tr = document.createElement('tr');
        
        // Tampilkan kolom sesuai filter
        allHeaders.forEach(header => {
            const td = document.createElement('td');
            let cellValue = row[header] || '';
            
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

// Apply filters (search dan filter kader)
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
    
    // Filter data berdasarkan semua kriteria
    filteredData = currentData.filter(row => {
        // Filter berdasarkan Nama Kader
        if (selectedKader) {
            // Cari nama kader di kolom 'Nama Kader' (case insensitive)
            const kaderValue = String(row['Nama Kader'] || '').trim();
            if (kaderValue.toLowerCase() !== selectedKader.toLowerCase()) {
                return false;
            }
        }
        
        // Filter berdasarkan search term
        if (searchTerm.length > 0) {
            const searchFound = Object.values(row).some(value => {
                const stringValue = String(value || '').toLowerCase();
                return stringValue.includes(searchTerm);
            });
            if (!searchFound) {
                return false;
            }
        }
        
        return true;
    });
    
    // Display filtered data
    if (filteredData.length === 0) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        updateResultCount(0, currentData.length);
        
        const emptyState = document.getElementById('emptyState');
        let emptyMessage = 'Tidak ada data yang cocok dengan filter yang dipilih';
        if (searchTerm.length > 0 || selectedKader) {
            emptyMessage = '🔍 Tidak ada data yang cocok dengan filter yang dipilih';
        }
        emptyState.innerHTML = '<p>' + emptyMessage + '</p>';
        emptyState.style.display = 'block';
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.style.display = 'none';
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
