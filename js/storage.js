/* ============================================
   storage.js - LocalStorage Manager (per-user)
   ============================================ */

const Storage = {
    // Generic
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem(this._key(key));
            return v ? JSON.parse(v) : fallback;
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this._key(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(this._key(key));
    },

    _key(key) {
        const userId = this.getCurrentUserId();
        return userId ? `fb_${userId}_${key}` : `fb_global_${key}`;
    },

    // Users
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem('fb_users') || '{}');
        } catch (e) {
            return {};
        }
    },

    saveUsers(users) {
        localStorage.setItem('fb_users', JSON.stringify(users));
    },

    getCurrentUserId() {
        return localStorage.getItem('fb_current_user');
    },

    setCurrentUserId(id) {
        if (id) {
            localStorage.setItem('fb_current_user', id);
        } else {
            localStorage.removeItem('fb_current_user');
        }
    },

    // Auth
    signIn(name, email, pin) {
        if (!/^\d{4}$/.test(pin)) {
            return { ok: false, error: 'invalid_pin' };
        }

        const users = this.getUsers();
        // Match by email (case-insensitive)
        const emailKey = email.toLowerCase().trim();
        let userId = null;

        // Look for existing user with same email
        for (const [id, user] of Object.entries(users)) {
            if (user.email === emailKey) {
                if (user.pin === pin) {
                    userId = id;
                } else {
                    return { ok: false, error: 'wrong_pin' };
                }
                break;
            }
        }

        // Create new user if not found
        if (!userId) {
            userId = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            users[userId] = {
                id: userId,
                name: name.trim(),
                email: emailKey,
                pin,
                createdAt: Date.now()
            };
            this.saveUsers(users);
            // Seed default categories for new user
            this.set('categories', null); // null = use defaults from categories.js
        }

        this.setCurrentUserId(userId);
        return { ok: true, user: users[userId] };
    },

    signOut() {
        this.setCurrentUserId(null);
    },

    getCurrentUser() {
        const id = this.getCurrentUserId();
        if (!id) return null;
        const users = this.getUsers();
        return users[id] || null;
    },

    // Transactions
    getTransactions() {
        return this.get('transactions', []);
    },

    saveTransactions(list) {
        return this.set('transactions', list);
    },

    addTransaction(tx) {
        const list = this.getTransactions();
        tx.id = 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        tx.createdAt = Date.now();
        list.push(tx);
        this.saveTransactions(list);
        return tx;
    },

    updateTransaction(id, updates) {
        const list = this.getTransactions();
        const idx = list.findIndex(t => t.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
        this.saveTransactions(list);
        return list[idx];
    },

    deleteTransaction(id) {
        const list = this.getTransactions().filter(t => t.id !== id);
        this.saveTransactions(list);
    },

    // Categories (returns null = use defaults)
    getCategories() {
        return this.get('categories', null);
    },

    saveCategories(list) {
        return this.set('categories', list);
    },

    addCategory(cat) {
        let list = this.getCategories();
        if (!list) list = Categories.defaults().slice();
        cat.id = 'cat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        cat.custom = true;
        list.push(cat);
        this.saveCategories(list);
        return cat;
    },

    deleteCategory(catId) {
        let list = this.getCategories();
        if (!list) return;
        list = list.filter(c => c.id !== catId);
        this.saveCategories(list);
    },

    isCategoryInUse(catId) {
        return this.getTransactions().some(t => t.categoryId === catId);
    },

    // Settings (per user)
    getSettings() {
        return this.get('settings', {
            darkMode: false,
            language: 'id',
            currency: 'IDR'
        });
    },

    saveSettings(settings) {
        return this.set('settings', settings);
    },

    // Export/Import
    exportData() {
        return {
            user: this.getCurrentUser(),
            transactions: this.getTransactions(),
            categories: this.getCategories(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    },

    importData(data) {
        if (!data || typeof data !== 'object') return false;
        try {
            if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
            if (Array.isArray(data.categories)) this.saveCategories(data.categories);
            if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    clearAllUserData() {
        const id = this.getCurrentUserId();
        if (!id) return;
        // Remove all keys with this user prefix
        const prefix = `fb_${id}_`;
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) toRemove.push(key);
        }
        toRemove.forEach(k => localStorage.removeItem(k));
    }
};