// Aplikasi BKKBN Kelurahan Way Kandis

// Fungsi untuk mendapatkan data divisi
function getDivisiData(divisi) {
    // Pastikan BKKBN_CONFIG sudah ter-load
    if (typeof BKKBN_CONFIG === 'undefined') {
        console.error('BKKBN_CONFIG belum ter-load');
        return null;
    }
    
    return BKKBN_CONFIG[divisi] || null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Tunggu sebentar untuk memastikan semua script sudah ter-load
    setTimeout(function() {
        const divisiSelect = document.getElementById('divisiSelect');
        
        if (!divisiSelect) {
            console.error('Elemen divisiSelect tidak ditemukan');
            return;
        }
        
        // Update cards saat pertama kali load
        updateCards('tpk');
        
        // Update cards saat dropdown berubah
        divisiSelect.addEventListener('change', function() {
            const selectedDivisi = this.value;
            updateCards(selectedDivisi);
        });
        
        // Validasi dan warning jika link belum dikonfigurasi
        checkConfiguration();
    }, 100);
});

// Fungsi untuk mengupdate cards berdasarkan divisi yang dipilih
function updateCards(divisi) {
    const divisiData = getDivisiData(divisi);
    const cardsContainer = document.getElementById('cardsContainer');
    
    if (!divisiData || !cardsContainer) {
        console.error('Divisi tidak ditemukan atau container tidak ada:', divisi);
        return;
    }
    
    // Clear container
    cardsContainer.innerHTML = '';
    
    // Jika tidak ada cards, tampilkan pesan
    if (!divisiData.cards || divisiData.cards.length === 0) {
        cardsContainer.innerHTML = '<div class="no-cards-message"><p>Belum ada card yang dikonfigurasi untuk divisi ini.</p></div>';
        return;
    }
    
    // Render setiap card
    divisiData.cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        cardsContainer.appendChild(cardElement);
    });
    
    // Animasi fade untuk transisi
    cardsContainer.classList.add('updating');
    setTimeout(() => {
        cardsContainer.classList.remove('updating');
    }, 300);
}

// Fungsi untuk membuat elemen card
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'menu-card';
    cardDiv.style.animationDelay = `${index * 0.1}s`;
    
    // Helper function untuk cek URL valid
    function isValidUrl(url) {
        return url && 
               url !== '#' && 
               !url.includes('YOUR_') && 
               (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('./') || url.includes('/'));
    }
    
    // Card content
    cardDiv.innerHTML = `
        <div class="menu-header">
            <h3>${card.title || 'Card'}</h3>
        </div>
        <div class="menu-actions">
            <a href="#" class="btn btn-primary card-mendata-btn" data-url="${card.mendataUrl || '#'}">
                Mendata
            </a>
            <a href="#" class="btn btn-secondary card-lihat-data-btn" data-url="${card.lihatDataUrl || '#'}">
                Melihat Data
            </a>
        </div>
    `;
    
    // Setup button events
    const btnMendata = cardDiv.querySelector('.card-mendata-btn');
    const btnLihatData = cardDiv.querySelector('.card-lihat-data-btn');
    
    // Setup Mendata button
    if (btnMendata) {
        const mendataUrl = card.mendataUrl || '#';
        if (isValidUrl(mendataUrl)) {
            btnMendata.href = mendataUrl;
            btnMendata.classList.remove('disabled');
        } else {
            btnMendata.href = '#';
            btnMendata.classList.add('disabled');
            btnMendata.onclick = function(e) {
                e.preventDefault();
                alert('Link Google Form untuk card ini belum dikonfigurasi. Silakan hubungi administrator.');
            };
        }
    }
    
    // Setup Melihat Data button
    if (btnLihatData) {
        const lihatDataUrl = card.lihatDataUrl || '#';
        if (isValidUrl(lihatDataUrl)) {
            btnLihatData.href = lihatDataUrl;
            btnLihatData.classList.remove('disabled');
        } else {
            btnLihatData.href = '#';
            btnLihatData.classList.add('disabled');
            btnLihatData.onclick = function(e) {
                e.preventDefault();
                alert('Fitur Melihat Data untuk card ini sedang dalam pengembangan. Mohon tunggu update selanjutnya.');
            };
        }
    }
    
    return cardDiv;
}

// Fungsi untuk mengecek konfigurasi
function checkConfiguration() {
    const warnings = [];
    
    if (!BKKBN_CONFIG) {
        warnings.push('BKKBN_CONFIG tidak ditemukan');
        return;
    }
    
    // Cek setiap divisi
    ['tpk', 'sub'].forEach(divisi => {
        const divisiData = BKKBN_CONFIG[divisi];
        if (!divisiData) {
            warnings.push(`Konfigurasi untuk divisi ${divisi.toUpperCase()} tidak ditemukan`);
            return;
        }
        
        if (!divisiData.cards || divisiData.cards.length === 0) {
            warnings.push(`Belum ada card yang dikonfigurasi untuk divisi ${divisi.toUpperCase()}`);
            return;
        }
        
        // Cek setiap card
        divisiData.cards.forEach((card, index) => {
            if (!card.mendataUrl || card.mendataUrl.includes('YOUR_')) {
                warnings.push(`${divisi.toUpperCase()} - Card "${card.title || index + 1}": Link Google Form belum dikonfigurasi`);
            }
            if (!card.lihatDataUrl || card.lihatDataUrl.includes('YOUR_')) {
                warnings.push(`${divisi.toUpperCase()} - Card "${card.title || index + 1}": URL Melihat Data belum dikonfigurasi`);
            }
        });
    });
    
    if (warnings.length > 0) {
        console.warn('⚠️ Konfigurasi belum lengkap:');
        warnings.forEach(warning => console.warn('  - ' + warning));
        console.log('📝 Silakan edit file homepage-config.js untuk menambahkan konfigurasi');
    }
}
