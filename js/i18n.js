/* ============================================
   i18n.js - Internationalization (ID/EN)
   ============================================ */

const TRANSLATIONS = {
    id: {
        // Splash & Auth
        splash_subtitle: 'Catatan keuangan pribadi',
        auth_welcome: 'Selamat Datang',
        auth_subtitle: 'Masuk untuk mulai mencatat keuangan Anda.',
        auth_name: 'Nama',
        auth_email: 'Email',
        auth_pin: 'PIN',
        auth_pin_hint: 'PIN 4 digit untuk melindungi data Anda di perangkat ini',
        auth_enter: 'Lanjutkan',
        auth_hint: 'Data tersimpan aman di perangkat Anda',

        // Navigation
        nav_dashboard: 'Dashboard',
        nav_transactions: 'Transaksi',
        nav_add: 'Tambah',
        nav_categories: 'Kategori',
        nav_reports: 'Laporan',
        nav_settings: 'Pengaturan',
        logout: 'Keluar',
        app_name: 'Finance Buddy',

        // Dashboard
        dash_balance: 'Saldo Saat Ini',
        dash_income: 'Pemasukan',
        dash_expense: 'Pengeluaran',
        dash_chart_title: '7 Hari Terakhir',
        dash_recent: 'Transaksi Terbaru',
        dash_view_all: 'Lihat semua',
        quick_income: 'Pemasukan',
        quick_expense: 'Pengeluaran',

        // Transactions
        search_placeholder: 'Cari transaksi...',
        filter_all: 'Semua',
        filter_income: 'Masuk',
        filter_expense: 'Keluar',
        empty_transactions: 'Belum ada transaksi',
        empty_text: 'Mulai catat transaksi pertama Anda',
        empty_add: 'Tambah Sekarang',
        tx_no_category: 'Tanpa Kategori',
        tx_no_note: '(Tanpa catatan)',

        // Form
        add_title: 'Tambah Transaksi',
        edit_title: 'Edit Transaksi',
        delete_transaction: 'Hapus Transaksi',
        type_expense: 'Pengeluaran',
        type_income: 'Pemasukan',
        form_category: 'Kategori',
        form_date: 'Tanggal',
        form_note: 'Catatan (opsional)',
        form_receipt: 'Struk/Nota (opsional)',
        receipt_upload: 'Unggah Struk',
        receipt_view: 'Lihat Struk',
        receipt_remove: 'Hapus Struk',
        cancel: 'Batal',
        save: 'Simpan',

        // Categories
        cat_expense_title: 'Kategori Pengeluaran',
        cat_income_title: 'Kategori Pemasukan',
        cat_add: 'Tambah Kategori',
        cat_delete_confirm: 'Hapus kategori ini?',
        cat_in_use: 'Kategori sedang dipakai',

        // Reports
        report_category: 'Pengeluaran per Kategori',
        report_breakdown: 'Rincian',
        report_empty: 'Belum ada data bulan ini',

        // Settings
        settings_appearance: 'Tampilan',
        settings_theme: 'Mode Gelap',
        settings_theme_desc: 'Nyaman untuk mata di malam hari',
        settings_lang: 'Bahasa',
        settings_lang_desc: 'Pilih bahasa antarmuka',
        settings_data: 'Data',
        settings_export: 'Ekspor JSON',
        settings_export_desc: 'Cadangkan semua data sebagai file JSON',
        settings_export_excel: 'Ekspor ke Excel',
        settings_export_excel_desc: 'Pilih rentang tanggal dan unduh file .xlsx',
        settings_import: 'Impor Data',
        settings_import_desc: 'Pulihkan dari file JSON',
        settings_clear: 'Hapus Semua Data',
        settings_clear_desc: 'Tindakan ini tidak dapat dibatalkan',
        settings_about: 'Tentang',
        settings_about_text: 'Catatan keuangan minimalis. Berjalan di perangkat Anda, siap menjadi aplikasi Android.',
        footer_note: 'Berjalan sepenuhnya di perangkat Anda',

        // Excel export
        excel_title: 'Ekspor ke Excel',
        excel_subtitle: 'Pilih rentang tanggal untuk data yang akan diekspor',
        excel_from: 'Dari Tanggal',
        excel_to: 'Sampai Tanggal',
        excel_quick_all: 'Semua',
        excel_quick_month: 'Bulan Ini',
        excel_quick_last_month: 'Bulan Lalu',
        excel_quick_3months: '3 Bulan',
        excel_quick_year: 'Tahun Ini',
        excel_preview: 'Pratinjau',
        excel_count: 'Jumlah Transaksi',
        excel_income: 'Total Pemasukan',
        excel_expense: 'Total Pengeluaran',
        excel_balance: 'Saldo',
        excel_sheets: 'Sheet yang akan dibuat',
        excel_sheet_tx: 'Transaksi — detail semua data',
        excel_sheet_summary: 'Ringkasan — total keseluruhan',
        excel_sheet_category: 'Per Kategori — pengelompokan',
        excel_sheet_month: 'Per Bulan — trend bulanan',
        excel_export: 'Ekspor',
        excel_export_success: 'File Excel berhasil diunduh',
        excel_no_data: 'Tidak ada transaksi dalam rentang tanggal ini',
        excel_invalid_range: 'Tanggal "dari" harus sebelum tanggal "sampai"',
        excel_required: 'Wajib diisi',

        // Confirmations
        confirm_clear: 'Yakin ingin menghapus SEMUA data? Tindakan ini tidak bisa dibatalkan!',
        confirm_logout: 'Yakin ingin keluar?',

        // Greetings
        greet_morning: 'Selamat pagi',
        greet_afternoon: 'Selamat siang',
        greet_evening: 'Selamat sore',
        greet_night: 'Selamat malam',
        greet_subtitle_morning: 'Semoga harimu menyenangkan',
        greet_subtitle_afternoon: 'Yuk cek keuangan hari ini',
        greet_subtitle_evening: 'Waktu yang tepat untuk evaluasi',
        greet_subtitle_night: 'Istirahat yang cukup',

        // Toast
        toast_saved: 'Tersimpan',
        toast_deleted: 'Terhapus',
        toast_exported: 'Data diekspor',
        toast_imported: 'Data diimpor',
        toast_cleared: 'Semua data dihapus',
        toast_welcome: 'Selamat datang kembali',
        toast_invalid_pin: 'PIN harus 4 digit',
        toast_amount_invalid: 'Nominal tidak valid',
        toast_select_category: 'Pilih kategori',
        toast_select_date: 'Pilih tanggal',
    },
    en: {
        splash_subtitle: 'Personal finance tracker',
        auth_welcome: 'Welcome',
        auth_subtitle: 'Sign in to start tracking your finances.',
        auth_name: 'Name',
        auth_email: 'Email',
        auth_pin: 'PIN',
        auth_pin_hint: '4-digit PIN to protect your data on this device',
        auth_enter: 'Continue',
        auth_hint: 'Your data is securely stored on your device',

        nav_dashboard: 'Dashboard',
        nav_transactions: 'Transactions',
        nav_add: 'Add',
        nav_categories: 'Categories',
        nav_reports: 'Reports',
        nav_settings: 'Settings',
        logout: 'Sign Out',
        app_name: 'Finance Buddy',

        dash_balance: 'Current Balance',
        dash_income: 'Income',
        dash_expense: 'Expense',
        dash_chart_title: 'Last 7 Days',
        dash_recent: 'Recent Transactions',
        dash_view_all: 'View all',
        quick_income: 'Income',
        quick_expense: 'Expense',

        search_placeholder: 'Search transactions...',
        filter_all: 'All',
        filter_income: 'In',
        filter_expense: 'Out',
        empty_transactions: 'No transactions yet',
        empty_text: 'Start recording your first transaction',
        empty_add: 'Add Now',
        tx_no_category: 'Uncategorized',
        tx_no_note: '(No note)',

        add_title: 'Add Transaction',
        edit_title: 'Edit Transaction',
        delete_transaction: 'Delete Transaction',
        type_expense: 'Expense',
        type_income: 'Income',
        form_category: 'Category',
        form_date: 'Date',
        form_note: 'Note (optional)',
        form_receipt: 'Receipt/Note (optional)',
        receipt_upload: 'Upload Receipt',
        receipt_view: 'View Receipt',
        receipt_remove: 'Remove Receipt',
        cancel: 'Cancel',
        save: 'Save',

        cat_expense_title: 'Expense Categories',
        cat_income_title: 'Income Categories',
        cat_add: 'Add Category',
        cat_delete_confirm: 'Delete this category?',
        cat_in_use: 'Category is in use',

        report_category: 'Expenses by Category',
        report_breakdown: 'Breakdown',
        report_empty: 'No data for this month',

        settings_appearance: 'Appearance',
        settings_theme: 'Dark Mode',
        settings_theme_desc: 'Easier on the eyes at night',
        settings_lang: 'Language',
        settings_lang_desc: 'Choose interface language',
        settings_data: 'Data',
        settings_export: 'Export JSON',
        settings_export_desc: 'Backup all data as a JSON file',
        settings_export_excel: 'Export to Excel',
        settings_export_excel_desc: 'Pick a date range and download .xlsx',
        settings_import: 'Import Data',
        settings_import_desc: 'Restore from a JSON file',
        settings_clear: 'Delete All Data',
        settings_clear_desc: 'This action cannot be undone',
        settings_about: 'About',
        settings_about_text: 'A minimalist finance tracker. Runs on your device, ready to become an Android app.',
        footer_note: 'Runs entirely on your device',

        // Excel export
        excel_title: 'Export to Excel',
        excel_subtitle: 'Pick a date range to export',
        excel_from: 'From Date',
        excel_to: 'To Date',
        excel_quick_all: 'All Time',
        excel_quick_month: 'This Month',
        excel_quick_last_month: 'Last Month',
        excel_quick_3months: '3 Months',
        excel_quick_year: 'This Year',
        excel_preview: 'Preview',
        excel_count: 'Transactions',
        excel_income: 'Total Income',
        excel_expense: 'Total Expense',
        excel_balance: 'Balance',
        excel_sheets: 'Sheets to be created',
        excel_sheet_tx: 'Transactions — detailed data',
        excel_sheet_summary: 'Summary — totals',
        excel_sheet_category: 'By Category — grouped',
        excel_sheet_month: 'By Month — monthly trend',
        excel_export: 'Export',
        excel_export_success: 'Excel file downloaded',
        excel_no_data: 'No transactions in this date range',
        excel_invalid_range: '"From" date must be before "To" date',
        excel_required: 'Required',

        confirm_clear: 'Are you sure you want to delete ALL data? This cannot be undone!',
        confirm_logout: 'Are you sure you want to sign out?',

        greet_morning: 'Good morning',
        greet_afternoon: 'Good afternoon',
        greet_evening: 'Good evening',
        greet_night: 'Good night',
        greet_subtitle_morning: 'Have a wonderful day',
        greet_subtitle_afternoon: 'Let\'s check your finances',
        greet_subtitle_evening: 'A good time to review',
        greet_subtitle_night: 'Get some rest',

        toast_saved: 'Saved',
        toast_deleted: 'Deleted',
        toast_exported: 'Data exported',
        toast_imported: 'Data imported',
        toast_cleared: 'All data cleared',
        toast_welcome: 'Welcome back',
        toast_invalid_pin: 'PIN must be 4 digits',
        toast_amount_invalid: 'Invalid amount',
        toast_select_category: 'Please select a category',
        toast_select_date: 'Please select a date',
    }
};

const I18n = {
    current: 'id',
    currency: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },

    init() {
        const saved = localStorage.getItem('fb_language');
        if (saved && TRANSLATIONS[saved]) {
            this.current = saved;
        }
        if (this.current === 'en') {
            this.currency = { code: 'USD', symbol: '$', locale: 'en-US' };
        }
        this.applyTranslations();
    },

    t(key) {
        return (TRANSLATIONS[this.current] && TRANSLATIONS[this.current][key]) ||
               (TRANSLATIONS.en[key]) ||
               key;
    },

    setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.current = lang;
        localStorage.setItem('fb_language', lang);
        if (lang === 'en') {
            this.currency = { code: 'USD', symbol: '$', locale: 'en-US' };
        } else {
            this.currency = { code: 'IDR', symbol: 'Rp', locale: 'id-ID' };
        }
        this.applyTranslations();
        document.documentElement.lang = this.current;
        document.dispatchEvent(new CustomEvent('languageChanged'));
    },

    applyTranslations() {
        document.documentElement.lang = this.current;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    },

    formatMoney(amount) {
        if (this.current === 'id') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }
    },

    formatMoneyCompact(amount) {
        const abs = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';
        if (this.current === 'id') {
            if (abs >= 1_000_000_000) return `${sign}Rp ${(abs/1_000_000_000).toFixed(1)}M`;
            if (abs >= 1_000_000) return `${sign}Rp ${(abs/1_000_000).toFixed(1)}jt`;
            if (abs >= 1_000) return `${sign}Rp ${(abs/1_000).toFixed(0)}rb`;
            return `${sign}Rp ${abs}`;
        } else {
            if (abs >= 1_000_000) return `${sign}$${(abs/1_000_000).toFixed(1)}M`;
            if (abs >= 1_000) return `${sign}$${(abs/1_000).toFixed(1)}k`;
            return `${sign}$${abs.toFixed(0)}`;
        }
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        if (this.current === 'id') {
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatMonth(date) {
        if (this.current === 'id') {
            return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    },

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 11) return this.t('greet_morning');
        if (hour < 15) return this.t('greet_afternoon');
        if (hour < 19) return this.t('greet_evening');
        return this.t('greet_night');
    },

    getGreetingSubtitle() {
        const hour = new Date().getHours();
        if (hour < 11) return this.t('greet_subtitle_morning');
        if (hour < 15) return this.t('greet_subtitle_afternoon');
        if (hour < 19) return this.t('greet_subtitle_evening');
        return this.t('greet_subtitle_night');
    }
};