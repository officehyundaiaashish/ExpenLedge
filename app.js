// State storage
let transactions = [];
let userProfile = {
    name: "",
    email: "",
    avatar: "bg-blue-500",
    biometricLock: false
};

function getAvatarHtml(name, colorClass) {
    const firstLetter = name ? name.trim().charAt(0).toUpperCase() : 'U';
    const bgClass = colorClass || 'bg-blue-500';
    return `<div class="w-full h-full rounded-full ${bgClass} text-white flex items-center justify-center font-bold text-lg uppercase select-none">${firstLetter}</div>`;
}

let budgetEnabled = false;
let monthlyBudgetLimit = 0;
let categoryBudgetLimits = {
    'Food and Dining': 0,
    'Groceries': 0,
    'Shopping': 0,
    'Education': 0,
    'Transport': 0,
    'Bills & Utilities': 0,
    'Entertainment': 0,
    'Medical': 0,
    'Travelling': 0,
    'Insurance': 0,
    'Taxes': 0,
    'Investments': 0,
    'Personal Care': 0,
    'Gift & Donations': 0,
    'Others': 0,
    'Family': 0,
    'Veer Auto': 0
};
let userAccounts = [
    { id: 'cash', name: 'Cash Wallet', holderName: '', type: 'cash', startingBalance: 0.00 }
];
let scheduledTransactions = [];
let dashboardFilter = 'month';
let editingTransactionId = null;
let selectedTxDateObj = new Date();
let currentTheme = 'dark';
let autoBackupEnabled = false;
let lastBackupAt = null;
let lastStateChangeAt = null;

const SUPABASE_APP_ID = 'expenledge';
const SUPABASE_CONFIG_KEY = 'expenledge_supabase_config';
const SUPABASE_DEVICE_KEY = 'expenledge_supabase_device_id';
const SUPABASE_LAST_SYNC_KEY = 'expenledge_last_supabase_sync_at';
const SUPABASE_LAST_STATE_CHANGE_KEY = 'expenledge_last_state_change_at';
const SUPABASE_LAST_REMOTE_APPLIED_KEY = 'expenledge_last_remote_applied_at';

let supabaseClient = null;
let supabaseRealtimeChannel = null;
let supabaseConfig = {
    url: '',
    anonKey: '',
    appId: SUPABASE_APP_ID,
    deviceId: localStorage.getItem(SUPABASE_DEVICE_KEY) || (crypto?.randomUUID ? crypto.randomUUID() : `device_${Date.now()}_${Math.random().toString(36).slice(2)}`)
};
const SUPABASE_VERSION_TABLE = 'expenledge_state_versions';
const SUPABASE_MAX_VERSIONS = 2;

let supabaseIntegration = {
    connected: false,
    connecting: false,
    pendingSync: false,
    syncInProgress: false,
    applyingRemote: false,
    booting: true,
    lastError: '',
    lastSyncAt: null,
    lastRemoteAppliedAt: null
};
let supabaseSyncTimer = null;
let supabaseInitialLoadDone = false;

let currentView = 'home';
let isSearching = false;
let dashboardSearchOpen = false;

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let incomeDetailsYear = currentYear;
let incomeDetailsMonth = currentMonth;
let spendingDetailsYear = currentYear;
let spendingDetailsMonth = currentMonth;
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let analysisPeriod = 'month'; // 'week' | 'month' | 'year' | 'custom'
let analysisYear = new Date().getFullYear();
let analysisMonth = new Date().getMonth();
let analysisWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d; })();
let analysisCatType = 'spending'; // 'spending' | 'income'

// Add transaction state variables
let selectedTxType = 'expense';
let categoryLayout = 'grid';
let selectedCategory = 'Groceries';
let selectedCategoryIcon = 'shopping_basket';
let selectedPaymentMode = 'Cash';
let selectedPaymentIcon = 'payments';
let selectedTags = [];
let allAvailableTags = [];
let includeCashInBalance = true;
const CATEGORY_ORDER_PRESET_VERSION = '2';

// Demo tags from older releases are removed the next time saved data is loaded.
const legacyPlaceholderTags = new Set([
    'amazon', 'netflix', 'spotify', 'zomato', 'swiggy', 'uber', 'ola', 'flipkart', 'myntra'
]);

const expenseCategories = [
    { name: 'Others', icon: 'more_horiz', color: 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant', fillClass: 'group-hover:bg-surface-container-highest text-on-surface-variant', builtIn: true },
    { name: 'Bills & Utilities', icon: 'receipt_long', color: 'bg-error/10 border-error/20 text-error', fillClass: 'group-hover:bg-error/20 text-error', builtIn: true },
    { name: 'Shopping', icon: 'shopping_bag', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary', builtIn: true },
    { name: 'Groceries', icon: 'shopping_basket', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary', builtIn: true },
    { name: 'Food and Dining', icon: 'restaurant', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary', builtIn: true },
    { name: 'Travelling', icon: 'flight', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary', builtIn: true },
    { name: 'Veer Auto', icon: 'directions_car', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Entertainment', icon: 'sports_esports', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary', builtIn: true },
    { name: 'Medical', icon: 'medical_services', color: 'bg-error-container/20 border-error-container/30 text-error', fillClass: 'group-hover:bg-error-container/40 text-error', builtIn: true },
    { name: 'Education', icon: 'school', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary', builtIn: true },
    { name: 'Family', icon: 'family_restroom', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Gift & Donations', icon: 'volunteer_activism', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary', builtIn: true },
    { name: 'Transport', icon: 'commute', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Insurance', icon: 'health_and_safety', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Taxes', icon: 'request_quote', color: 'bg-error/10 border-error/20 text-error', fillClass: 'group-hover:bg-error/20 text-error', builtIn: true },
    { name: 'Investments', icon: 'trending_up', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary', builtIn: true },
    { name: 'Personal Care', icon: 'spa', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary', builtIn: true }
];

const incomeCategories = [
    { name: 'Salary', icon: 'work', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary', builtIn: true },
    { name: 'Other Income', icon: 'payments', color: 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant', fillClass: 'group-hover:bg-surface-container-highest text-on-surface-variant', builtIn: true },
    { name: 'Investments', icon: 'trending_up', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary', builtIn: true },
    { name: 'Rentals', icon: 'home_work', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Veer Auto', icon: 'directions_car', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary', builtIn: true },
    { name: 'Freelance', icon: 'laptop_mac', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary', builtIn: true },
    { name: 'Sold Items', icon: 'sell', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary', builtIn: true }
];

const DEFAULT_EXPENSE_CATEGORY_ORDER = [
    'Others',
    'Bills & Utilities',
    'Shopping',
    'Groceries',
    'Food and Dining',
    'Travelling',
    'Veer Auto',
    'Entertainment',
    'Medical',
    'Education',
    'Family',
    'Gift & Donations',
    'Transport',
    'Insurance',
    'Taxes',
    'Investments',
    'Personal Care'
];

const DEFAULT_INCOME_CATEGORY_ORDER = [
    'Salary',
    'Other Income',
    'Investments',
    'Rentals',
    'Veer Auto',
    'Freelance',
    'Sold Items'
];

function applyDefaultCategoryOrder() {
    applyCategoryOrder(expenseCategories, DEFAULT_EXPENSE_CATEGORY_ORDER);
    applyCategoryOrder(incomeCategories, DEFAULT_INCOME_CATEGORY_ORDER);
}

function suppressBrowserAutofill(root = document) {
    const fields = [];
    if (root.matches && root.matches('input, textarea')) fields.push(root);
    if (root.querySelectorAll) fields.push(...root.querySelectorAll('input, textarea'));

    fields.forEach((el) => {
        if (!el || el.disabled) return;

        const type = (el.getAttribute('type') || el.type || '').toLowerCase();
        if (['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color'].includes(type)) return;

        // Chrome may ignore "off" for fields it mistakes for login or card data.
        el.setAttribute('autocomplete', type === 'search' ? 'off' : 'new-password');
        el.setAttribute('autocapitalize', type === 'email' || type === 'search' ? 'none' : 'off');
        el.setAttribute('autocorrect', 'off');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('data-form-type', 'other');
        el.setAttribute('data-lpignore', 'true');
        el.setAttribute('data-1p-ignore', 'true');
        el.setAttribute('data-bwignore', 'true');
        el.setAttribute('data-protonpass-ignore', 'true');

        if (!el.name) {
            // Match Tasker's stable, non-semantic names so Chrome cannot infer a payment or login field.
            const safeId = (el.id || 'field').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
            el.setAttribute('name', `expenledge_${safeId}`);
        }

        if (type === 'number' && !el.getAttribute('inputmode')) {
            el.setAttribute('inputmode', 'decimal');
        }
    });
}

function renameCategoryBudgetKey(oldName, newName) {
    if (Object.prototype.hasOwnProperty.call(categoryBudgetLimits, oldName)) {
        categoryBudgetLimits[newName] = categoryBudgetLimits[newName] || categoryBudgetLimits[oldName] || 0;
        delete categoryBudgetLimits[oldName];
    }
}

function normalizeBuiltInCategoryNames() {
    const renamedCategories = {
        'Food & Drinks': 'Food and Dining',
        'Food and drinks': 'Food and Dining',
        'Travel': 'Travelling',
        'Gifts & Grants': 'Other Income',
        'Gift & Grants': 'Other Income'
    };

    transactions.forEach(t => {
        if (renamedCategories[t.category]) {
            t.category = renamedCategories[t.category];
            const categoryList = t.type === 'income' ? incomeCategories : expenseCategories;
            const matchedCategory = categoryList.find(c => c.name === t.category);
            if (matchedCategory) t.categoryIcon = matchedCategory.icon;
        }
    });

    renameCategoryBudgetKey('Food & Drinks', 'Food and Dining');
    renameCategoryBudgetKey('Food and drinks', 'Food and Dining');
    renameCategoryBudgetKey('Travel', 'Travelling');

    expenseCategories.forEach(cat => {
        if (!Object.prototype.hasOwnProperty.call(categoryBudgetLimits, cat.name)) {
            categoryBudgetLimits[cat.name] = 0;
        }
    });
}

function saveCategoryOrders() {
    localStorage.setItem('expenledge_category_orders', JSON.stringify({
        expense: expenseCategories.map(category => category.name),
        income: incomeCategories.map(category => category.name)
    }));
}

function createUserCategory(name, icon) {
    return {
        name,
        icon,
        color: 'bg-primary-container/10 border-primary-container/20 text-primary',
        fillClass: 'group-hover:bg-primary-container/20 text-primary'
    };
}

function saveCustomCategories() {
    localStorage.setItem('expenledge_custom_categories', JSON.stringify({
        expense: expenseCategories.filter(category => !category.builtIn),
        income: incomeCategories.filter(category => !category.builtIn)
    }));
}

function restoreCustomCategories(categories, savedCategories) {
    if (!Array.isArray(savedCategories)) return;
    savedCategories.forEach(category => {
        if (!category || typeof category.name !== 'string' || !category.name.trim()) return;
        if (categories.some(existing => existing.name.toLowerCase() === category.name.trim().toLowerCase())) return;
        categories.push(createUserCategory(category.name.trim(), typeof category.icon === 'string' ? category.icon : 'category'));
    });
}

function applyCategoryOrder(categories, order) {
    if (!Array.isArray(order)) return;
    const categoriesByName = new Map(categories.map(category => [category.name, category]));
    const orderedCategories = order.map(name => categoriesByName.get(name)).filter(Boolean);
    const remainingCategories = categories.filter(category => !order.includes(category.name));
    categories.splice(0, categories.length, ...orderedCategories, ...remainingCategories);
}

function getAllTags() {
    const tags = new Set(allAvailableTags);
    transactions.forEach(transaction => {
        (transaction.tags || []).forEach(tag => tags.add(tag));
    });
    return [...tags]
        .filter(tag => typeof tag === 'string' && tag.trim())
        .sort((a, b) => a.localeCompare(b));
}

function removeLegacyPlaceholderTags() {
    if (localStorage.getItem('expenledge_placeholder_tags_removed') === 'true') return false;

    const isPlaceholderTag = tag => legacyPlaceholderTags.has(String(tag).trim().toLowerCase());
    const originalTagCount = allAvailableTags.length;
    allAvailableTags = allAvailableTags.filter(tag => !isPlaceholderTag(tag));

    let changed = allAvailableTags.length !== originalTagCount;
    transactions.forEach(transaction => {
        if (!Array.isArray(transaction.tags)) return;
        const remainingTags = transaction.tags.filter(tag => !isPlaceholderTag(tag));
        if (remainingTags.length !== transaction.tags.length) {
            transaction.tags = remainingTags;
            changed = true;
        }
    });

    localStorage.setItem('expenledge_placeholder_tags_removed', 'true');
    return changed;
}

function saveInterfacePreferences() {
    localStorage.setItem('expenledge_interface_preferences', JSON.stringify({
        categoryLayout,
        manageCategoryLayout,
        budgetPeriod
    }));
}

function loadInterfacePreferences() {
    const savedPreferences = localStorage.getItem('expenledge_interface_preferences');
    if (!savedPreferences) return;

    const preferences = JSON.parse(savedPreferences);
    if (!preferences || typeof preferences !== 'object') return;

    if (preferences.categoryLayout === 'grid' || preferences.categoryLayout === 'list') categoryLayout = preferences.categoryLayout;
    if (preferences.manageCategoryLayout === 'grid' || preferences.manageCategoryLayout === 'list') manageCategoryLayout = preferences.manageCategoryLayout;
    if (preferences.budgetPeriod === 'monthly' || preferences.budgetPeriod === 'yearly') budgetPeriod = preferences.budgetPeriod;
    syncCategoryLayoutUI();
    syncManageCategoryLayoutUI();
}

function syncCategoryLayoutUI() {
    const btnGrid = document.getElementById('btn-cat-layout-grid');
    const btnList = document.getElementById('btn-cat-layout-list');
    if (!btnGrid || !btnList) return;

    const activeCls = "p-1 rounded-full bg-primary text-on-primary shadow-sm flex items-center justify-center transition-all duration-150";
    const inactiveCls = "p-1 rounded-full text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all duration-150";

    if (categoryLayout === 'list') {
        btnList.className = activeCls;
        btnGrid.className = inactiveCls;
    } else {
        btnGrid.className = activeCls;
        btnList.className = inactiveCls;
    }
}

// Local Storage Persistence Helpers
function saveToLocalStorage() {
    try {
        localStorage.setItem('expenledge_transactions', JSON.stringify(transactions));
        localStorage.setItem('expenledge_profile', JSON.stringify(userProfile));
        localStorage.setItem('expenledge_budget_enabled', budgetEnabled.toString());
        localStorage.setItem('expenledge_budget_limit', monthlyBudgetLimit.toString());
        localStorage.setItem('expenledge_yearly_budget_limit', yearlyBudgetLimit.toString());
        localStorage.setItem('expenledge_active_balance_type', activeDashboardBalanceType);
        localStorage.setItem('expenledge_category_limits', JSON.stringify(categoryBudgetLimits));
        localStorage.setItem('expenledge_user_accounts', JSON.stringify(userAccounts));
        localStorage.setItem('expenledge_scheduled', JSON.stringify(scheduledTransactions));
        localStorage.setItem('expenledge_all_tags', JSON.stringify(allAvailableTags));
        localStorage.setItem('expenledge_include_cash', includeCashInBalance.toString());
        localStorage.removeItem('expenledge_dashboard_filter');
        localStorage.setItem('expenledge_auto_backup_enabled', autoBackupEnabled.toString());
        localStorage.setItem('expenledge_last_backup_at', lastBackupAt || '');
        saveDeletedTransactionLogSnapshot();
        saveCategoryOrders();
        saveCustomCategories();
        saveInterfacePreferences();
        markLocalStateChanged();
        queueSupabaseSync();
    } catch (e) {
        console.error("Local storage save failed: ", e);
    }
}

function shouldQueueSupabaseSync() {
    return !!supabaseClient && supabaseIntegration.connected && !supabaseIntegration.booting && !supabaseIntegration.applyingRemote;
}

function getSupabaseVersionTable() {
    return SUPABASE_VERSION_TABLE;
}

async function writeSupabaseVersionSnapshot(payload, updatedAt) {
    if (!supabaseClient?.from) return false;

    const snapshot = {
        app_id: SUPABASE_APP_ID,
        device_id: supabaseConfig.deviceId,
        payload,
        updated_at: updatedAt || new Date().toISOString()
    };

    try {
        const { error } = await supabaseClient
            .from(getSupabaseVersionTable())
            .insert(snapshot);

        if (error) throw error;
        await pruneSupabaseVersionHistory();
        return true;
    } catch (error) {
        console.warn('Supabase version history write skipped:', error?.message || error);
        return false;
    }
}

async function pruneSupabaseVersionHistory() {
    if (!supabaseClient?.from) return false;

    try {
        const { data, error } = await supabaseClient
            .from(getSupabaseVersionTable())
            .select('id')
            .eq('app_id', SUPABASE_APP_ID)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        const idsToDelete = (data || []).slice(SUPABASE_MAX_VERSIONS).map(row => row.id).filter(Boolean);
        if (!idsToDelete.length) return true;

        const { error: deleteError } = await supabaseClient
            .from(getSupabaseVersionTable())
            .delete()
            .in('id', idsToDelete);

        if (deleteError) throw deleteError;
        return true;
    } catch (error) {
        console.warn('Supabase version history prune skipped:', error?.message || error);
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        const savedT = localStorage.getItem('expenledge_transactions');
        if (savedT) transactions = JSON.parse(savedT);

        const savedP = localStorage.getItem('expenledge_profile');
        if (savedP) userProfile = JSON.parse(savedP);

        const savedE = localStorage.getItem('expenledge_budget_enabled');
        if (savedE) budgetEnabled = savedE === 'true';

        const savedL = localStorage.getItem('expenledge_budget_limit');
        if (savedL) {
            const val = parseFloat(savedL);
            monthlyBudgetLimit = (val === 9000) ? 0 : (val || 0);
        }

        const savedYL = localStorage.getItem('expenledge_yearly_budget_limit');
        if (savedYL) {
            const val = parseFloat(savedYL);
            yearlyBudgetLimit = (val === 108000) ? 0 : (val || 0);
        }

        const savedBT = localStorage.getItem('expenledge_active_balance_type');
        if (savedBT) activeDashboardBalanceType = savedBT;

        const savedC = localStorage.getItem('expenledge_category_limits');
        if (savedC) {
            categoryBudgetLimits = JSON.parse(savedC);
            const oldCatDefaults = {
                'Groceries': 2000, 'Shopping': 1000, 'Education': 800, 'Transport': 500,
                'Bills & Utilities': 1500, 'Entertainment': 600, 'Medical': 1000, 'Food & Drinks': 1200
            };
            let isOldDefault = true;
            for (const key in oldCatDefaults) {
                if (categoryBudgetLimits[key] !== oldCatDefaults[key]) {
                    isOldDefault = false;
                    break;
                }
            }
            if (isOldDefault) {
                for (const key in categoryBudgetLimits) {
                    categoryBudgetLimits[key] = 0;
                }
            }
        }
        normalizeBuiltInCategoryNames();

        const savedCustomCategories = localStorage.getItem('expenledge_custom_categories');
        if (savedCustomCategories) {
            const customCategories = JSON.parse(savedCustomCategories);
            restoreCustomCategories(expenseCategories, customCategories.expense);
            restoreCustomCategories(incomeCategories, customCategories.income);
        }

        const savedCategoryOrderPreset = localStorage.getItem('expenledge_category_order_preset');
        const savedCategoryOrders = localStorage.getItem('expenledge_category_orders');
        if (savedCategoryOrderPreset !== CATEGORY_ORDER_PRESET_VERSION) {
            applyDefaultCategoryOrder();
            saveCategoryOrders();
            localStorage.setItem('expenledge_category_order_preset', CATEGORY_ORDER_PRESET_VERSION);
        } else if (savedCategoryOrders) {
            const categoryOrders = JSON.parse(savedCategoryOrders);
            applyCategoryOrder(expenseCategories, categoryOrders.expense);
            applyCategoryOrder(incomeCategories, categoryOrders.income);
        } else {
            applyDefaultCategoryOrder();
            saveCategoryOrders();
        }

        const savedUA = localStorage.getItem('expenledge_user_accounts');
        if (savedUA) {
            userAccounts = JSON.parse(savedUA)
                .filter(acc => acc.id !== 'bank' && acc.id !== 'card')
                .map(acc => ({
                    ...acc,
                    // Clear the generated holder name used by older versions.
                    holderName: acc.holderName === 'Alex Thompson' ? '' : acc.holderName
                }));
            localStorage.setItem('expenledge_user_accounts', JSON.stringify(userAccounts));
        } else {
            const savedA = localStorage.getItem('expenledge_accounts');
            let initialCashBal = 0.00;
            if (savedA) {
                const legacyBal = JSON.parse(savedA);
                if (legacyBal.cash !== 950) {
                    initialCashBal = legacyBal.cash || 0.00;
                }
            }
            userAccounts = [
                { id: 'cash', name: 'Cash Wallet', holderName: '', type: 'cash', startingBalance: initialCashBal }
            ];
            localStorage.setItem('expenledge_user_accounts', JSON.stringify(userAccounts));
        }

        const savedS = localStorage.getItem('expenledge_scheduled');
        if (savedS) scheduledTransactions = JSON.parse(savedS);

        const savedTags = localStorage.getItem('expenledge_all_tags');
        if (savedTags) allAvailableTags = JSON.parse(savedTags);

        if (removeLegacyPlaceholderTags()) saveToLocalStorage();

        const savedCash = localStorage.getItem('expenledge_include_cash');
        if (savedCash !== null) includeCashInBalance = savedCash === 'true';

        const savedAutoBackup = localStorage.getItem('expenledge_auto_backup_enabled');
        if (savedAutoBackup) autoBackupEnabled = savedAutoBackup === 'true';

        const savedLastBackupAt = localStorage.getItem('expenledge_last_backup_at');
        if (savedLastBackupAt) lastBackupAt = savedLastBackupAt;

        const deletedLog = getDeletedTransactionLogSnapshot();
        if (deletedLog.length) {
            saveDeletedTransactionLogSnapshot(deletedLog);
        }

        const txMetadataChanged = ensureTransactionMetadata();
        const pruneChanged = pruneDeletedTransactionsFromCurrentState();
        if ((txMetadataChanged || pruneChanged) && !supabaseIntegration.applyingRemote) {
            saveToLocalStorage();
        }

        loadInterfacePreferences();

    } catch (e) {
        console.error("Local storage load failed: ", e);
    }
}
function getBackupStorageKeys() {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith('expenledge_')) {
            backupKeys.push(key);
        }
    }
    return backupKeys.sort();
}

function buildBackupPayload() {
    saveToLocalStorage();
    const storage = {};
    getBackupStorageKeys().forEach(key => {
        storage[key] = localStorage.getItem(key);
    });

    return {
        app: 'ExpenLedge',
        type: 'full-backup',
        version: 2,
        exportedAt: new Date().toISOString(),
        storage
    };
}

function updateBackupTimeDisplay() {
    const labels = [document.getElementById('cloud-backup-time'), document.getElementById('supabase-sync-time')].filter(Boolean);
    if (!labels.length) return;

    const stamp = supabaseIntegration.lastSyncAt || localStorage.getItem(SUPABASE_LAST_SYNC_KEY) || lastBackupAt;
    if (!stamp) {
        labels.forEach(label => label.innerText = 'Last sync: Never');
        return;
    }

    const backupDate = new Date(stamp);
    if (Number.isNaN(backupDate.getTime())) {
        labels.forEach(label => label.innerText = 'Last sync: Never');
        return;
    }

    const timeStr = backupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = backupDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    labels.forEach(label => label.innerText = `Last sync: ${dateStr} at ${timeStr}`);
}

function persistBackupMetadata() {
    localStorage.setItem('expenledge_auto_backup_enabled', autoBackupEnabled.toString());
    localStorage.setItem('expenledge_last_backup_at', lastBackupAt || '');
}

function setLastBackupNow() {
    lastBackupAt = new Date().toISOString();
    persistBackupMetadata();
    updateBackupTimeDisplay();
}

function applyBackupSheetPreferences() {
    const autoBackupToggle = document.getElementById('backup-auto-toggle');
    if (autoBackupToggle) autoBackupToggle.checked = autoBackupEnabled;
    updateBackupTimeDisplay();
}

function restoreBackupPayload(imported) {
    if (Array.isArray(imported)) {
        localStorage.setItem('expenledge_transactions', JSON.stringify(imported));
        lastBackupAt = new Date().toISOString();
        persistBackupMetadata();
        return true;
    }

    if (!imported || typeof imported !== 'object' || imported.type !== 'full-backup' || !imported.storage || typeof imported.storage !== 'object') {
        return false;
    }

    getBackupStorageKeys().forEach(key => localStorage.removeItem(key));
    Object.entries(imported.storage).forEach(([key, value]) => {
        if (key.startsWith('expenledge_')) {
            localStorage.setItem(key, value ?? '');
        }
    });

    lastBackupAt = imported.exportedAt || new Date().toISOString();
    persistBackupMetadata();
    return true;
}


function getSupabaseStorageSnapshot() {
    const storage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith('expenledge_')) {
            storage[key] = localStorage.getItem(key);
        }
    }
    return storage;
}

function parseJsonSafe(raw, fallback) {
    if (raw === null || raw === undefined || raw === '') return fallback;
    try {
        return JSON.parse(raw);
    } catch (_error) {
        return fallback;
    }
}

function getTransactionSyncKey(tx) {
    return String(tx?.syncId || tx?.id || '').trim();
}

function generateTransactionSyncId() {
    return `tx_${crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

function getTransactionFreshness(tx) {
    const stamp = tx?.updatedAt || tx?.rawDate || tx?.createdAt || '';
    const time = new Date(stamp).getTime();
    return Number.isFinite(time) ? time : 0;
}

function normalizeTransactionRecord(tx, index = 0) {
    if (!tx || typeof tx !== 'object') return tx;
    const next = { ...tx };
    if (!getTransactionSyncKey(next)) {
        next.syncId = generateTransactionSyncId();
    }
    if (!next.updatedAt) {
        next.updatedAt = next.rawDate || new Date().toISOString();
    }
    if (!next.createdAt) {
        next.createdAt = next.updatedAt;
    }
    if (next.id === undefined || next.id === null || next.id === '') {
        next.id = index + 1;
    }
    return next;
}

function normalizeTransactionsList(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.map((tx, index) => {
        const next = normalizeTransactionRecord(tx, index);
        let key = getTransactionSyncKey(next);
        if (!key || seen.has(key)) {
            next.syncId = generateTransactionSyncId();
            key = next.syncId;
        }
        seen.add(key);
        return next;
    });
}

function getDeletedTransactionLogSnapshot(storage = localStorage) {
    const raw = storage.getItem('expenledge_deleted_transaction_log');
    const parsed = parseJsonSafe(raw, []);
    if (!Array.isArray(parsed)) return [];
    return parsed
        .map(item => ({
            syncId: String(item?.syncId || item?.id || '').trim(),
            deletedAt: item?.deletedAt || new Date().toISOString(),
            deletedBy: item?.deletedBy || ''
        }))
        .filter(item => item.syncId);
}

function saveDeletedTransactionLogSnapshot(log = null) {
    const entries = log || getDeletedTransactionLogSnapshot();
    localStorage.setItem('expenledge_deleted_transaction_log', JSON.stringify(entries));
}

function markLocalStateChanged() {
    lastStateChangeAt = new Date().toISOString();
    localStorage.setItem(SUPABASE_LAST_STATE_CHANGE_KEY, lastStateChangeAt);
}

function ensureTransactionMetadata() {
    const normalized = normalizeTransactionsList(transactions);
    const changed = JSON.stringify(normalized) !== JSON.stringify(transactions);
    transactions = normalized;
    return changed;
}

function pruneDeletedTransactionsFromCurrentState() {
    const deletedIds = new Set(getDeletedTransactionLogSnapshot().map(item => item.syncId));
    const before = transactions.length;
    transactions = transactions.filter(tx => !deletedIds.has(getTransactionSyncKey(tx)));
    return before !== transactions.length;
}

function mergeDeletionLogs(localLog = [], remoteLog = []) {
    const merged = new Map();
    [...localLog, ...remoteLog].forEach(entry => {
        const syncId = String(entry?.syncId || entry?.id || '').trim();
        if (!syncId) return;
        const deletedAt = entry?.deletedAt || new Date().toISOString();
        const existing = merged.get(syncId);
        const candidateTime = new Date(deletedAt).getTime();
        const existingTime = existing ? new Date(existing.deletedAt).getTime() : -1;
        if (!existing || candidateTime >= existingTime) {
            merged.set(syncId, { syncId, deletedAt, deletedBy: entry?.deletedBy || '' });
        }
    });
    return [...merged.values()];
}

function mergeTransactionLists(localTxs = [], remoteTxs = [], deletedIds = new Set()) {
    const merged = new Map();

    const put = (tx) => {
        const next = normalizeTransactionRecord(tx);
        const syncId = getTransactionSyncKey(next);
        if (!syncId || deletedIds.has(syncId)) return;

        const current = merged.get(syncId);
        if (!current) {
            merged.set(syncId, next);
            return;
        }

        if (getTransactionFreshness(next) >= getTransactionFreshness(current)) {
            merged.set(syncId, { ...current, ...next });
        }
    };

    localTxs.forEach(put);
    remoteTxs.forEach(put);

    return [...merged.values()].sort((a, b) => getTransactionFreshness(b) - getTransactionFreshness(a));
}

function mergeSupabaseStorageSnapshots(localSnapshot = {}, remoteSnapshot = {}) {
    const local = localSnapshot && typeof localSnapshot === 'object' ? { ...localSnapshot } : {};
    const remote = remoteSnapshot && typeof remoteSnapshot === 'object' ? { ...remoteSnapshot } : {};

    const localTxs = normalizeTransactionsList(parseJsonSafe(local.expenledge_transactions, []));
    const remoteTxs = normalizeTransactionsList(parseJsonSafe(remote.expenledge_transactions, []));
    const localDeleted = parseJsonSafe(local.expenledge_deleted_transaction_log, []);
    const remoteDeleted = parseJsonSafe(remote.expenledge_deleted_transaction_log, []);

    const mergedDeleted = mergeDeletionLogs(Array.isArray(localDeleted) ? localDeleted : [], Array.isArray(remoteDeleted) ? remoteDeleted : []);
    const deletedIds = new Set(mergedDeleted.map(item => item.syncId));
    const mergedTransactions = mergeTransactionLists(localTxs, remoteTxs, deletedIds);

    const merged = { ...local };

    Object.entries(remote).forEach(([key, value]) => {
        if (key === 'expenledge_transactions' || key === 'expenledge_deleted_transaction_log') return;
        if (value !== undefined && value !== null && value !== '') {
            merged[key] = value;
        }
    });

    merged.expenledge_transactions = JSON.stringify(mergedTransactions);
    merged.expenledge_deleted_transaction_log = JSON.stringify(mergedDeleted);

    return merged;
}

function applyStorageSnapshotToLocal(storage, preserveKeys = new Set([SUPABASE_CONFIG_KEY, SUPABASE_DEVICE_KEY])) {
    const current = getSupabaseStorageSnapshot();
    Object.keys(current).forEach(key => {
        if (!preserveKeys.has(key) && !Object.prototype.hasOwnProperty.call(storage, key)) {
            localStorage.removeItem(key);
        }
    });

    Object.entries(storage || {}).forEach(([key, value]) => {
        if (key.startsWith('expenledge_')) {
            localStorage.setItem(key, value ?? '');
        }
    });
}

function buildCloudSnapshotFromStorage(storage) {
    return {
        app: 'ExpenLedge',
        type: 'cloud-sync',
        version: 3,
        exportedAt: new Date().toISOString(),
        storage
    };
}

function buildCloudSnapshot() {
    return buildCloudSnapshotFromStorage(getSupabaseStorageSnapshot());
}

function setSupabaseStatus(message, isConnected = false, isError = false) {
    const statusEl = document.getElementById('supabase-connection-status');
    if (statusEl) {
        statusEl.innerText = message;
        statusEl.className = isError ? 'text-label-md text-error' : 'text-label-md text-on-surface-variant';
    }
    const syncEl = document.getElementById('supabase-sync-time');
    if (syncEl && !syncEl.innerText) syncEl.innerText = 'Last sync: Never';
    updateBackupTimeDisplay();
    const connectBtn = document.getElementById('supabase-connect-btn');
    const syncBtn = document.querySelector('#sheet-supabase-sync button[onclick="syncSupabaseNow()"]');
    const disconnectBtn = document.querySelector('#sheet-supabase-sync button[onclick="disconnectSupabaseConnection()"]');
    const loadBtn = document.querySelector('#sheet-supabase-sync button[onclick="loadSupabaseCredentialsIntoForm()"]');
    const urlInput = document.getElementById('supabase-project-url');
    const keyInput = document.getElementById('supabase-anon-key');

    if (connectBtn) connectBtn.classList.toggle('hidden', isConnected);
    if (syncBtn) syncBtn.classList.toggle('hidden', !isConnected);
    if (disconnectBtn) disconnectBtn.classList.toggle('hidden', !isConnected);
    if (loadBtn) loadBtn.classList.toggle('hidden', isConnected);
    if (urlInput) urlInput.classList.toggle('hidden', isConnected);
    if (keyInput) keyInput.classList.toggle('hidden', isConnected);

    if (connectBtn) connectBtn.disabled = supabaseIntegration.connecting;
    if (syncBtn) syncBtn.disabled = !isConnected || supabaseIntegration.connecting;
    if (disconnectBtn) disconnectBtn.disabled = !isConnected && !supabaseClient;

    // Update dashboard header badge
    const badge = document.getElementById('supabase-status-badge');
    if (badge) {
        if (isConnected) {
            badge.textContent = 'Synced';
            badge.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border border-primary/30 bg-primary/10 text-primary';
            badge.style.animation = 'none';
            void badge.offsetWidth;
            badge.style.animation = 'supabase-sync-pop 0.5s ease-out';
            if (!document.getElementById('supabase-sync-keyframes')) {
                const style = document.createElement('style');
                style.id = 'supabase-sync-keyframes';
                style.textContent = [
                    '@keyframes supabase-sync-pop { 0% { transform: scale(1); opacity: 0.5; } 40% { transform: scale(1.25); opacity: 1; } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }',
                    '@keyframes sync-icon-left  { 0% { transform: rotate(0deg); } 60% { transform: rotate(-360deg); } 100% { transform: rotate(-360deg); } }',
                    '@keyframes sync-icon-right { 0% { transform: rotate(0deg); } 60% { transform: rotate(360deg);  } 100% { transform: rotate(360deg);  } }',
                    '@keyframes sync-icon-nod   { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(-18deg); } 40% { transform: rotate(18deg); } 60% { transform: rotate(-12deg); } 80% { transform: rotate(10deg); } }'
                ].join('');
                document.head.appendChild(style);
            }
            animateSyncIcon('left');
        } else if (isError) {
            badge.textContent = 'Sync Error';
            badge.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border border-error/30 bg-error-container text-error';
            animateSyncIcon('nod');
        } else {
            badge.textContent = 'Disconnected';
            badge.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border border-outline-variant/30 bg-surface-container-high text-on-surface-variant';
        }
    }
}
function persistSupabaseCredentials() {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({
        url: supabaseConfig.url,
        anonKey: supabaseConfig.anonKey,
        appId: supabaseConfig.appId,
        deviceId: supabaseConfig.deviceId
    }));
    localStorage.setItem(SUPABASE_DEVICE_KEY, supabaseConfig.deviceId);
}

function loadSupabaseCredentialsIntoForm() {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    const urlInput = document.getElementById('supabase-project-url');
    const keyInput = document.getElementById('supabase-anon-key');
    if (!saved) {
        if (urlInput) urlInput.value = '';
        if (keyInput) keyInput.value = '';
        showToast('No saved Supabase credentials found.');
        return;
    }

    const parsed = JSON.parse(saved);
    if (urlInput) urlInput.value = parsed.url || '';
    if (keyInput) keyInput.value = parsed.anonKey || '';
    showToast('Saved Supabase credentials loaded.');
}

function markSupabaseStateDirty() {
    supabaseIntegration.pendingSync = true;
}

function updateSupabaseSyncTime() {
    const now = new Date().toISOString();
    supabaseIntegration.lastSyncAt = now;
    localStorage.setItem(SUPABASE_LAST_SYNC_KEY, now);
    updateBackupTimeDisplay();
}

function disconnectSupabaseRealtime() {
    if (supabaseRealtimeChannel) {
        try {
            supabaseClient?.removeChannel(supabaseRealtimeChannel);
        } catch (_err) {
            // ignore cleanup errors
        }
    }
    supabaseRealtimeChannel = null;
}

function disconnectSupabaseConnection(clearSavedCredentials = true) {
    disconnectSupabaseRealtime();
    supabaseClient = null;
    supabaseIntegration.connected = false;
    supabaseIntegration.connecting = false;
    supabaseIntegration.pendingSync = false;
    supabaseIntegration.lastError = '';
    supabaseIntegration.lastSyncAt = null;
    if (clearSavedCredentials) {
        localStorage.removeItem(SUPABASE_CONFIG_KEY);
        localStorage.removeItem(SUPABASE_LAST_SYNC_KEY);
    }
    setSupabaseStatus('Supabase disconnected', false, false);
}

function applySupabasePayloadToApp(payload, options = {}) {
    if (!payload || typeof payload !== 'object') return false;
    const storage = payload.storage && typeof payload.storage === 'object' ? payload.storage : null;
    if (!storage) return false;

    const mergedStorage = mergeSupabaseStorageSnapshots(getSupabaseStorageSnapshot(), storage);
    applyStorageSnapshotToLocal(mergedStorage);

    const savedStateAt = localStorage.getItem(SUPABASE_LAST_STATE_CHANGE_KEY);
    if (savedStateAt) lastStateChangeAt = savedStateAt;
    const savedBackupAt = localStorage.getItem('expenledge_last_backup_at');
    if (savedBackupAt) lastBackupAt = savedBackupAt;

    loadFromLocalStorage();
    refreshAppUiFromState();
    if (options.remoteAt) {
        supabaseIntegration.lastRemoteAppliedAt = options.remoteAt;
        localStorage.setItem(SUPABASE_LAST_REMOTE_APPLIED_KEY, options.remoteAt);
    }
    return true;
}
function refreshAppUiFromState() {
    suppressBrowserAutofill();
    syncCategoryLayoutUI();
    syncManageCategoryLayoutUI();
    toggleBudgetActiveState(budgetEnabled);
    setBudgetPeriod(budgetPeriod);
    setAnalysisPeriod(analysisPeriod);
    setAnalysisCatType(analysisCatType);
    updateSheetMonthLabels();
    updateDashboard();
    updateAnalysis();
    updateAccounts();
    updateBudget();
    applyBackupSheetPreferences();

    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    if (nameDisplay) nameDisplay.innerText = userProfile.name;
    if (emailDisplay) emailDisplay.innerText = userProfile.email;

    const dbAvatar = document.getElementById('dashboard-user-avatar');
    const stAvatar = document.getElementById('settings-user-avatar');
    if (dbAvatar) dbAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);
    if (stAvatar) stAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);

    const dbName = document.getElementById('dashboard-user-name');
    if (dbName) dbName.innerText = userProfile.name;

    const hr = new Date().getHours();
    let greet = 'Good Morning';
    if (hr >= 12 && hr < 17) greet = 'Good Afternoon';
    else if (hr >= 17) greet = 'Good Evening';
    const greetingLabel = document.getElementById('greeting-label');
    if (greetingLabel) greetingLabel.innerText = greet;

    initAvatars();
}

function subscribeSupabaseRealtime() {
    if (!supabaseClient || !supabaseClient.channel) return;
    disconnectSupabaseRealtime();
    supabaseRealtimeChannel = supabaseClient
        .channel(`expenledge-${supabaseConfig.deviceId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'expenledge_state',
            filter: `app_id=eq.${SUPABASE_APP_ID}`
        }, (payload) => {
            const row = payload?.new || payload?.old;
            if (!row || row.device_id === supabaseConfig.deviceId) return;
            if (supabaseIntegration.pendingSync) return;
            const remoteAt = row.updated_at || row.inserted_at || new Date().toISOString();
            const localAt = lastStateChangeAt ? new Date(lastStateChangeAt).getTime() : 0;
            const remoteTime = new Date(remoteAt).getTime();
            if (Number.isFinite(localAt) && Number.isFinite(remoteTime) && localAt > remoteTime) return;
            if (applySupabasePayloadToApp(row.payload, { remoteAt })) {
                setSupabaseStatus('Supabase connected and synced', true, false);
            }
        })
        .subscribe(status => {
            if (status === 'SUBSCRIBED') {
                setSupabaseStatus('Supabase connected and listening', true, false);
            }
        });
}

async function pullSupabaseSnapshot() {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
        .from('expenledge_state')
        .select('payload, updated_at, device_id')
        .eq('app_id', SUPABASE_APP_ID)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        supabaseIntegration.lastError = error.message || String(error);
        setSupabaseStatus(`Supabase error: ${supabaseIntegration.lastError}`, false, true);
        return null;
    }
    return data || null;
}

function queueSupabaseSync() {
    if (!shouldQueueSupabaseSync()) return;
    supabaseIntegration.pendingSync = true;
    if (supabaseIntegration.syncInProgress) return;
    if (supabaseSyncTimer) clearTimeout(supabaseSyncTimer);
    supabaseSyncTimer = setTimeout(() => {
        processSupabaseSyncQueue().catch(() => {});
    }, 900);
}

async function processSupabaseSyncQueue() {
    if (!shouldQueueSupabaseSync() || supabaseIntegration.syncInProgress || supabaseIntegration.connecting) return false;
    if (!supabaseIntegration.pendingSync) return false;
    return syncSupabaseNow();
}

function animateFabOnSync(result) {
    const fab = document.querySelector('#global-structured-fab button');
    if (!fab) return;
    if (!document.getElementById('fab-sync-keyframes')) {
        const style = document.createElement('style');
        style.id = 'fab-sync-keyframes';
        style.textContent = [
            '@keyframes fab-rotate-left { 0% { transform: rotate(0deg); } 60% { transform: rotate(-180deg); } 100% { transform: rotate(-360deg); } }',
            '@keyframes fab-rotate-right { 0% { transform: rotate(0deg); } 60% { transform: rotate(180deg); } 100% { transform: rotate(360deg); } }',
            '@keyframes fab-nod { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(-15deg); } 40% { transform: rotate(15deg); } 60% { transform: rotate(-10deg); } 80% { transform: rotate(10deg); } }'
        ].join('');
        document.head.appendChild(style);
    }
    fab.style.animation = 'none';
    void fab.offsetWidth;
    if (result === 'success') {
        fab.style.animation = 'fab-rotate-left 0.6s ease-in-out';
    } else if (result === 'fail') {
        fab.style.animation = 'fab-rotate-right 0.6s ease-in-out';
    } else if (result === 'error') {
        fab.style.animation = 'fab-nod 0.7s ease-in-out';
    }
}

async function syncSupabaseNow() {
    if (!supabaseClient) {
        setSupabaseStatus('Supabase is not connected', false, true);
        showToast('Connect Supabase first');
        animateFabOnSync('error');
        return false;
    }
    if (supabaseIntegration.syncInProgress) {
        supabaseIntegration.pendingSync = true;
        return false;
    }

    supabaseIntegration.syncInProgress = true;
    supabaseIntegration.pendingSync = true;
    setSupabaseStatus('Syncing to Supabase…', true, false);
    try {
        const latest = await pullSupabaseSnapshot();
        const remoteStorage = latest?.payload?.storage && typeof latest.payload.storage === 'object' ? latest.payload.storage : {};
        const mergedStorage = mergeSupabaseStorageSnapshots(getSupabaseStorageSnapshot(), remoteStorage);

        applyStorageSnapshotToLocal(mergedStorage);
        loadFromLocalStorage();
        refreshAppUiFromState();

        const payload = buildCloudSnapshotFromStorage(mergedStorage);
        const row = {
            app_id: SUPABASE_APP_ID,
            device_id: supabaseConfig.deviceId,
            payload,
            updated_at: new Date().toISOString()
        };
        const { error } = await supabaseClient
            .from('expenledge_state')
            .upsert(row, { onConflict: 'app_id,device_id' });

        if (error) throw error;

        await writeSupabaseVersionSnapshot(payload, row.updated_at);

        supabaseIntegration.pendingSync = false;
        supabaseIntegration.lastError = '';
        updateSupabaseSyncTime();
        setSupabaseStatus('Supabase synced successfully', true, false);
        animateFabOnSync('success');
        return true;
    } catch (error) {
        supabaseIntegration.lastError = error?.message || String(error);
        setSupabaseStatus(`Sync failed: ${supabaseIntegration.lastError}`, true, true);
        showToast('Supabase sync failed');
        animateFabOnSync('fail');
        return false;
    } finally {
        supabaseIntegration.syncInProgress = false;
        supabaseIntegration.connecting = false;
        if (supabaseIntegration.pendingSync && shouldQueueSupabaseSync()) {
            if (supabaseSyncTimer) clearTimeout(supabaseSyncTimer);
            supabaseSyncTimer = setTimeout(() => {
                processSupabaseSyncQueue().catch(() => {});
            }, 1200);
        }
    }
}
async function connectSupabaseFromSheet() {
    const urlInput = document.getElementById('supabase-project-url');
    const keyInput = document.getElementById('supabase-anon-key');
    // Fall back to saved supabaseConfig when called from auto-init (sheet not open)
    const url = (urlInput?.value?.trim() || supabaseConfig.url || '');
    const anonKey = (keyInput?.value?.trim() || supabaseConfig.anonKey || '');

    if (!url || !anonKey) {
        return;
    }
    if (!window.supabase?.createClient) {
        showToast('Supabase client script is missing');
        return;
    }

    supabaseConfig.url = url;
    supabaseConfig.anonKey = anonKey;
    persistSupabaseCredentials();

    try {
        supabaseIntegration.connecting = true;
        supabaseClient = window.supabase.createClient(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        setSupabaseStatus('Connecting…', false, false);
        const latest = await pullSupabaseSnapshot();
        const localStorageSnapshot = getSupabaseStorageSnapshot();
        const remoteStorage = latest?.payload?.storage && typeof latest.payload.storage === 'object' ? latest.payload.storage : {};
        const mergedStorage = mergeSupabaseStorageSnapshots(localStorageSnapshot, remoteStorage);

        supabaseIntegration.applyingRemote = true;
        applyStorageSnapshotToLocal(mergedStorage);
        loadFromLocalStorage();
        refreshAppUiFromState();
        supabaseIntegration.applyingRemote = false;

        subscribeSupabaseRealtime();
        supabaseIntegration.connected = true;
        supabaseIntegration.pendingSync = true;
        supabaseIntegration.lastError = '';
        setSupabaseStatus('Connected', true, false);
        await syncSupabaseNow();
    } catch (error) {
        supabaseIntegration.connected = false;
        supabaseIntegration.lastError = error?.message || String(error);
        setSupabaseStatus(`Connection failed: ${supabaseIntegration.lastError}`, false, true);
        showToast('Supabase connect failed');
    } finally {
        supabaseIntegration.connecting = false;
        supabaseIntegration.applyingRemote = false;
    }
}
function initializeSupabaseFromSavedCredentials() {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (!saved || !window.supabase?.createClient) {
        setSupabaseStatus('Supabase not connected', false, false);
        updateBackupTimeDisplay();
        return;
    }

    const parsed = JSON.parse(saved);
    if (!parsed?.url || !parsed?.anonKey) {
        setSupabaseStatus('Supabase not connected', false, false);
        return;
    }

    supabaseConfig = {
        ...supabaseConfig,
        ...parsed,
        appId: SUPABASE_APP_ID,
        deviceId: parsed.deviceId || supabaseConfig.deviceId
    };
    persistSupabaseCredentials();
    connectSupabaseFromSheet().catch(err => console.error('Supabase init failed:', err));
}

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    // Capitalize first letter of every text input
    document.addEventListener('input', function(e) {
        const target = e.target;
        if (target.tagName === 'INPUT' && target.type === 'text') {
            const val = target.value;
            if (val.length > 0) {
                const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                if (target.value !== capitalized) {
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    target.value = capitalized;
                    target.setSelectionRange(start, end);
                }
            }
        }
    });

    history.replaceState({ viewId: 'home' }, '', '');
    loadFromLocalStorage();
    suppressBrowserAutofill();
    syncCategoryLayoutUI();
    syncManageCategoryLayoutUI();

    const autofillObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node && node.nodeType === 1) {
                    suppressBrowserAutofill(node);
                }
            });
        }
    });
    autofillObserver.observe(document.body, { childList: true, subtree: true });

    // Set initial budget visibility and states
    toggleBudgetActiveState(budgetEnabled);
    setBudgetPeriod(budgetPeriod);
    setAnalysisPeriod(analysisPeriod);
    setAnalysisCatType(analysisCatType);

    // Check onboarding
    const onboarded = localStorage.getItem('expenledge_onboarded');
    if (!onboarded || !userProfile.name || !userProfile.email) {
        document.getElementById('onboarding-screen').classList.remove('hidden');
    } else {
        document.getElementById('onboarding-screen').classList.add('hidden');
    }

    updateSheetMonthLabels();
    updateDashboard();
    updateAnalysis();
    updateAccounts();
    updateBudget();
    applyBackupSheetPreferences();

    // Sync profile display in settings header
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    if (nameDisplay) nameDisplay.innerText = userProfile.name;
    if (emailDisplay) emailDisplay.innerText = userProfile.email;

    const dbAvatar = document.getElementById('dashboard-user-avatar');
    const stAvatar = document.getElementById('settings-user-avatar');
    if (dbAvatar) {
        dbAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);
    }
    if (stAvatar) {
        stAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);
    }

    // Populate the onboarding and settings avatar selector grids
    initAvatars();

    // Sync dashboard name
    const dbName = document.getElementById('dashboard-user-name');
    if (dbName) dbName.innerText = userProfile.name;

    // Set dynamic greeting based on hour
    const hr = new Date().getHours();
    let greet = "Good Morning";
    if (hr >= 12 && hr < 17) greet = "Good Afternoon";
    else if (hr >= 17) greet = "Good Evening";
    document.getElementById('greeting-label').innerText = greet;

    // Start background scheduler checks
    setInterval(checkScheduledTransactions, 5000);

    // Sync Cash in Balance toggle on the Accounts page
    const accCashToggle = document.getElementById('acc-include-cash-toggle');
    if (accCashToggle) accCashToggle.checked = includeCashInBalance;

    // Block Google Payments overlay: add autocomplete=off to all number/text inputs
    document.querySelectorAll('input[type="number"], input[type="text"], input[type="email"]').forEach(el => {
        if (!el.hasAttribute('autocomplete')) el.setAttribute('autocomplete', 'off');
        el.setAttribute('data-lpignore', 'true');
    });

    supabaseIntegration.booting = false;
    supabaseInitialLoadDone = true;
    initializeSupabaseFromSavedCredentials();
});


function initAvatars() {
    const colors = [
        'bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500',
        'bg-sky-500', 'bg-cyan-500', 'bg-teal-500', 'bg-green-500', 'bg-orange-500'
    ];
    const onboardGrid = document.getElementById('onboard-avatar-grid');
    if (onboardGrid) {
        onboardGrid.innerHTML = '';
        colors.forEach((col, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            const isDefault = index === 0;
            btn.className = `w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border ${isDefault ? 'border-2 border-primary scale-110' : 'border-transparent scale-90'}`;
            btn.onclick = () => selectOnboardAvatar(col, btn);
            btn.innerHTML = `<div class="w-full h-full rounded-full ${col} text-white flex items-center justify-center font-bold text-sm uppercase">U</div>`;
            onboardGrid.appendChild(btn);
        });
        const nameInput = document.getElementById('onboard-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                const val = nameInput.value.trim().charAt(0).toUpperCase() || 'U';
                const circles = document.querySelectorAll('#onboard-avatar-grid button div');
                circles.forEach(c => c.innerText = val);
            });
        }
    }
    const profileGrid = document.getElementById('profile-avatar-grid');
    if (profileGrid) {
        profileGrid.innerHTML = '';
        colors.forEach((col, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border border-transparent scale-90`;
            btn.onclick = () => selectProfileAvatar(col, btn);
            const initial = userProfile.name ? userProfile.name.trim().charAt(0).toUpperCase() : 'U';
            btn.innerHTML = `<div class="w-full h-full rounded-full ${col} text-white flex items-center justify-center font-bold text-sm uppercase">${initial}</div>`;
            profileGrid.appendChild(btn);
        });
        const profNameInput = document.getElementById('profile-input-name');
        if (profNameInput) {
            profNameInput.addEventListener('input', () => {
                const val = profNameInput.value.trim().charAt(0).toUpperCase() || 'U';
                const circles = document.querySelectorAll('#profile-avatar-grid button div');
                circles.forEach(c => c.innerText = val);
            });
        }
    }
}

function selectOnboardAvatar(col, btn) {
    document.getElementById('onboard-selected-avatar').value = col;
    const buttons = document.querySelectorAll('#onboard-avatar-grid button');
    buttons.forEach(b => {
        b.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border border-transparent scale-90";
    });
    btn.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border-2 border-primary scale-110";
}

function submitOnboarding(event) {
    event.preventDefault();
    const name = document.getElementById('onboard-name').value.trim();
    const email = document.getElementById('onboard-email').value.trim();
    const avatar = document.getElementById('onboard-selected-avatar').value;
    if (!name || !email) {
        showToast("Please enter a valid name and email address");
        return;
    }
    userProfile.name = name;
    userProfile.email = email;
    userProfile.avatar = avatar;
    localStorage.setItem('expenledge_profile', JSON.stringify(userProfile));
    localStorage.setItem('expenledge_onboarded', 'true');

    // Hide onboarding screen
    document.getElementById('onboarding-screen').classList.add('hidden');

    // Update labels and avatars
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    if (nameDisplay) nameDisplay.innerText = userProfile.name;
    if (emailDisplay) emailDisplay.innerText = userProfile.email;

    const dbAvatar = document.getElementById('dashboard-user-avatar');
    const stAvatar = document.getElementById('settings-user-avatar');
    if (dbAvatar) {
        dbAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);
    }
    if (stAvatar) {
        stAvatar.innerHTML = getAvatarHtml(userProfile.name, userProfile.avatar);
    }

    const dbName = document.getElementById('dashboard-user-name');
    if (dbName) dbName.innerText = userProfile.name;

    updateDashboard();
    showToast(`Welcome to ExpenLedge, ${name}!`);
}

// View router
function switchView(viewId, isBackNavigation = false) {
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        activeView.classList.add('active');
    }
    currentView = viewId;
    if (viewId !== 'home') closeDashboardSearch(false);

    // Show/hide footer navigation bar and global FAB
    const footerNav = document.querySelector('nav');
    if (footerNav) {
        const mainViews = ['home', 'analysis', 'accounts', 'more'];
        if (mainViews.includes(viewId)) {
            footerNav.classList.remove('hidden');
        } else {
            footerNav.classList.add('hidden');
        }
    }

    const globalFab = document.getElementById('global-structured-fab');
    if (globalFab) {
        if (viewId === 'structured-tx') {
            globalFab.classList.remove('hidden');
        } else {
            globalFab.classList.add('hidden');
        }
    }

    // Scroll to top on view changes
    try {
        window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
        window.scrollTo(0, 0);
    }

    // Update tab button styles
    const navButtons = {
        home: document.getElementById('nav-btn-home'),
        analysis: document.getElementById('nav-btn-analysis'),
        accounts: document.getElementById('nav-btn-accounts'),
        more: document.getElementById('nav-btn-more')
    };

    for (const key in navButtons) {
        if (navButtons[key]) {
            if (key === viewId) {
                navButtons[key].classList.add('text-primary', 'font-bold');
                navButtons[key].classList.remove('text-on-surface-variant', 'opacity-70');
                const icon = navButtons[key].querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            } else {
                navButtons[key].classList.remove('text-primary', 'font-bold');
                navButtons[key].classList.add('text-on-surface-variant', 'opacity-70');
                const icon = navButtons[key].querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 0";
            }
        }
    }

    // Sync specific view content
    if (viewId === 'home') updateDashboard();
    if (viewId === 'analysis') updateAnalysis();
    if (viewId === 'accounts') updateAccounts();
    if (viewId === 'budget') updateBudget();
    if (viewId === 'transactions-all') updateAllTransactionsView();
    if (viewId === 'structured-tx') renderStructuredTx();

    if (!isBackNavigation) {
        history.pushState({ viewId: viewId }, '', '');
    }
}

let structuredTxMode = 'day';
let structuredSelectedDate = new Date();
let structuredTypeFilter = null; // 'expense', 'income', or null

function toggleStructuredFilter(type) {
    if (structuredTypeFilter === type) {
        structuredTypeFilter = null; // Toggle off
    } else {
        structuredTypeFilter = type; // Toggle on
    }
    updateStructuredFilterUI();
    renderStructuredTx();
}

function updateStructuredFilterUI() {
    const spentCard = document.getElementById('structured-spent-card');
    const incomeCard = document.getElementById('structured-income-card');
    if (!spentCard || !incomeCard) return;
    
    if (structuredTypeFilter === 'expense') {
        spentCard.classList.remove('opacity-50');
        spentCard.classList.add('border-secondary', 'border-2');
        
        incomeCard.classList.add('opacity-50');
        incomeCard.classList.remove('border-primary', 'border-2');
    } else if (structuredTypeFilter === 'income') {
        incomeCard.classList.remove('opacity-50');
        incomeCard.classList.add('border-primary', 'border-2');
        
        spentCard.classList.add('opacity-50');
        spentCard.classList.remove('border-secondary', 'border-2');
    } else {
        spentCard.classList.remove('opacity-50', 'border-secondary', 'border-2');
        incomeCard.classList.remove('opacity-50', 'border-primary', 'border-2');
    }
}

function openStructuredTxView(mode) {
    structuredTxMode = mode;
    structuredSelectedDate = new Date(); // Reset to today on entry

    structuredTypeFilter = null;
    updateStructuredFilterUI();
    const searchInput = document.getElementById('structured-search-input');
    if (searchInput) searchInput.value = '';

    const titleEl = document.getElementById('structured-tx-title');
    const subtitleEl = document.getElementById('structured-tx-subtitle');

    if (mode === 'day') {
        if (titleEl) titleEl.innerText = "Day-wise";
        if (subtitleEl) subtitleEl.innerText = "All transactions grouped by date";
    } else if (mode === 'month') {
        if (titleEl) titleEl.innerText = "Month-wise";
        if (subtitleEl) subtitleEl.innerText = "All transactions grouped by month";
    } else if (mode === 'custom') {
        if (titleEl) titleEl.innerText = "Custom Range";
        if (subtitleEl) subtitleEl.innerText = "Transactions in a specific range";

        // Seed default custom dates (start of month to today) if empty
        const fromEl = document.getElementById('structured-date-from');
        const toEl = document.getElementById('structured-date-to');
        if (fromEl && !fromEl.value) {
            const now = new Date();
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            fromEl.value = first.toISOString().slice(0, 10);
            toEl.value = now.toISOString().slice(0, 10);
        }
    }

    switchView('structured-tx');
}

function backToHomeFromStructuredTx() {
    switchView('home');
}

function structuredTxNavPrev() {
    if (structuredTxMode === 'day') {
        structuredSelectedDate.setDate(structuredSelectedDate.getDate() - 1);
    } else if (structuredTxMode === 'month') {
        structuredSelectedDate.setMonth(structuredSelectedDate.getMonth() - 1);
    }
    renderStructuredTx();
}

function structuredTxNavNext() {
    if (structuredTxMode === 'day') {
        structuredSelectedDate.setDate(structuredSelectedDate.getDate() + 1);
    } else if (structuredTxMode === 'month') {
        structuredSelectedDate.setMonth(structuredSelectedDate.getMonth() + 1);
    }
    renderStructuredTx();
}

let allTxRenderLimit = 50;
let structuredTxRenderLimit = 50;
let accountDetailsTxRenderLimit = 50;
let incomeTxRenderLimit = 50;
let spendingTxRenderLimit = 50;

function getTransactionRenderBatchSize() {
    const deviceMemory = navigator.deviceMemory || 8;
    const cpuCores = navigator.hardwareConcurrency || 8;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile || deviceMemory <= 4 || cpuCores <= 4 ? 20 : 50;
}

function renderStructuredTx(loadMore = false) {
    const wasStructured = (currentView === 'structured-tx');
    const scrollPos = wasStructured ? window.scrollY : 0;

    if (!loadMore) {
        structuredTxRenderLimit = 50;
    }
    const listContainer = document.getElementById('structured-tx-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const navContainer = document.getElementById('structured-period-nav');
    const labelEl = document.getElementById('structured-period-label');
    const sublabelEl = document.getElementById('structured-period-sublabel');

    if (structuredTxMode === 'custom') {
        if (navContainer) navContainer.classList.add('hidden');
    } else {
        if (navContainer) navContainer.classList.remove('hidden');
        if (structuredTxMode === 'day') {
            const todayStr = getRelativeDateString(new Date());
            const selectedStr = getRelativeDateString(structuredSelectedDate);

            if (labelEl) {
                labelEl.innerText = selectedStr;
            }
            if (sublabelEl) {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                sublabelEl.innerText = days[structuredSelectedDate.getDay()];
            }
        } else if (structuredTxMode === 'month') {
            if (labelEl) {
                labelEl.innerText = `${monthNames[structuredSelectedDate.getMonth()]} ${structuredSelectedDate.getFullYear()}`;
            }
            if (sublabelEl) {
                sublabelEl.innerText = 'Monthly Summary';
            }
        }
    }

    const customContainer = document.getElementById('structured-custom-date-container');
    if (customContainer) {
        if (structuredTxMode === 'custom') {
            customContainer.classList.remove('hidden');
        } else {
            customContainer.classList.add('hidden');
        }
    }

    let filtered = [];
    if (structuredTxMode === 'day') {
        filtered = transactions.filter(t => {
            const txDate = getTransactionDate(t);
            return txDate.getDate() === structuredSelectedDate.getDate() &&
                txDate.getMonth() === structuredSelectedDate.getMonth() &&
                txDate.getFullYear() === structuredSelectedDate.getFullYear();
        });
    } else if (structuredTxMode === 'month') {
        filtered = transactions.filter(t => {
            const txDate = getTransactionDate(t);
            return txDate.getMonth() === structuredSelectedDate.getMonth() &&
                txDate.getFullYear() === structuredSelectedDate.getFullYear();
        });
    } else if (structuredTxMode === 'custom') {
        const fromEl = document.getElementById('structured-date-from');
        const toEl = document.getElementById('structured-date-to');
        const fromVal = fromEl ? fromEl.value : '';
        const toVal = toEl ? toEl.value : '';
        if (fromVal && toVal) {
            const fromDate = new Date(fromVal); fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(toVal); toDate.setHours(23, 59, 59, 999);
            filtered = transactions.filter(t => {
                const txDate = getTransactionDate(t);
                const checkDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
                return checkDate >= fromDate && checkDate <= toDate;
            });
        }
    }

    // Update compact totals cards (always, including zero state, based on date filter only)
    const totalSpendingEl = document.getElementById('structured-total-spending');
    const totalIncomeEl = document.getElementById('structured-total-income');
    const totalBalanceEl = document.getElementById('structured-total-balance');
    const txCountEl = document.getElementById('structured-tx-count');
    {
        let sumSpend = 0, sumInc = 0;
        filtered.forEach(t => {
            if (t.type === 'income') sumInc += t.amount;
            else sumSpend += t.amount;
        });
        const bal = sumInc - sumSpend;
        if (totalSpendingEl) totalSpendingEl.innerText = `₹${sumSpend.toFixed(2)}`;
        if (totalIncomeEl) totalIncomeEl.innerText = `₹${sumInc.toFixed(2)}`;
        if (totalBalanceEl) {
            const prefix = bal >= 0 ? '+' : '-';
            totalBalanceEl.innerText = `${prefix}₹${Math.abs(bal).toFixed(2)}`;
            const balCard = document.getElementById('structured-balance-card');
            if (balCard) {
                balCard.className = `px-4 py-1.5 rounded-full ${bal >= 0 ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'}`;
            }
        }
    }

    const periodTransactions = filtered;

    // Apply mini search bar filter
    const queryVal = document.getElementById('structured-search-input') ? document.getElementById('structured-search-input').value : '';
    if (queryVal) {
        filtered = filtered.filter(t => matchTransaction(t, queryVal));
    }

    // Apply tab spent/income filters
    if (structuredTypeFilter) {
        filtered = filtered.filter(t => t.type === (structuredTypeFilter === 'expense' ? 'expense' : 'income'));
    }

    if (txCountEl) {
        txCountEl.innerText = `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-on-surface-variant py-lg">No transactions found</p>`;
        // Restore scroll even for zero state if user had scrolled
        if (wasStructured && scrollPos > 0) {
            window.scrollTo(0, scrollPos);
        }
        return;
    }

    const totalMatching = filtered.length;
    const itemsToRender = filtered.slice(0, structuredTxRenderLimit);

    const getStructuredGroupName = (transaction) => {
        if (structuredTxMode === 'month') {
            const txDate = getTransactionDate(transaction);
            return `${monthNames[txDate.getMonth()]} ${txDate.getFullYear()}`;
        }
        return transaction.date;
    };

    // Keep group totals accurate even when the card initially renders only one batch.
    // Like the header totals, these stay based on the selected date period, not search text.
    const groupTotals = {};
    periodTransactions.forEach(transaction => {
        const groupName = getStructuredGroupName(transaction);
        if (!groupTotals[groupName]) groupTotals[groupName] = { income: 0, spending: 0 };
        if (transaction.type === 'income') groupTotals[groupName].income += transaction.amount;
        else groupTotals[groupName].spending += transaction.amount;
    });

    // Now group the currently visible transaction items.
    const groups = {};
    itemsToRender.forEach(transaction => {
        const groupName = getStructuredGroupName(transaction);
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(transaction);
    });

    for (const groupName in groups) {
        const groupCard = document.createElement('div');
        groupCard.className = "bg-surface-container p-md rounded-xl border border-outline-variant/10 space-y-md shadow-sm";

        const safeId = groupName.replace(/[^a-zA-Z0-9]/g, '-');

        const totals = groupTotals[groupName] || { income: 0, spending: 0 };
        const balance = totals.income - totals.spending;
        const balanceClass = balance >= 0 ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary';

        groupCard.innerHTML = `
            <div class="border-b border-outline-variant/10 pb-sm space-y-sm">
                <span class="text-label-md font-bold text-primary uppercase tracking-wider">${groupName}</span>
                <div class="flex flex-wrap gap-xs text-[11px] font-semibold">
                    <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full">Out: ₹${totals.spending.toFixed(2)}</span>
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full">In: ₹${totals.income.toFixed(2)}</span>
                    <span class="${balanceClass} px-3 py-1 rounded-full">Bal: ${balance >= 0 ? '+' : '-'}₹${Math.abs(balance).toFixed(2)}</span>
                </div>
            </div>
            <div class="space-y-sm" id="structured-group-list-${safeId}">
            </div>
        `;

        listContainer.appendChild(groupCard);

        const subContainer = groupCard.querySelector(`#structured-group-list-${safeId}`);
        groups[groupName].forEach(t => {
            const isInc = t.type === 'income';
            const itemEl = document.createElement('div');
            itemEl.className = "p-sm rounded-lg flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]";
            bindLongPress(itemEl, t);

            let colorClass = "text-secondary bg-secondary-container/20";
            if (isInc) colorClass = "text-primary bg-primary-container/20";

            itemEl.innerHTML = `
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${colorClass} flex-shrink-0">
                    <span class="material-symbols-outlined text-[20px]">${t.categoryIcon || 'payments'}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center gap-sm">
                        <p class="text-body-md font-semibold text-on-surface break-words whitespace-normal">${t.note || t.category}</p>
                        <p class="text-body-md font-bold flex-shrink-0 ${isInc ? 'text-primary' : 'text-secondary'}">${isInc ? '+' : '-'}₹${t.amount.toFixed(2)}</p>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                        <p class="text-label-md text-on-surface-variant">${t.date}</p>
                        <span class="flex-shrink-0">${getTxAccountBadge(t)}</span>
                    </div>
                </div>
            `;
            // Add click to edit
            itemEl.onclick = (e) => {
                if (longPressTriggered) return;
                openEditTransactionModal(t);
            };
            subContainer.appendChild(itemEl);
        });
    }

    if (totalMatching > structuredTxRenderLimit) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = "w-full py-md bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-xl shadow-sm border border-outline-variant/10 transition-colors my-md active:scale-[0.98]";
        loadMoreBtn.innerText = `Load More (${totalMatching - structuredTxRenderLimit} remaining)`;
        loadMoreBtn.onclick = () => {
            structuredTxRenderLimit += 50;
            renderStructuredTx(true);
        };
        listContainer.appendChild(loadMoreBtn);
    }

    // Restore scroll position
    if (wasStructured && scrollPos > 0) {
        window.scrollTo(0, scrollPos);
        setTimeout(() => {
            window.scrollTo(0, scrollPos);
        }, 0);
    }
}


// Dashboard renderer
function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;
    let dashboardSpent = 0;

    transactions.forEach(t => {
        if (transactionBelongsToFilter(t)) {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        }
    });

    const balance = totalIncome - totalExpense;

    // Calculate carry forward balance
    let totalAssets = 0;
    let totalLiabilities = 0;
    userAccounts.forEach(acc => {
        if (acc.type !== 'cash') return;
        let bal = acc.startingBalance;
        transactions.forEach(t => {
            if (t.paymentMode === acc.name) {
                if (acc.type === 'card') {
                    if (t.type === 'expense') bal += t.amount;
                    else bal -= t.amount;
                } else {
                    if (t.type === 'expense') bal -= t.amount;
                    else bal += t.amount;
                }
            } else if (!userAccounts.some(a => a.name === t.paymentMode)) {
                // Legacy fallback mapping
                if (acc.type === 'card' && (t.paymentMode === 'Credit Card' || t.paymentMode === 'card')) {
                    if (t.type === 'expense') bal += t.amount;
                    else bal -= t.amount;
                } else if (acc.type === 'cash' && (t.paymentMode === 'Cash' || t.paymentMode === 'cash')) {
                    if (t.type === 'expense') bal -= t.amount;
                    else bal += t.amount;
                } else if (acc.type === 'bank' && acc.id === 'bank') {
                    if (t.paymentMode !== 'Cash' && t.paymentMode !== 'cash' && t.paymentMode !== 'Credit Card' && t.paymentMode !== 'card') {
                        if (t.type === 'expense') bal -= t.amount;
                        else bal += t.amount;
                    }
                }
            }
        });
        if (acc.type === 'card') {
            totalLiabilities += bal;
        } else {
            totalAssets += bal;
        }
    });
    const carryForward = totalAssets - totalLiabilities;

    // Calculate all time net balance
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    transactions.forEach(t => {
        if (t.type === 'income') allTimeIncome += t.amount;
        else allTimeExpense += t.amount;
    });
    const allTimeNet = allTimeIncome - allTimeExpense;

    // Select the balance to show
    let displayBalance = balance;
    if (typeof activeDashboardBalanceType !== 'undefined') {
        if (activeDashboardBalanceType === 'carry') displayBalance = carryForward;
        else if (activeDashboardBalanceType === 'alltime') displayBalance = allTimeNet;
    }

    const spendingEl = document.getElementById('stat-spending');
    const incomeEl = document.getElementById('stat-income');
    if (spendingEl) { spendingEl.innerText = formatAmount(totalExpense); fitText(spendingEl); }
    if (incomeEl) { incomeEl.innerText = formatAmount(totalIncome); fitText(incomeEl); }

    const balanceEl = document.getElementById('stat-balance');
    if (balanceEl) {
        const sign = displayBalance >= 0 ? '' : '-';
        balanceEl.innerText = `${sign}${formatAmount(Math.abs(displayBalance))}`;
        fitText(balanceEl);
    }

    renderRecentTransactions(transactions.filter(transactionBelongsToFilter));

    // Calculate yearly expenses
    let yearlyExpense = 0;
    transactions.forEach(t => {
        if (t.type === 'expense') {
            const txDate = getTransactionDate(t);
            if (txDate.getFullYear() === currentYear) {
                yearlyExpense += t.amount;
            }
        }
    });

    // Budget widget remaining
    let limit = monthlyBudgetLimit;
    let spent = totalExpense;
    if (typeof budgetPeriod !== 'undefined' && budgetPeriod === 'yearly') {
        limit = monthlyBudgetLimit * 12;
        spent = yearlyExpense;
    }
    const remaining = limit - spent;

    // Update Dashboard Elements
    const remainingEl = document.getElementById('budget-widget-remaining');
    if (remainingEl) {
        remainingEl.innerText = `Remaining: ₹${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    const cardProgress = document.getElementById('budget-card-progress');
    if (cardProgress) {
        const pct = Math.min((spent / limit) * 100, 100);
        cardProgress.style.width = `${pct}%`;
    }

    // Update Analysis Elements
    const aremainingEl = document.getElementById('analysis-budget-widget-remaining');
    if (aremainingEl) {
        aremainingEl.innerText = `Remaining: ₹${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    const acardProgress = document.getElementById('analysis-budget-card-progress');
    if (acardProgress) {
        const pct = Math.min((spent / limit) * 100, 100);
        acardProgress.style.width = `${pct}%`;
    }
}

function transactionBelongsToFilter(t) {
    const txDate = getTransactionDate(t);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth();

    if (dashboardFilter === 'month') {
        return txMonth === currentMonth && txYear === currentYear;
    } else if (dashboardFilter === 'year') {
        return txYear === currentYear;
    } else { // 'all'
        return true;
    }
}

function toggleDashboardFilterDropdown() {
    const dropdown = document.getElementById('dashboard-filter-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

function setDashboardFilter(filter) {
    dashboardFilter = filter;
    const label = document.getElementById('dashboard-filter-label');
    if (label) {
        if (filter === 'month') label.innerText = "This month";
        else if (filter === 'year') label.innerText = "This year";
        else label.innerText = "All time";
    }
    toggleDashboardFilterDropdown();
    saveToLocalStorage();
    syncAllViews();
}

function renderRecentTransactions(list) {
    const container = document.getElementById('recent-transactions-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<p class="text-center text-on-surface-variant py-md">No transactions found</p>`;
        return;
    }

    list.slice(0, 4).forEach(t => {
        const isInc = t.type === 'income';
        const card = document.createElement('div');
        card.className = "bg-surface-container p-md rounded-xl flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]";
        bindLongPress(card, t);

        // Color accent based on type
        let colorClass = "text-secondary bg-secondary-container/20";
        if (isInc) colorClass = "text-primary bg-primary-container/20";

        card.innerHTML = `
            <div class="w-12 h-12 rounded-full flex items-center justify-center ${colorClass}">
                <span class="material-symbols-outlined">${t.categoryIcon || 'payments'}</span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <p class="text-body-lg font-bold text-on-surface">${isInc ? '+' : '-'}₹${t.amount.toFixed(2)}</p>
                    <p class="text-label-md font-label-md text-on-surface-variant">${t.date}</p>
                </div>
                <div class="flex justify-between items-center gap-sm">
                    <p class="text-body-md text-on-surface-variant break-words whitespace-normal">${t.note || t.category}</p>
                    <span class="flex-shrink-0">${getTxAccountBadge(t)}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Analysis period pill control
function weekLabelStr(start) {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d) => `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
    const yr = start.getFullYear() === end.getFullYear() ? ` ${start.getFullYear()}` : ` ${start.getFullYear()}`;
    return `${fmt(start)}  –  ${fmt(end)}${yr}`;
}

function setAnalysisPeriod(period) {
    analysisPeriod = period;
    ['week', 'month', 'year', 'custom'].forEach(p => {
        const btn = document.getElementById(`analysis-pill-${p}`);
        if (!btn) return;
        if (p === period) {
            btn.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        } else {
            btn.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        }
    });
    // Show/hide navigators
    const monthNav = document.getElementById('analysis-period-nav');
    const weekNav = document.getElementById('analysis-week-nav');
    const customNav = document.getElementById('analysis-custom-nav');
    if (monthNav) monthNav.classList.toggle('hidden', period !== 'month' && period !== 'year');
    if (weekNav) weekNav.classList.toggle('hidden', period !== 'week');
    if (customNav) customNav.classList.toggle('hidden', period !== 'custom');
    // Seed custom dates if first time
    if (period === 'custom') {
        const fromEl = document.getElementById('analysis-custom-from');
        const toEl = document.getElementById('analysis-custom-to');
        if (fromEl && !fromEl.value) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            fromEl.value = firstDay.toISOString().slice(0, 10);
            toEl.value = now.toISOString().slice(0, 10);
        }
    }
    // Seed week label
    if (period === 'week') {
        const wl = document.getElementById('analysis-week-label');
        if (wl) wl.innerText = weekLabelStr(analysisWeekStart);
    }
    updateAnalysis();
    saveInterfacePreferences();
}

function changeAnalysisPeriod(dir) {
    if (analysisPeriod === 'month') {
        analysisMonth += dir;
        if (analysisMonth > 11) { analysisMonth = 0; analysisYear++; }
        if (analysisMonth < 0) { analysisMonth = 11; analysisYear--; }
    } else if (analysisPeriod === 'year') {
        analysisYear += dir;
    }
    updateAnalysis();
    saveInterfacePreferences();
}

function changeAnalysisWeek(dir) {
    analysisWeekStart.setDate(analysisWeekStart.getDate() + dir * 7);
    const wl = document.getElementById('analysis-week-label');
    if (wl) wl.innerText = weekLabelStr(analysisWeekStart);
    updateAnalysis();
    saveInterfacePreferences();
}

function setAnalysisCatType(type) {
    analysisCatType = type;
    ['spending', 'income'].forEach(t => {
        const btn = document.getElementById(`analysis-cat-pill-${t}`);
        if (!btn) return;
        if (t === type) {
            btn.className = "px-md py-xs rounded-full text-label-lg font-bold transition-all bg-primary text-on-primary shadow-sm";
        } else {
            btn.className = "px-md py-xs rounded-full text-label-lg font-bold transition-all text-on-surface-variant hover:bg-surface-container-high";
        }
    });
    updateAnalysis();
    saveInterfacePreferences();
}

function transactionBelongsToAnalysisPeriod(t) {
    const txDate = getTransactionDate(t);
    if (!txDate) return false;

    // Normalize time to midnight for consistency in date range checks
    const checkDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

    if (analysisPeriod === 'week') {
        const weekStart = new Date(analysisWeekStart.getFullYear(), analysisWeekStart.getMonth(), analysisWeekStart.getDate());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return checkDate >= weekStart && checkDate <= weekEnd;
    } else if (analysisPeriod === 'month') {
        return checkDate.getMonth() === analysisMonth && checkDate.getFullYear() === analysisYear;
    } else if (analysisPeriod === 'year') {
        return checkDate.getFullYear() === analysisYear;
    } else { // custom
        const fromEl = document.getElementById('analysis-custom-from');
        const toEl = document.getElementById('analysis-custom-to');
        if (!fromEl || !toEl || !fromEl.value || !toEl.value) return true;
        const from = new Date(fromEl.value); from.setHours(0, 0, 0, 0);
        const to = new Date(toEl.value); to.setHours(23, 59, 59, 999);
        return checkDate >= from && checkDate <= to;
    }
}

// Analysis view rendering
function updateAnalysis() {
    // Sync nav label on render
    const label = document.getElementById('analysis-month-label');
    if (label) {
        if (analysisPeriod === 'year') label.innerText = `${analysisYear}`;
        else label.innerText = `${monthNames[analysisMonth]} ${analysisYear}`;
    }
    const wl = document.getElementById('analysis-week-label');
    if (wl && analysisPeriod === 'week') wl.innerText = weekLabelStr(analysisWeekStart);

    const isSpending = analysisCatType === 'spending';
    const txType = isSpending ? 'expense' : 'income';

    // Calculate the complete period summary before narrowing the chart to one type.
    let totalIncome = 0;
    let totalSpending = 0;
    let total = 0;
    const categorySums = {};
    transactions.forEach(t => {
        if (!transactionBelongsToAnalysisPeriod(t)) return;

        const amt = Number(t.amount) || 0;
        if (t.type === 'income') totalIncome += amt;
        else totalSpending += amt;

        if (t.type === txType) {
            total += amt;
            if (t.category) {
                categorySums[t.category] = (categorySums[t.category] || 0) + amt;
            }
        }
    });

    const analysisIncomeEl = document.getElementById('analysis-total-income');
    const analysisSpendingEl = document.getElementById('analysis-total-spending');
    const analysisBalanceEl = document.getElementById('analysis-total-balance');
    const analysisBalanceCard = document.getElementById('analysis-balance-card');
    const analysisBalance = totalIncome - totalSpending;
    if (analysisIncomeEl) analysisIncomeEl.innerText = `₹${totalIncome.toFixed(2)}`;
    if (analysisSpendingEl) analysisSpendingEl.innerText = `₹${totalSpending.toFixed(2)}`;
    if (analysisBalanceEl) analysisBalanceEl.innerText = `${analysisBalance >= 0 ? '+' : '-'}₹${Math.abs(analysisBalance).toFixed(2)}`;
    if (analysisBalanceCard) {
        analysisBalanceCard.className = `px-4 py-1.5 rounded-full ${analysisBalance >= 0 ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'}`;
    }

    const totalLabel = document.getElementById('chart-total-spent');
    const totalLabelSub = totalLabel && totalLabel.previousElementSibling;
    if (totalLabel) totalLabel.innerText = `₹${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalLabelSub) totalLabelSub.innerText = isSpending ? 'Total Spent' : 'Total Earned';

    // Build dynamic list and donut chart
    const listContainer = document.getElementById('analysis-category-list');
    const svg = document.getElementById('donut-svg');
    if (!listContainer || !svg) return;

    listContainer.innerHTML = '';
    svg.innerHTML = '';

    // All known categories per type
    const allExpenseCats = expenseCategories.map(c => ({ name: c.name, icon: c.icon }));
    const allIncomeCats = incomeCategories.map(c => ({ name: c.name, icon: c.icon }));
    const allCats = isSpending ? allExpenseCats : allIncomeCats;

    const colors = {
        'Groceries': '#ff8a50', 'Shopping': '#40c4ff', 'Education': '#b388ff',
        'Transport': '#ff5252', 'Bills & Utilities': '#7e57c2', 'Entertainment': '#66bb6a',
        'Medical': '#ef5350', 'Food & Drinks': '#ffd54f',
        'Salary': '#69f0ae', 'Freelance': '#40c4ff', 'Investments': '#b388ff',
        'Gifts & Grants': '#ff8a50', 'Other Income': '#78909c'
    };
    const bgLightColors = {
        'Groceries': 'bg-orange-500/10 text-orange-400', 'Shopping': 'bg-blue-500/10 text-blue-400',
        'Education': 'bg-purple-500/10 text-purple-400', 'Transport': 'bg-red-500/10 text-red-400',
        'Bills & Utilities': 'bg-indigo-500/10 text-indigo-400', 'Entertainment': 'bg-green-500/10 text-green-400',
        'Medical': 'bg-red-400/10 text-red-300', 'Food & Drinks': 'bg-yellow-500/10 text-yellow-400',
        'Salary': 'bg-green-500/10 text-green-400', 'Freelance': 'bg-blue-500/10 text-blue-400',
        'Investments': 'bg-purple-500/10 text-purple-400', 'Gifts & Grants': 'bg-orange-500/10 text-orange-400',
        'Other Income': 'bg-surface-container-high text-on-surface-variant'
    };

    // Sort: non-zero first by amount desc, then zero alphabetically
    const withValue = allCats.filter(c => (categorySums[c.name] || 0) > 0)
        .sort((a, b) => (categorySums[b.name] || 0) - (categorySums[a.name] || 0));
    const withoutValue = allCats.filter(c => !(categorySums[c.name] > 0));
    const sortedCats = [...withValue, ...withoutValue];

    // Draw donut only for non-zero
    let offset = 0;
    withValue.forEach(cat => {
        const sum = categorySums[cat.name];
        const pct = total > 0 ? (sum / total) * 100 : 0;
        const strokeColor = colors[cat.name] || '#899484';
        const strokeDasharray = `${pct} ${100 - pct}`;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'donut-segment transition-all duration-500');
        circle.setAttribute('cx', '18'); circle.setAttribute('cy', '18');
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('r', '15.915');
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', '4.5');
        circle.setAttribute('stroke-dasharray', strokeDasharray);
        circle.setAttribute('stroke-dashoffset', (-offset).toString());
        svg.appendChild(circle);
        offset += pct;
    });

    // Draw all category rows (including zero)
    sortedCats.forEach(cat => {
        const sum = categorySums[cat.name] || 0;
        const pct = total > 0 && sum > 0 ? (sum / total) * 100 : 0;
        const bgLight = bgLightColors[cat.name] || 'bg-surface-container-high text-on-surface-variant';
        const isZero = sum === 0;

        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-md bg-surface-container rounded-xl transition-colors ${isZero ? 'opacity-40' : 'hover:bg-surface-container-high cursor-pointer'}`;
        if (!isZero) item.onclick = () => openCatTransactionsSheet(cat.name, cat.icon);
        item.innerHTML = `
            <div class="flex items-center gap-md">
                <div class="w-12 h-12 rounded-full flex items-center justify-center ${bgLight}">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${cat.icon}</span>
                </div>
                <div>
                    <p class="text-body-lg font-semibold">${cat.name}</p>
                    <p class="text-label-md text-on-surface-variant">${isZero ? 'No transactions' : pct.toFixed(1) + '% of total'}</p>
                </div>
            </div>
            <p class="text-body-lg font-bold ${isZero ? 'text-on-surface-variant' : ''}">₹${sum.toFixed(2)}</p>
        `;
        listContainer.appendChild(item);
    });
}

function openCatTransactionsSheet(catName, catIcon) {
    const txType = analysisCatType === 'spending' ? 'expense' : 'income';
    const filtered = transactions.filter(t =>
        t.type === txType &&
        t.category === catName &&
        transactionBelongsToAnalysisPeriod(t)
    );

    // Header
   