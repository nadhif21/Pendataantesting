// Konfigurasi Link Google Form dan Apps Script untuk BKKBN Kelurahan Way Kandis
//
// CARA MENGGUNAKAN:
// 1. Untuk Google Form: Paste URL Google Form di bagian mendataUrl
// 2. Untuk Melihat Data: Buat Google Apps Script (lihat docs/google-apps-script-example.js)
//    lalu paste URL Apps Script di bagian lihatDataUrl
// 3. Setiap divisi bisa memiliki multiple cards, tambahkan object baru di array cards

const BKKBN_CONFIG = {
    // ============================================
    // KONFIGURASI CARDS PER DIVISI
    // ============================================
    
    tpk: {
        icon: '👥',
        title: 'TPK',
        subtitle: 'Tim Pendamping Keluarga',
        cards: [
            {
                id: 'pendampingan-kelompok',
                title: 'Jumlah Pendampingan Kelompok Sasaran',
                mendataUrl: 'https://forms.gle/F56XTnWVBZ8CwhGQ6',
                lihatDataUrl: 'tpk/tpk-data.html'
            }
            // Tambahkan card lain untuk TPK di sini
        ]
    },
    
    sub: {
        icon: '👨‍👩‍👧‍👦',
        title: 'SUB',
        subtitle: 'Sub Tim',
        cards: [
            {
                id: 'data-akseptor',
                title: 'Data Akseptor Sub PPKBD Kelurahan Way Kandis',
                mendataUrl: 'https://forms.gle/Wnfik3Qcxtq7pHxP7',
                lihatDataUrl: 'sub/sub-team.html'
            },
            {
                id: 'data-kerja',
                title: 'Input Data Kerja SUB PPKBD',
                mendataUrl: 'https://forms.gle/NetujLNN78VcvKR47',
                lihatDataUrl: 'sub-kerja/sub-work.html'
            }
            // Tambahkan card lain untuk SUB di sini
        ]
    }
};
