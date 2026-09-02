/* ============================================
   categories.js - Default categories & helpers
   ============================================ */

const Categories = {
    defaults() {
        return [
            // Expense
            { id: 'food', icon: '🍔', type: 'expense', label: { id: 'Makanan', en: 'Food' }, default: true },
            { id: 'transport', icon: '🚗', type: 'expense', label: { id: 'Transport', en: 'Transport' }, default: true },
            { id: 'shopping', icon: '🛍️', type: 'expense', label: { id: 'Belanja', en: 'Shopping' }, default: true },
            { id: 'bills', icon: '🧾', type: 'expense', label: { id: 'Tagihan', en: 'Bills' }, default: true },
            { id: 'entertainment', icon: '🎬', type: 'expense', label: { id: 'Hiburan', en: 'Entertainment' }, default: true },
            { id: 'health', icon: '💊', type: 'expense', label: { id: 'Kesehatan', en: 'Health' }, default: true },
            { id: 'education', icon: '📚', type: 'expense', label: { id: 'Pendidikan', en: 'Education' }, default: true },
            { id: 'gift', icon: '🎁', type: 'expense', label: { id: 'Hadiah', en: 'Gift' }, default: true },
            { id: 'other_expense', icon: '💸', type: 'expense', label: { id: 'Lainnya', en: 'Other' }, default: true },

            // Income
            { id: 'salary', icon: '💼', type: 'income', label: { id: 'Gaji', en: 'Salary' }, default: true },
            { id: 'freelance', icon: '💻', type: 'income', label: { id: 'Freelance', en: 'Freelance' }, default: true },
            { id: 'business', icon: '🏢', type: 'income', label: { id: 'Bisnis', en: 'Business' }, default: true },
            { id: 'investment', icon: '📈', type: 'income', label: { id: 'Investasi', en: 'Investment' }, default: true },
            { id: 'gift_in', icon: '🎉', type: 'income', label: { id: 'Hadiah Masuk', en: 'Gift In' }, default: true },
            { id: 'other_income', icon: '💰', type: 'income', label: { id: 'Lainnya', en: 'Other' }, default: true },
        ];
    },

    getAll() {
        const userCats = Storage.getCategories();
        return userCats || this.defaults();
    },

    getByType(type) {
        return this.getAll().filter(c => c.type === type);
    },

    getById(id) {
        return this.getAll().find(c => c.id === id);
    },

    getLabel(cat) {
        if (!cat) return I18n.t('tx_no_category');
        return (cat.label && cat.label[I18n.current]) || cat.label?.id || cat.id;
    },

    getIcon(cat) {
        return cat ? cat.icon : '📦';
    },

    // Emoji options for new category
    emojiOptions() {
        return [
            '🍔','🍕','🍜','🍱','☕','🍺','🍷','🍰',
            '🚗','🚌','🚕','✈️','🚲','⛽','🅿️',
            '🛍️','👕','👟','💄','💍','🎀','👜',
            '🧾','💡','📱','💻','🖥️','🎮','📺','🏠',
            '🎬','🎵','🎤','🎨','🎭','🎲','⚽','🎯',
            '💊','🏥','🩺','💉','🧘','🏋️','💆','🧴',
            '📚','✏️','🎓','📖','🖊️','📐','🎒','💼',
            '🎁','🎂','💐','🎈','🎉','🎊','💝','🌹',
            '💼','💻','💰','📊','📈','💵','💳','🏦',
            '🐶','🐱','🐰','🌱','🌳','🌸','☀️','⭐',
            '🏖️','🎢','🎡','🎪','🎠','🏕️','🗺️','🧳'
        ];
    },

    // Preset colors for new categories
    presetColors() {
        return ['#EC4899','#F97316','#FBBF24','#10B981','#3B82F6','#8B5CF6','#EF4444','#06B6D4'];
    }
};