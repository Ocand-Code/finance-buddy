/* ============================================
   app.js - Main application logic
   ============================================ */

const App = {
    currentPage: 'dashboard',
    currentTxType: 'expense',
    editingTxId: null,
    reportsDate: new Date(),
    filterType: 'all',
    searchQuery: '',
    balanceVisible: true,
    actualBalance: 0,

    init() {
        I18n.init();

        setTimeout(() => {
            document.getElementById('splash').classList.add('fade-out');
            setTimeout(() => {
                const sp = document.getElementById('splash');
                if (sp) sp.remove();
            }, 500);
            this.bootApp();
        }, 800);

        this.registerSW();

        // Listen for XLSX load failure
        document.addEventListener('xlsxLoadFailed', () => {
            console.error('[App] XLSX library failed to load from both local and CDN');
        });

        // Handle share target (when app receives shared content from other apps)
        this.handleShareTarget();
    },

    /* ---------------- Share Target Handler ---------------- */
    handleShareTarget() {
        // Method 1: Modern Web Share Target API (for PWA share target)
        // The web app receives a POST request with shared data when launched via share

        // For GET-based share target, we read URL params
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');

        // Check for share target params (sent via GET when no files)
        const sharedTitle = urlParams.get('title') || urlParams.get('sharedTitle');
        const sharedText = urlParams.get('text') || urlParams.get('sharedText');
        const sharedUrl = urlParams.get('url') || urlParams.get('sharedUrl');

        if (action === 'add' || (sharedTitle || sharedText)) {
            // Wait for app to be ready, then open add page with pre-filled data
            const setupShareData = () => {
                if (sharedTitle || sharedText) {
                    setTimeout(() => {
                        // Open add transaction page
                        this.editingTxId = null;
                        this.currentTxType = 'expense';
                        this.openAddPage();

                        // Pre-fill note with shared text
                        const noteField = document.getElementById('txNote');
                        if (noteField && (sharedText || sharedTitle)) {
                            noteField.value = [sharedTitle, sharedText].filter(Boolean).join(' - ');
                        }

                        // Show toast
                        this.toast(
                            I18n.current === 'id'
                                ? 'Data dari share diterima'
                                : 'Shared data received',
                            'success'
                        );
                    }, 1200); // Wait for splash to finish
                }
            };

            // Hook into bootApp
            const originalBoot = this.bootApp.bind(this);
            this.bootApp = () => {
                originalBoot();
                setupShareData();
            };
        }

        // Method 2: Listen for launchQueue events (newer API)
        if ('launchQueue' in window) {
            window.launchQueue.setConsumer((launchParams) => {
                if (launchParams.files && launchParams.files.length > 0) {
                    const file = launchParams.files[0];
                    console.log('[Share Target] Received file:', file.name, file.type);
                    // For now, just notify user
                    setTimeout(() => {
                        this.toast(
                            I18n.current === 'id'
                                ? `File diterima: ${file.name}`
                                : `File received: ${file.name}`,
                            'success'
                        );
                    }, 1500);
                }
            });
        }
    },

    bootApp() {
        const user = Storage.getCurrentUser();
        if (user) {
            this.showApp();
        } else {
            this.showAuth();
        }
        this.bindGlobalEvents();
    },

    /* ---------------- Auth ---------------- */
    showAuth() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    },

    showApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        const user = Storage.getCurrentUser();
        if (user) {
            const initial = user.name.charAt(0).toUpperCase();
            document.getElementById('userAvatar').textContent = initial;
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
        }

        this.applyUserSettings();
        this.navigate('dashboard');
    },

    applyUserSettings() {
        const s = Storage.getSettings();
        document.documentElement.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
        document.getElementById('darkModeToggle').checked = !!s.darkMode;
        document.getElementById('langSelect').value = I18n.current;
    },

    /* ---------------- Global Events ---------------- */
    bindGlobalEvents() {
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        // Page navigation (sidebar + transactions link)
        document.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const page = el.getAttribute('data-page');
                if (el.hasAttribute('data-action')) {
                    const action = el.getAttribute('data-action');
                    if (action === 'add' || action === 'add-income' || action === 'add-expense') {
                        if (action === 'add-income') this.currentTxType = 'income';
                        else if (action === 'add-expense') this.currentTxType = 'expense';
                        this.editingTxId = null;
                        this.openAddPage();
                        return;
                    }
                }
                this.navigate(page);
                this.closeSidebar();
            });
        });

        // Sidebar
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());

        // Language button
        document.getElementById('langBtn').addEventListener('click', () => {
            I18n.setLanguage(I18n.current === 'id' ? 'en' : 'id');
            const s = Storage.getSettings();
            s.language = I18n.current;
            Storage.saveSettings(s);
            document.getElementById('langSelect').value = I18n.current;
            this.updateHeaderTitle();
            this.refreshCurrentPage();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm(I18n.t('confirm_logout'))) {
                Storage.signOut();
                location.reload();
            }
        });

        // Type selector
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentTxType = btn.getAttribute('data-type');
                this.editingTxId = null;
                document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderCategoryPicker();
                document.getElementById('formCurrency').textContent = I18n.currency.symbol;
            });
        });

        // Form submit
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });

        // Cancel
        document.getElementById('cancelBtn').addEventListener('click', () => this.navigate('transactions'));

        // Delete button
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (!this.editingTxId) return;
            this.deleteTransaction(this.editingTxId);
            this.editingTxId = null;
        });

        // Default date today
        document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);

        // Number formatting hint on amount field
        const amountInput = document.getElementById('txAmount');
        amountInput.addEventListener('blur', () => {
            const val = parseFloat(amountInput.value);
            if (!isNaN(val) && val > 0) {
                amountInput.value = val;
            }
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderTransactions();
        });

        // Filter tabs
        document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterType = tab.getAttribute('data-filter');
                this.renderTransactions();
            });
        });

        // Reports navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.reportsDate.setMonth(this.reportsDate.getMonth() - 1);
            this.renderReports();
        });
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.reportsDate.setMonth(this.reportsDate.getMonth() + 1);
            this.renderReports();
        });

        // Balance toggle
        document.getElementById('balanceToggle').addEventListener('click', () => {
            this.balanceVisible = !this.balanceVisible;
            this.updateBalanceDisplay();
        });

        // Settings
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            const s = Storage.getSettings();
            s.darkMode = e.target.checked;
            Storage.saveSettings(s);
            document.documentElement.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
            this.refreshCharts();
        });
        document.getElementById('langSelect').addEventListener('change', (e) => {
            I18n.setLanguage(e.target.value);
            const s = Storage.getSettings();
            s.language = I18n.current;
            Storage.saveSettings(s);
            this.updateHeaderTitle();
            this.refreshCurrentPage();
        });

        // Data
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.showExcelExportModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e.target.files[0]));
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllData());

        // Categories page
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showAddCategoryModal());

        // Modal
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal());

        // Re-render on language change
        document.addEventListener('languageChanged', () => {
            this.updateHeaderTitle();
            this.refreshCurrentPage();
        });

        // Re-render charts on resize
        window.addEventListener('resize', () => this.refreshCharts());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!document.getElementById('modal').classList.contains('hidden')) {
                    this.closeModal();
                } else if (document.getElementById('sidebar').classList.contains('open')) {
                    this.closeSidebar();
                }
            }
        });
    },

    handleAuth() {
        const name = document.getElementById('authName').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const pin = document.getElementById('authPin').value;

        if (!/^\d{4}$/.test(pin)) {
            this.toast(I18n.t('toast_invalid_pin'), 'error');
            return;
        }

        const result = Storage.signIn(name, email, pin);
        if (!result.ok) {
            if (result.error === 'wrong_pin') {
                this.toast(I18n.current === 'id' ? 'PIN salah untuk email ini' : 'Wrong PIN for this email', 'error');
            } else {
                this.toast(I18n.t('toast_invalid_pin'), 'error');
            }
            return;
        }

        this.toast(I18n.t('toast_welcome'), 'success');
        setTimeout(() => this.showApp(), 300);
    },

    /* ---------------- Sidebar ---------------- */
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('open');
    },
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    },

    /* ---------------- Navigation ---------------- */
    navigate(page) {
        // When navigating via menu/sidebar, always start fresh form (not editing)
        if (page === 'add') {
            this.editingTxId = null;
            this.currentTxType = 'expense';
            this.openAddPage();
            this.closeSidebar();
            return;
        }

        this.editingTxId = null;
        this.currentPage = page;

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) target.classList.add('active');

        // Update bottom nav
        document.querySelectorAll('.bottom-nav-item, .bottom-nav-fab').forEach(i => i.classList.remove('active'));
        const bn = document.querySelector(`.bottom-nav-item[data-page="${page}"], .bottom-nav-fab[data-page="${page}"]`);
        if (bn) bn.classList.add('active');

        // Update sidebar nav
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const sn = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (sn) sn.classList.add('active');

        if (page === 'transactions') {
            this.searchQuery = '';
            document.getElementById('searchInput').value = '';
        }

        this.renderPage(page);
        this.updateHeaderTitle();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderPage(page) {
        switch (page) {
            case 'dashboard': this.renderDashboard(); break;
            case 'transactions': this.renderTransactions(); break;
            case 'categories': this.renderCategories(); break;
            case 'reports': this.renderReports(); break;
        }
    },

    updateHeaderTitle() {
        const titleEl = document.getElementById('headerPageTitle');
        if (!titleEl) return;
        const map = {
            dashboard: 'nav_dashboard',
            transactions: 'nav_transactions',
            add: this.editingTxId ? 'edit_title' : 'add_title',
            categories: 'nav_categories',
            reports: 'nav_reports',
            settings: 'nav_settings'
        };
        const key = map[this.currentPage] || 'nav_dashboard';
        titleEl.textContent = I18n.t(key);
    },

    refreshCurrentPage() {
        if (this.currentPage === 'add') {
            this.updateHeaderTitle();
            return;
        }
        this.renderPage(this.currentPage);
        this.updateHeaderTitle();
    },

    refreshCharts() {
        if (this.currentPage === 'dashboard') {
            this.renderWeeklyChart();
        } else if (this.currentPage === 'reports') {
            this.renderReportsCharts();
        }
    },

    /* ---------------- Dashboard ---------------- */
    renderDashboard() {
        const txs = Storage.getTransactions();

        // Greeting
        const user = Storage.getCurrentUser();
        const firstName = user ? user.name.split(' ')[0] : '';
        document.getElementById('greetingText').textContent = `${I18n.getGreeting()}, ${firstName}`;
        document.getElementById('greetingSubtitle').textContent = I18n.getGreetingSubtitle();

        // Totals
        const now = new Date();
        const monthTxs = txs.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });

        const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        this.actualBalance = totalIncome - totalExpense;
        this.updateBalanceDisplay();

        document.getElementById('monthIncome').textContent = I18n.formatMoneyCompact(monthIncome);
        document.getElementById('monthExpense').textContent = I18n.formatMoneyCompact(monthExpense);

        // Recent
        const recent = [...txs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);
        const recentEl = document.getElementById('recentTransactions');
        recentEl.innerHTML = recent.length
            ? recent.map(t => this.txRowHTML(t)).join('')
            : `<div class="empty-state" style="padding:24px"><div class="empty-illustration"><svg width="60" height="60" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="currentColor" opacity="0.08"/><path d="M28 32h24M28 40h24M28 48h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/></svg></div><h3 class="empty-title">${I18n.t('empty_transactions')}</h3><p class="empty-text">${I18n.t('empty_text')}</p></div>`;

        recentEl.querySelectorAll('.transaction-item').forEach(el => {
            el.addEventListener('click', () => this.editTransaction(el.getAttribute('data-id')));
        });

        // Chart
        this.renderWeeklyChart();
    },

    updateBalanceDisplay() {
        const el = document.getElementById('balanceAmount');
        el.textContent = this.balanceVisible ? I18n.formatMoney(this.actualBalance) : '••••••••';
    },

    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        const data = Charts.getWeeklyData(Storage.getTransactions());
        Charts.renderWeekly(canvas, data);
    },

    /* ---------------- Transactions ---------------- */
    renderTransactions() {
        let txs = Storage.getTransactions();
        const listEl = document.getElementById('transactionsList');
        const emptyEl = document.getElementById('emptyState');

        if (this.filterType !== 'all') {
            txs = txs.filter(t => t.type === this.filterType);
        }

        if (this.searchQuery) {
            txs = txs.filter(t => {
                const cat = Categories.getById(t.categoryId);
                const label = cat ? Categories.getLabel(cat) : '';
                const haystack = `${t.note || ''} ${label} ${t.amount}`.toLowerCase();
                return haystack.includes(this.searchQuery);
            });
        }

        txs.sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        if (txs.length === 0) {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');
        listEl.innerHTML = txs.map(t => this.txRowHTML(t)).join('');

        listEl.querySelectorAll('.transaction-item').forEach(el => {
            el.addEventListener('click', () => this.editTransaction(el.getAttribute('data-id')));
        });
    },

    txRowHTML(tx) {
        const cat = Categories.getById(tx.categoryId);
        const icon = cat ? Categories.getIcon(cat) : '📦';
        const label = cat ? Categories.getLabel(cat) : I18n.t('tx_no_category');
        const note = tx.note ? ` • ${tx.note}` : '';
        const sign = tx.type === 'income' ? '+' : '−';
        return `
            <div class="transaction-item" data-id="${tx.id}">
                <div class="transaction-icon ${tx.type}">${icon}</div>
                <div class="transaction-info">
                    <div class="transaction-title">${this._escapeHTML(label)}${note}</div>
                    <div class="transaction-meta">${I18n.formatDate(tx.date)}</div>
                </div>
                <div class="transaction-amount ${tx.type}">${sign} ${I18n.formatMoney(tx.amount)}</div>
            </div>
        `;
    },

    _escapeHTML(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    },

    /* ---------------- Add/Edit Transaction ---------------- */
    openAddPage() {
        this.currentPage = 'add';
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-add').classList.add('active');

        document.querySelectorAll('.bottom-nav-item, .bottom-nav-fab').forEach(i => i.classList.remove('active'));
        const bn = document.querySelector(`.bottom-nav-fab[data-page="add"]`);
        if (bn) bn.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const sn = document.querySelector(`.nav-item[data-page="add"]`);
        if (sn) sn.classList.add('active');

        if (this.editingTxId) {
            const tx = Storage.getTransactions().find(t => t.id === this.editingTxId);
            if (tx) {
                document.getElementById('txId').value = tx.id;
                document.getElementById('txAmount').value = tx.amount;
                document.getElementById('txDate').value = tx.date;
                document.getElementById('txNote').value = tx.note || '';
                document.getElementById('txCategory').value = tx.categoryId || '';
                this.currentTxType = tx.type;
            } else {
                this.editingTxId = null;
                this.resetForm();
            }
        } else {
            this.resetForm();
        }

        document.querySelectorAll('.segment-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-type') === this.currentTxType);
        });

        document.getElementById('formCurrency').textContent = I18n.currency.symbol;
        this.renderCategoryPicker();
        // Show/hide delete button based on edit mode
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.classList.toggle('hidden', !this.editingTxId);
        }
        this.updateHeaderTitle();
    },

    resetForm() {
        document.getElementById('txId').value = '';
        document.getElementById('txAmount').value = '';
        document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
        document.getElementById('txNote').value = '';
        document.getElementById('txCategory').value = '';
    },

    renderCategoryPicker() {
        const cats = Categories.getByType(this.currentTxType);
        const picker = document.getElementById('categoryPicker');
        const selectedId = document.getElementById('txCategory').value;

        picker.innerHTML = cats.map(c => `
            <div class="category-chip ${c.id === selectedId ? 'selected' : ''}" data-cat-id="${c.id}">
                <span class="category-chip-icon">${c.icon}</span>
                <span class="category-chip-label">${Categories.getLabel(c)}</span>
            </div>
        `).join('');

        picker.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                picker.querySelectorAll('.category-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                document.getElementById('txCategory').value = chip.getAttribute('data-cat-id');
            });
        });
    },

    saveTransaction() {
        const amount = parseFloat(document.getElementById('txAmount').value);
        const categoryId = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value;
        const note = document.getElementById('txNote').value.trim();

        if (!amount || amount <= 0) {
            this.toast(I18n.t('toast_amount_invalid'), 'error');
            return;
        }
        if (!categoryId) {
            this.toast(I18n.t('toast_select_category'), 'error');
            return;
        }
        if (!date) {
            this.toast(I18n.t('toast_select_date'), 'error');
            return;
        }

        const txData = {
            type: this.currentTxType,
            amount,
            categoryId,
            date,
            note
        };

        if (this.editingTxId) {
            Storage.updateTransaction(this.editingTxId, txData);
            this.toast(I18n.t('toast_saved'), 'success');
        } else {
            Storage.addTransaction(txData);
            this.toast(I18n.t('toast_saved'), 'success');
        }

        this.editingTxId = null;
        this.navigate('transactions');
        // Focus scroll to top
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    },

    editTransaction(id) {
        this.editingTxId = id;
        this.openAddPage();
    },

    deleteTransaction(id) {
        const txs = Storage.getTransactions();
        const tx = txs.find(t => t.id === id);
        if (!tx) return;
        const cat = Categories.getById(tx.categoryId);
        const label = cat ? Categories.getLabel(cat) : I18n.t('tx_no_category');
        const confirmMsg = I18n.current === 'id'
            ? `Hapus transaksi "${label}" sebesar ${I18n.formatMoney(tx.amount)}?`
            : `Delete transaction "${label}" of ${I18n.formatMoney(tx.amount)}?`;

        if (!confirm(confirmMsg)) return;
        Storage.deleteTransaction(id);
        this.toast(I18n.t('toast_deleted'), 'success');

        // Navigate based on where we are
        if (this.currentPage === 'add') {
            this.navigate('transactions');
        } else {
            this.refreshCurrentPage();
        }
    },

    /* ---------------- Categories Page ---------------- */
    renderCategories() {
        const allCats = Categories.getAll();
        const txs = Storage.getTransactions();
        const usageCounts = {};
        txs.forEach(t => {
            usageCounts[t.categoryId] = (usageCounts[t.categoryId] || 0) + 1;
        });

        const expEl = document.getElementById('expenseCategories');
        const incEl = document.getElementById('incomeCategories');
        expEl.innerHTML = '';
        incEl.innerHTML = '';

        const renderTile = (c) => `
            <div class="category-tile ${c.default ? 'default' : ''}" data-cat-id="${c.id}">
                <div class="category-tile-icon">${c.icon}</div>
                <div class="category-tile-label">${Categories.getLabel(c)}</div>
                <div class="category-tile-count">${usageCounts[c.id] || 0}×</div>
            </div>
        `;

        allCats.filter(c => c.type === 'expense').forEach(c => expEl.innerHTML += renderTile(c));
        allCats.filter(c => c.type === 'income').forEach(c => incEl.innerHTML += renderTile(c));

        expEl.querySelectorAll('.category-tile:not(.default)').forEach(tile => {
            tile.addEventListener('click', () => this.confirmDeleteCategory(tile.getAttribute('data-cat-id')));
        });
        incEl.querySelectorAll('.category-tile:not(.default)').forEach(tile => {
            tile.addEventListener('click', () => this.confirmDeleteCategory(tile.getAttribute('data-cat-id')));
        });
    },

    confirmDeleteCategory(catId) {
        if (Storage.isCategoryInUse(catId)) {
            this.toast(I18n.t('cat_in_use'), 'error');
            return;
        }
        if (!confirm(I18n.t('cat_delete_confirm'))) return;
        Storage.deleteCategory(catId);
        this.renderCategories();
        this.toast(I18n.t('toast_deleted'), 'success');
    },

    showAddCategoryModal() {
        const emojis = Categories.emojiOptions();
        let selectedEmoji = emojis[0];
        let selectedType = 'expense';

        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <div class="field">
                <label>${I18n.current === 'id' ? 'Tipe' : 'Type'}</label>
                <div class="segmented-control" style="margin-bottom:0">
                    <button type="button" class="segment-btn active" data-type="expense">${I18n.t('type_expense')}</button>
                    <button type="button" class="segment-btn" data-type="income">${I18n.t('type_income')}</button>
                </div>
            </div>
            <div class="field">
                <label>${I18n.current === 'id' ? 'Ikon' : 'Icon'}</label>
                <div class="emoji-grid" id="emojiGrid">
                    ${emojis.map((e, i) => `<button type="button" data-emoji="${e}" class="${i === 0 ? 'selected' : ''}">${e}</button>`).join('')}
                </div>
            </div>
            <div class="field">
                <label>${I18n.current === 'id' ? 'Nama' : 'Name'}</label>
                <input type="text" id="newCatName" maxlength="20" placeholder="${I18n.current === 'id' ? 'Misal: Hewan Peliharaan' : 'e.g., Pets'}">
            </div>
        `;

        body.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                body.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedType = btn.getAttribute('data-type');
            });
        });

        body.querySelectorAll('#emojiGrid button').forEach(b => {
            b.addEventListener('click', () => {
                body.querySelectorAll('#emojiGrid button').forEach(x => x.classList.remove('selected'));
                b.classList.add('selected');
                selectedEmoji = b.getAttribute('data-emoji');
            });
        });

        document.getElementById('modalTitle').textContent = I18n.t('cat_add');
        this.openModal();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary btn-block';
        saveBtn.style.marginTop = '16px';
        saveBtn.innerHTML = `<span>${I18n.t('save')}</span>`;
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('newCatName').value.trim();
            if (!name) {
                this.toast(I18n.current === 'id' ? 'Nama kategori wajib diisi' : 'Category name required', 'error');
                return;
            }
            Storage.addCategory({
                icon: selectedEmoji,
                type: selectedType,
                label: { id: name, en: name }
            });
            this.closeModal();
            this.renderCategories();
            this.toast(I18n.t('toast_saved'), 'success');
        });
        body.appendChild(saveBtn);
    },

    /* ---------------- Reports ---------------- */
    renderReports() {
        const label = document.getElementById('currentMonthLabel');
        if (label) label.textContent = I18n.formatMonth(this.reportsDate);
        this.renderReportsCharts();
        this.renderBreakdown();
    },

    renderReportsCharts() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        const txs = Storage.getTransactions();
        const data = Charts.getCategoryBreakdown(txs, this.reportsDate.getFullYear(), this.reportsDate.getMonth(), 'expense');
        Charts.renderCategoryBreakdown(canvas, data);
    },

    renderBreakdown() {
        const txs = Storage.getTransactions();
        const data = Charts.getCategoryBreakdown(txs, this.reportsDate.getFullYear(), this.reportsDate.getMonth(), 'expense');
        const listEl = document.getElementById('categoryBreakdown');

        if (data.length === 0) {
            listEl.innerHTML = `<div class="empty-state" style="padding:24px"><div class="empty-illustration"><svg width="60" height="60" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" fill="currentColor" opacity="0.08"/><path d="M28 32h24M28 40h24M28 48h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/></svg></div><h3 class="empty-title">${I18n.t('report_empty')}</h3></div>`;
            return;
        }

        const total = data.reduce((s, d) => s + d.value, 0);
        listEl.innerHTML = data.map(d => `
            <div class="breakdown-item">
                <div class="breakdown-icon" style="background:${d.color}15; color:${d.color}">${d.icon}</div>
                <div class="breakdown-info">
                    <div class="breakdown-name">${d.label}</div>
                    <div class="breakdown-bar">
                        <div class="breakdown-bar-fill" style="width:${(d.value / total) * 100}%; background:${d.color}"></div>
                    </div>
                </div>
                <div class="breakdown-amount">${I18n.formatMoney(d.value)}</div>
            </div>
        `).join('');
    },

    /* ---------------- Modal ---------------- */
    openModal() {
        document.getElementById('modal').classList.remove('hidden');
    },
    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        // Cleanup custom excel modal classes
        const card = document.querySelector('.modal-card');
        if (card) {
            card.classList.remove('excel-modal-content');
            const footer = card.querySelector('.excel-footer');
            if (footer) footer.remove();
        }
        // Reset title to default
        const title = document.getElementById('modalTitle');
        if (title) title.innerHTML = 'Modal';
    },

    /* ---------------- Toast ---------------- */
    toast(message, type = '') {
        const el = document.getElementById('toast');
        el.textContent = message;
        el.className = `toast ${type}`;
        el.classList.remove('hidden');
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.classList.add('hidden'), 300);
        }, 2200);
    },

    /* ---------------- Data management ---------------- */
    /* ---------------- Excel Export Modal ---------------- */
    showExcelExportModal() {
        if (typeof XLSX === 'undefined' || !ExcelExport.isAvailable()) {
            this.toast(I18n.current === 'id'
                ? 'Library Excel gagal dimuat. Coba muat ulang halaman.'
                : 'Excel library failed to load. Try reloading the page.', 'error');
            return;
        }

        // Default: this month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (d) => d.toISOString().slice(0, 10);
        const allTx = Storage.getTransactions();

        // Find earliest and latest transaction dates
        let minDate = firstDay;
        let maxDate = lastDay;
        if (allTx.length > 0) {
            const dates = allTx.map(t => t.date).sort();
            minDate = new Date(dates[0]);
            maxDate = new Date(dates[dates.length - 1]);
        }

        const state = {
            startDate: formatDate(firstDay),
            endDate: formatDate(lastDay),
            activeQuick: 'month'
        };

        const body = document.getElementById('modalBody');
        const renderBody = () => {
            const preview = ExcelExport.getPreview(state.startDate, state.endDate);
            const lang = I18n.current;

            body.innerHTML = `
                <div class="excel-section">
                    <p class="excel-section-title">${I18n.t('excel_quick_all')}</p>
                    <div class="quick-ranges">
                        <button type="button" class="quick-range ${state.activeQuick === 'all' ? 'active' : ''}" data-quick="all">${I18n.t('excel_quick_all')}</button>
                        <button type="button" class="quick-range ${state.activeQuick === 'month' ? 'active' : ''}" data-quick="month">${I18n.t('excel_quick_month')}</button>
                        <button type="button" class="quick-range ${state.activeQuick === 'last' ? 'active' : ''}" data-quick="last">${I18n.t('excel_quick_last_month')}</button>
                        <button type="button" class="quick-range ${state.activeQuick === '3m' ? 'active' : ''}" data-quick="3m">${I18n.t('excel_quick_3months')}</button>
                        <button type="button" class="quick-range ${state.activeQuick === 'year' ? 'active' : ''}" data-quick="year">${I18n.t('excel_quick_year')}</button>
                    </div>
                </div>

                <div class="excel-section">
                    <div class="date-row">
                        <div class="field">
                            <label>${I18n.t('excel_from')}</label>
                            <input type="date" id="excelStart" value="${state.startDate}" min="${formatDate(minDate)}" max="${formatDate(maxDate)}">
                        </div>
                        <div class="field">
                            <label>${I18n.t('excel_to')}</label>
                            <input type="date" id="excelEnd" value="${state.endDate}" min="${formatDate(minDate)}" max="${formatDate(maxDate)}">
                        </div>
                    </div>
                </div>

                <div class="excel-section">
                    <p class="excel-section-title">${I18n.t('excel_preview')}</p>
                    <div class="preview-box">
                        <div class="preview-row">
                            <span class="preview-label">${I18n.t('excel_count')}</span>
                            <span class="preview-value">${preview.count}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">${I18n.t('excel_income')}</span>
                            <span class="preview-value income">${I18n.formatMoney(preview.income)}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">${I18n.t('excel_expense')}</span>
                            <span class="preview-value expense">${I18n.formatMoney(preview.expense)}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">${I18n.t('excel_balance')}</span>
                            <span class="preview-value">${I18n.formatMoney(preview.balance)}</span>
                        </div>
                    </div>
                </div>

                <div class="excel-section">
                    <p class="excel-section-title">${I18n.t('excel_sheets')}</p>
                    <div class="sheets-list">
                        <div class="sheet-item">
                            <span class="sheet-item-icon">1</span>
                            <span>${I18n.t('excel_sheet_tx')}</span>
                        </div>
                        <div class="sheet-item">
                            <span class="sheet-item-icon">2</span>
                            <span>${I18n.t('excel_sheet_summary')}</span>
                        </div>
                        <div class="sheet-item">
                            <span class="sheet-item-icon">3</span>
                            <span>${I18n.t('excel_sheet_category')}</span>
                        </div>
                        <div class="sheet-item">
                            <span class="sheet-item-icon">4</span>
                            <span>${I18n.t('excel_sheet_month')}</span>
                        </div>
                    </div>
                </div>
            `;

            // Bind quick range buttons
            body.querySelectorAll('.quick-range').forEach(btn => {
                btn.addEventListener('click', () => {
                    const q = btn.getAttribute('data-quick');
                    const today = new Date();
                    let start, end;

                    if (q === 'all' && allTx.length > 0) {
                        const dates = allTx.map(t => t.date).sort();
                        start = new Date(dates[0]);
                        end = new Date(dates[dates.length - 1]);
                    } else if (q === 'month') {
                        start = new Date(today.getFullYear(), today.getMonth(), 1);
                        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    } else if (q === 'last') {
                        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        end = new Date(today.getFullYear(), today.getMonth(), 0);
                    } else if (q === '3m') {
                        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
                        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    } else if (q === 'year') {
                        start = new Date(today.getFullYear(), 0, 1);
                        end = new Date(today.getFullYear(), 11, 31);
                    }

                    if (start && end) {
                        state.startDate = formatDate(start);
                        state.endDate = formatDate(end);
                    }
                    state.activeQuick = q;
                    renderBody();
                });
            });

            // Bind date inputs
            const startInput = body.querySelector('#excelStart');
            const endInput = body.querySelector('#excelEnd');
            startInput.addEventListener('change', (e) => {
                state.startDate = e.target.value;
                state.activeQuick = '';
                renderBody();
            });
            endInput.addEventListener('change', (e) => {
                state.endDate = e.target.value;
                state.activeQuick = '';
                renderBody();
            });
        };

        renderBody();

        // Build modal with custom footer
        const modal = document.getElementById('modal');
        const modalCard = modal.querySelector('.modal-card');
        modalCard.classList.add('excel-modal-content');

        document.getElementById('modalTitle').innerHTML = `
            <div class="excel-icon-wrap" style="margin: 0 auto 8px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M8 13l3 3 5-5"/>
                </svg>
            </div>
            <div class="excel-title">${I18n.t('excel_title')}</div>
            <div class="excel-subtitle">${I18n.t('excel_subtitle')}</div>
        `;

        // Add footer
        let footer = modal.querySelector('.excel-footer');
        if (footer) footer.remove();
        footer = document.createElement('div');
        footer.className = 'excel-footer';
        footer.innerHTML = `
            <button type="button" class="btn btn-secondary" id="excelCancelBtn">${I18n.t('cancel')}</button>
            <button type="button" class="btn btn-primary" id="excelExportBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                <span>${I18n.t('excel_export')}</span>
            </button>
        `;
        modalCard.appendChild(footer);

        footer.querySelector('#excelCancelBtn').addEventListener('click', () => this.closeModal());
        footer.querySelector('#excelExportBtn').addEventListener('click', () => {
            // Validate
            if (!state.startDate || !state.endDate) {
                this.toast(I18n.t('excel_required'), 'error');
                return;
            }
            if (state.startDate > state.endDate) {
                this.toast(I18n.t('excel_invalid_range'), 'error');
                return;
            }

            const preview = ExcelExport.getPreview(state.startDate, state.endDate);
            if (preview.count === 0) {
                this.toast(I18n.t('excel_no_data'), 'error');
                return;
            }

            const result = ExcelExport.export(state.startDate, state.endDate);
            if (result && result.ok) {
                this.toast(I18n.t('excel_export_success'), 'success');
                this.closeModal();
            } else {
                this.toast('Export gagal', 'error');
            }
        });

        this.openModal();
    },

    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `finance-buddy-${date}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.toast(I18n.t('toast_exported'), 'success');
    },

    importData(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Storage.importData(data)) {
                    this.toast(I18n.t('toast_imported'), 'success');
                    this.refreshCurrentPage();
                } else {
                    this.toast(I18n.current === 'id' ? 'Gagal import' : 'Import failed', 'error');
                }
            } catch (err) {
                this.toast(I18n.current === 'id' ? 'File tidak valid' : 'Invalid file', 'error');
            }
        };
        reader.readAsText(file);
        document.getElementById('importFile').value = '';
    },

    clearAllData() {
        if (!confirm(I18n.t('confirm_clear'))) return;
        Storage.clearAllUserData();
        this.toast(I18n.t('toast_cleared'), 'success');
        setTimeout(() => location.reload(), 800);
    },

    /* ---------------- PWA ---------------- */
    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .catch(err => console.warn('SW registration failed:', err));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());