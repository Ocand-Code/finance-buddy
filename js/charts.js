/* ============================================
   charts.js - Lightweight canvas charts
   No external dependencies - pure canvas API
   ============================================ */

const Charts = {
    weeklyChart: null,
    categoryChart: null,

    /* ----------------------------------------
       Bar/Line chart for weekly data
       ---------------------------------------- */
    renderWeekly(canvas, data) {
        // data = { labels: [...], income: [...], expense: [...] }
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Resize canvas for DPR
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;
        const pad = { top: 20, right: 10, bottom: 30, left: 10 };
        const innerW = W - pad.left - pad.right;
        const innerH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        const labels = data.labels;
        const income = data.income;
        const expense = data.expense;

        const maxVal = Math.max(
            ...income,
            ...expense,
            1 // Avoid divide by zero
        );

        // Group size
        const groupW = innerW / labels.length;
        const barW = Math.min(16, groupW / 3);
        const gap = 4;

        labels.forEach((label, i) => {
            const x = pad.left + i * groupW + groupW / 2;

            // Income bar
            const incH = (income[i] / maxVal) * innerH;
            const incY = pad.top + innerH - incH;
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--emerald-500').trim() || '#10B981';
            this._roundedRect(ctx, x - barW - gap/2, incY, barW, incH, 4);

            // Expense bar
            const expH = (expense[i] / maxVal) * innerH;
            const expY = pad.top + innerH - expH;
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--rose-500').trim() || '#F43F5E';
            this._roundedRect(ctx, x + gap/2, expY, barW, expH, 4);

            // Label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#9CA3AF';
            ctx.font = '11px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, x, pad.top + innerH + 8);
        });
    },

    /* ----------------------------------------
       Donut chart for category breakdown
       ---------------------------------------- */
    renderCategoryBreakdown(canvas, data) {
        // data = { label, value, color }[]
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;
        ctx.clearRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;
        const outerR = Math.min(W, H) / 2 - 10;
        const innerR = outerR * 0.6;

        const total = data.reduce((sum, d) => sum + d.value, 0);

        if (total === 0) {
            // Empty state
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-strong').trim() || '#E5E7EB';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-mute').trim() || '#9CA3AF';
            ctx.font = '500 13px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(I18n.current === 'id' ? 'Belum ada data' : 'No data', cx, cy);
            return;
        }

        let startAngle = -Math.PI / 2;
        const colors = ['#6366F1','#F43F5E','#F97316','#FBBF24','#10B981','#3B82F6','#A855F7','#06B6D4','#EF4444','#84CC16'];

        data.forEach((d, i) => {
            const sliceAngle = (d.value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            ctx.fillStyle = d.color || colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, outerR, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            startAngle = endAngle;
        });

        // Inner hole
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-card').trim() || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fill();

        // Center text
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#1F2937';
        ctx.font = 'bold 13px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(I18n.t('dash_expense'), cx, cy - 10);

        ctx.font = 'bold 18px -apple-system, sans-serif';
        ctx.fillText(I18n.formatMoney(total), cx, cy + 12);
    },

    _roundedRect(ctx, x, y, w, h, r) {
        if (h < 0) { y = y + h; h = Math.abs(h); }
        if (h < r) r = h;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    },

    /* ----------------------------------------
       Compute weekly data from transactions
       ---------------------------------------- */
    getWeeklyData(transactions) {
        const labels = [];
        const income = [];
        const expense = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayLabels = {
            id: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
            en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        };

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().slice(0, 10);

            labels.push(dayLabels[I18n.current][d.getDay()]);

            const dayTx = transactions.filter(t => t.date === dateKey);
            income.push(dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
            expense.push(dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
        }

        return { labels, income, expense };
    },

    /* ----------------------------------------
       Compute category breakdown for a month
       ---------------------------------------- */
    getCategoryBreakdown(transactions, year, month, type = 'expense') {
        const filtered = transactions.filter(t => {
            if (t.type !== type) return false;
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        const totals = {};
        filtered.forEach(t => {
            const id = t.categoryId || 'uncategorized';
            totals[id] = (totals[id] || 0) + t.amount;
        });

        const colors = ['#8B5CF6','#EC4899','#F97316','#FBBF24','#10B981','#3B82F6','#EF4444','#06B6D4','#A855F7','#F59E0B'];

        return Object.entries(totals)
            .map(([id, value], i) => {
                const cat = Categories.getById(id);
                return {
                    id,
                    label: cat ? Categories.getLabel(cat) : I18n.t('tx_no_category'),
                    icon: cat ? Categories.getIcon(cat) : '📦',
                    value,
                    color: colors[i % colors.length]
                };
            })
            .sort((a, b) => b.value - a.value);
    }
};