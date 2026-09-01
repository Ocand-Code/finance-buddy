/* ============================================
   excel.js - Excel export with date range
   Uses SheetJS (xlsx) library — loaded locally
   ============================================ */

const ExcelExport = {
    /* ----------------------------------------
       Generate workbook with date range filter
       Uses XLSX.write (binary string) + Blob
       for maximum compatibility
       ---------------------------------------- */
    export(rangeStart, rangeEnd) {
        if (typeof XLSX === 'undefined') {
            console.error('[Excel] XLSX not loaded');
            return { ok: false, error: 'library_not_loaded' };
        }

        // Filter transactions by date range
        const allTx = Storage.getTransactions();
        const filtered = this._filterByDate(allTx, rangeStart, rangeEnd);

        if (filtered.length === 0) {
            return { ok: false, error: 'no_data', count: 0 };
        }

        try {
            // Build workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: Transactions
            const wsTx = this._buildTransactionsSheet(filtered);
            XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

            // Sheet 2: Summary
            const wsSummary = this._buildSummarySheet(filtered);
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

            // Sheet 3: By Category
            const wsByCat = this._buildByCategorySheet(filtered);
            XLSX.utils.book_append_sheet(wb, wsByCat, 'By Category');

            // Sheet 4: By Month
            const wsByMonth = this._buildByMonthSheet(filtered);
            XLSX.utils.book_append_sheet(wb, wsByMonth, 'By Month');

            // Generate filename
            const user = Storage.getCurrentUser();
            const userName = user ? user.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'user';
            const startStr = rangeStart || 'all';
            const endStr = rangeEnd || 'all';
            const filename = `finance-buddy_${userName}_${startStr}_to_${endStr}.xlsx`;

            // Write to binary string (bookType: 'xlsx' = Excel 2007+)
            // Using array buffer for better compatibility
            const wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array',
                compression: true
            });

            // Create blob and trigger download
            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            this._downloadBlob(blob, filename);

            return { ok: true, count: filtered.length, filename, size: blob.size };
        } catch (err) {
            console.error('[Excel] Export failed:', err);
            return { ok: false, error: 'export_failed', message: err.message };
        }
    },

    /* ----------------------------------------
       Cross-browser download helper
       ---------------------------------------- */
    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        // Append to body for Firefox compatibility
        document.body.appendChild(a);
        a.click();
        // Cleanup after a short delay
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },

    /* ----------------------------------------
       Build Transactions sheet
       ---------------------------------------- */
    _buildTransactionsSheet(transactions) {
        const headers = [
            'No',
            'Tanggal',
            'Tipe',
            'Kategori',
            'Jumlah',
            'Catatan',
            'Dibuat'
        ];

        // Sort by date desc
        const sorted = [...transactions].sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        const rows = sorted.map((tx, i) => {
            const cat = Categories.getById(tx.categoryId);
            const catLabel = cat ? Categories.getLabel(cat) : 'Tanpa Kategori';
            return [
                i + 1,
                tx.date,
                tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                catLabel,
                tx.amount,
                tx.note || '',
                tx.createdAt ? new Date(tx.createdAt).toISOString() : ''
            ];
        });

        // Add summary rows at the bottom
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const balance = totalIncome - totalExpense;

        rows.push([]); // empty row
        rows.push(['', '', '', 'Total Pemasukan', totalIncome, '', '']);
        rows.push(['', '', '', 'Total Pengeluaran', totalExpense, '', '']);
        rows.push(['', '', '', 'Saldo', balance, '', '']);

        const aoa = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },
            { wch: 12 },
            { wch: 14 },
            { wch: 20 },
            { wch: 16 },
            { wch: 30 },
            { wch: 22 }
        ];

        // Format currency column (E = Jumlah)
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let r = 1; r <= range.e.r; r++) {
            const cellRef = XLSX.utils.encode_cell({ r, c: 4 });
            if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
                ws[cellRef].z = '"Rp "#,##0';
                ws[cellRef].t = 'n';
            }
        }

        // Add autofilter
        if (sorted.length > 0) {
            ws['!autofilter'] = {
                ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sorted.length, c: 6 } })
            };
        }

        // Freeze top row
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        return ws;
    },

    /* ----------------------------------------
       Build Summary sheet
       ---------------------------------------- */
    _buildSummarySheet(transactions) {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const balance = totalIncome - totalExpense;
        const count = transactions.length;

        const incomeCount = transactions.filter(t => t.type === 'income').length;
        const expenseCount = transactions.filter(t => t.type === 'expense').length;

        const dates = transactions.map(t => t.date).sort();
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];

        const aoa = [
            ['RINGKASAN KEUANGAN'],
            [],
            ['Periode', firstDate && lastDate ? `${firstDate} s/d ${lastDate}` : '-'],
            ['Tanggal Export', new Date().toISOString().slice(0, 10)],
            ['User', Storage.getCurrentUser()?.name || '-'],
            [],
            ['TOTAL'],
            ['Total Transaksi', count],
            ['Pemasukan', incomeCount],
            ['Pengeluaran', expenseCount],
            [],
            ['JUMLAH (Rp)'],
            ['Total Pemasukan', totalIncome],
            ['Total Pengeluaran', totalExpense],
            ['Saldo', balance],
            [],
            ['RATA-RATA'],
            ['Rata-rata Pemasukan', incomeCount > 0 ? Math.round(totalIncome / incomeCount) : 0],
            ['Rata-rata Pengeluaran', expenseCount > 0 ? Math.round(totalExpense / expenseCount) : 0],
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Format currency cells
        const currencyCells = ['B13', 'B14', 'B15', 'B17', 'B18'];
        currencyCells.forEach(ref => {
            if (ws[ref] && typeof ws[ref].v === 'number') {
                ws[ref].z = '"Rp "#,##0';
                ws[ref].t = 'n';
            }
        });

        ws['!cols'] = [{ wch: 24 }, { wch: 20 }];

        return ws;
    },

    /* ----------------------------------------
       Build By Category sheet
       ---------------------------------------- */
    _buildByCategorySheet(transactions) {
        const headers = ['Kategori', 'Tipe', 'Jumlah Transaksi', 'Total', 'Rata-rata', '% dari Total'];

        // Group by category
        const groups = {};
        transactions.forEach(tx => {
            const id = tx.categoryId || 'uncategorized';
            if (!groups[id]) {
                const cat = Categories.getById(id);
                groups[id] = {
                    label: cat ? Categories.getLabel(cat) : 'Tanpa Kategori',
                    type: tx.type,
                    count: 0,
                    total: 0
                };
            }
            groups[id].count++;
            groups[id].total += tx.amount;
        });

        const grandTotal = Object.values(groups).reduce((s, g) => s + g.total, 0);

        const rows = Object.values(groups)
            .sort((a, b) => b.total - a.total)
            .map(g => [
                g.label,
                g.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                g.count,
                g.total,
                Math.round(g.total / g.count),
                grandTotal > 0 ? (g.total / grandTotal) : 0
            ]);

        const aoa = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Format columns
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let r = 1; r <= range.e.r; r++) {
            // Currency: D (Total), E (Rata-rata)
            ['D', 'E'].forEach(col => {
                const cellRef = col + (r + 1);
                if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
                    ws[cellRef].z = '"Rp "#,##0';
                    ws[cellRef].t = 'n';
                }
            });
            // Percentage: F (% dari Total)
            const pctRef = 'F' + (r + 1);
            if (ws[pctRef] && typeof ws[pctRef].v === 'number') {
                ws[pctRef].z = '0.0%';
                ws[pctRef].t = 'n';
            }
        }

        ws['!cols'] = [
            { wch: 22 },
            { wch: 14 },
            { wch: 18 },
            { wch: 18 },
            { wch: 16 },
            { wch: 14 }
        ];

        return ws;
    },

    /* ----------------------------------------
       Build By Month sheet
       ---------------------------------------- */
    _buildByMonthSheet(transactions) {
        const headers = ['Bulan', 'Pemasukan', 'Pengeluaran', 'Saldo', 'Jumlah Transaksi'];

        // Group by YYYY-MM
        const groups = {};
        transactions.forEach(tx => {
            const ym = tx.date.slice(0, 7);
            if (!groups[ym]) {
                groups[ym] = { income: 0, expense: 0, count: 0 };
            }
            if (tx.type === 'income') groups[ym].income += tx.amount;
            else groups[ym].expense += tx.amount;
            groups[ym].count++;
        });

        const monthNames = {
            id: ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
            en: ['', 'January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December']
        };

        const lang = (typeof I18n !== 'undefined' && I18n.current) || 'id';
        const names = monthNames[lang] || monthNames.id;

        const rows = Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([ym, g]) => {
                const [year, month] = ym.split('-');
                return [
                    `${names[parseInt(month, 10)]} ${year}`,
                    g.income,
                    g.expense,
                    g.income - g.expense,
                    g.count
                ];
            });

        const aoa = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Format currency: B, C, D
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let r = 1; r <= range.e.r; r++) {
            ['B', 'C', 'D'].forEach(col => {
                const cellRef = col + (r + 1);
                if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
                    ws[cellRef].z = '"Rp "#,##0';
                    ws[cellRef].t = 'n';
                }
            });
        }

        ws['!cols'] = [
            { wch: 22 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 20 }
        ];

        return ws;
    },

    /* ----------------------------------------
       Filter by date range (inclusive)
       ---------------------------------------- */
    _filterByDate(transactions, startDate, endDate) {
        return transactions.filter(tx => {
            if (startDate && tx.date < startDate) return false;
            if (endDate && tx.date > endDate) return false;
            return true;
        });
    },

    /* ----------------------------------------
       Get summary preview for date range
       ---------------------------------------- */
    getPreview(startDate, endDate) {
        const allTx = Storage.getTransactions();
        const filtered = this._filterByDate(allTx, startDate, endDate);

        const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return {
            count: filtered.length,
            income,
            expense,
            balance: income - expense
        };
    },

    /* ----------------------------------------
       Check if XLSX is available
       ---------------------------------------- */
    isAvailable() {
        return typeof XLSX !== 'undefined' && typeof XLSX.utils !== 'undefined';
    }
};