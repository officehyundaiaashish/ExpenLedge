// State storage
let transactions = [];
let userProfile = {
    name: "",
    email: "",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1",
    biometricLock: false
};
let budgetEnabled = false;
let monthlyBudgetLimit = 0;
let categoryBudgetLimits = {
    'Groceries': 0,
    'Shopping': 0,
    'Education': 0,
    'Transport': 0,
    'Bills & Utilities': 0,
    'Entertainment': 0,
    'Medical': 0,
    'Food & Drinks': 0
};
let accountBalances = {
    bank: 0.00,
    card: 0.00,
    cash: 0.00
};
let scheduledTransactions = [];
let dashboardFilter = 'month';
let editingTransactionId = null;
let selectedTxDateObj = new Date();
let currentTheme = 'dark';

let currentView = 'home';
let isSearching = false;

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let analysisPeriod = 'month'; // 'week' | 'month' | 'year' | 'custom'
let analysisYear = new Date().getFullYear();
let analysisMonth = new Date().getMonth();
let analysisWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; })();
let analysisCatType = 'spending'; // 'spending' | 'income'

// Add transaction state variables
let selectedTxType = 'expense';
let categoryLayout = 'grid';
let selectedCategory = 'Groceries';
let selectedCategoryIcon = 'shopping_basket';
let selectedPaymentMode = 'Cash';
let selectedPaymentIcon = 'payments';
let selectedTags = [];
let allAvailableTags = ['amazon 📦', 'netflix', 'vacation 🌴', 'work', 'fitness', 'dining_out', 'travel', 'utilities', 'gifts'];

const expenseCategories = [
    { name: 'Food & Drinks', icon: 'restaurant', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary' },
    { name: 'Groceries', icon: 'shopping_basket', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary' },
    { name: 'Shopping', icon: 'shopping_bag', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary' },
    { name: 'Transport', icon: 'commute', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary' },
    { name: 'Bills & Utilities', icon: 'receipt_long', color: 'bg-error/10 border-error/20 text-error', fillClass: 'group-hover:bg-error/20 text-error' },
    { name: 'Entertainment', icon: 'sports_esports', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary' },
    { name: 'Travel', icon: 'flight', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary' },
    { name: 'Medical', icon: 'medical_services', color: 'bg-error-container/20 border-error-container/30 text-error', fillClass: 'group-hover:bg-error-container/40 text-error' },
    { name: 'Education', icon: 'school', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary' }
];

const incomeCategories = [
    { name: 'Salary', icon: 'work', color: 'bg-primary-container/10 border-primary-container/20 text-primary', fillClass: 'group-hover:bg-primary-container/20 text-primary' },
    { name: 'Freelance', icon: 'laptop_mac', color: 'bg-tertiary-container/10 border-tertiary-container/20 text-tertiary', fillClass: 'group-hover:bg-tertiary-container/20 text-tertiary' },
    { name: 'Investments', icon: 'trending_up', color: 'bg-secondary-container/10 border-secondary-container/20 text-secondary', fillClass: 'group-hover:bg-secondary-container/20 text-secondary' },
    { name: 'Gifts & Grants', icon: 'redeem', color: 'bg-primary/10 border-primary/20 text-primary', fillClass: 'group-hover:bg-primary/20 text-primary' },
    { name: 'Other Income', icon: 'payments', color: 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant', fillClass: 'group-hover:bg-surface-container-highest text-on-surface-variant' }
];

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
        localStorage.setItem('expenledge_accounts', JSON.stringify(accountBalances));
        localStorage.setItem('expenledge_scheduled', JSON.stringify(scheduledTransactions));
    } catch (e) {
        console.error("Local storage save failed: ", e);
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

        const savedA = localStorage.getItem('expenledge_accounts');
        if (savedA) {
            accountBalances = JSON.parse(savedA);
            if (accountBalances.bank === 25650) accountBalances.bank = 0;
            if (accountBalances.card === 5521) accountBalances.card = 0;
            if (accountBalances.cash === 950) accountBalances.cash = 0;
        }

        const savedS = localStorage.getItem('expenledge_scheduled');
        if (savedS) scheduledTransactions = JSON.parse(savedS);

    } catch (e) {
        console.error("Local storage load failed: ", e);
    }
}

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    // Set initial budget visibility and states
    toggleBudgetActiveState(budgetEnabled);

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

    // Sync profile display in settings header
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    if (nameDisplay) nameDisplay.innerText = userProfile.name;
    if (emailDisplay) emailDisplay.innerText = userProfile.email;

    const dbAvatar = document.getElementById('dashboard-user-avatar');
    const stAvatar = document.getElementById('settings-user-avatar');
    if (dbAvatar) {
        dbAvatar.innerHTML = `<img src="${userProfile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1'}" class="w-full h-full object-cover rounded-full" />`;
    }
    if (stAvatar) {
        stAvatar.innerHTML = `<img src="${userProfile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1'}" class="w-full h-full object-cover rounded-full" />`;
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
});

function initAvatars() {
    const urls = Array.from({length: 20}, (_, i) => `https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_${i + 1}`);
    const onboardGrid = document.getElementById('onboard-avatar-grid');
    if (onboardGrid) {
        onboardGrid.innerHTML = '';
        urls.forEach((url, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            const isDefault = index === 0;
            btn.className = `w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border ${isDefault ? 'border-2 border-primary scale-110' : 'border-transparent scale-90'}`;
            btn.onclick = () => selectOnboardAvatar(url, btn);
            btn.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-full" alt="Avatar ${index + 1}" />`;
            onboardGrid.appendChild(btn);
        });
    }
    const profileGrid = document.getElementById('profile-avatar-grid');
    if (profileGrid) {
        profileGrid.innerHTML = '';
        urls.forEach((url, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border border-transparent scale-90`;
            btn.onclick = () => selectProfileAvatar(url, btn);
            btn.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-full" alt="Avatar ${index + 1}" />`;
            profileGrid.appendChild(btn);
        });
    }
}

function selectOnboardAvatar(url, btn) {
    document.getElementById('onboard-selected-avatar').value = url;
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
        dbAvatar.innerHTML = `<img src="${userProfile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1'}" class="w-full h-full object-cover rounded-full" />`;
    }
    if (stAvatar) {
        stAvatar.innerHTML = `<img src="${userProfile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1'}" class="w-full h-full object-cover rounded-full" />`;
    }

    const dbName = document.getElementById('dashboard-user-name');
    if (dbName) dbName.innerText = userProfile.name;
    
    updateDashboard();
    showToast(`Welcome to ExpenLedge, ${name}!`);
}

// View router
function switchView(viewId) {
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        activeView.classList.add('active');
    }
    currentView = viewId;

    // Show/hide footer navigation bar
    const footerNav = document.querySelector('nav');
    if (footerNav) {
        const mainViews = ['home', 'analysis', 'accounts', 'more'];
        if (mainViews.includes(viewId)) {
            footerNav.classList.remove('hidden');
        } else {
            footerNav.classList.add('hidden');
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
}

// Dashboard renderer
function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (transactionBelongsToFilter(t)) {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        }
    });

    const balance = totalIncome - totalExpense;

    // Calculate carry forward balance
    let bankAmt = accountBalances.bank;
    let cashAmt = accountBalances.cash;
    let cardAmt = accountBalances.card;
    transactions.forEach(t => {
        if (t.paymentMode === 'Cash') {
            if (t.type === 'expense') cashAmt -= t.amount;
            else cashAmt += t.amount;
        } else if (t.paymentMode === 'Credit Card') {
            if (t.type === 'expense') cardAmt += t.amount;
            else cardAmt -= t.amount;
        } else {
            if (t.type === 'expense') bankAmt -= t.amount;
            else bankAmt += t.amount;
        }
    });
    const carryForward = bankAmt + cashAmt - cardAmt;

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

    document.getElementById('stat-spending').innerText = `₹${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('stat-income').innerText = `₹${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const balanceEl = document.getElementById('stat-balance');
    if (balanceEl) {
        const sign = displayBalance >= 0 ? '' : '-';
        balanceEl.innerText = `${sign}₹${Math.abs(displayBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    renderRecentTransactions(transactions.filter(transactionBelongsToFilter));

    // Calculate yearly expenses
    let yearlyExpense = 0;
    const now = new Date();
    transactions.forEach(t => {
        if (t.type === 'expense') {
            let txYear = now.getFullYear();
            if (t.date !== 'Today') {
                const parts = t.date.split(' ');
                if (parts.length === 3) {
                    const y = parseInt(parts[2]);
                    txYear = y < 100 ? 2000 + y : y;
                }
            }
            if (txYear === currentYear) {
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
    const now = new Date();
    let txYear = 2024;
    let txMonth = 1;

    if (t.date === 'Today') {
        txYear = now.getFullYear();
        txMonth = now.getMonth();
    } else {
        const parts = t.date.split(' ');
        if (parts.length === 3) {
            const monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mIdx = monthAbbrs.indexOf(parts[1]);
            if (mIdx !== -1) txMonth = mIdx;
            const y = parseInt(parts[2]);
            txYear = y < 100 ? 2000 + y : y;
        }
    }

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
    updateDashboard();
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
                <div class="flex justify-between items-center">
                    <p class="text-body-md text-on-surface-variant">${t.note || t.category}</p>
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'}</span>
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
    const fmt = (d) => `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
    const yr = start.getFullYear() === end.getFullYear() ? ` ${start.getFullYear()}` : ` ${start.getFullYear()}`;
    return `${fmt(start)} – ${fmt(end)}${yr}`;
}

function setAnalysisPeriod(period) {
    analysisPeriod = period;
    ['week','month','year','custom'].forEach(p => {
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
    if (weekNav)  weekNav.classList.toggle('hidden', period !== 'week');
    if (customNav) customNav.classList.toggle('hidden', period !== 'custom');
    // Seed custom dates if first time
    if (period === 'custom') {
        const fromEl = document.getElementById('analysis-custom-from');
        const toEl   = document.getElementById('analysis-custom-to');
        if (fromEl && !fromEl.value) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            fromEl.value = firstDay.toISOString().slice(0,10);
            toEl.value   = now.toISOString().slice(0,10);
        }
    }
    // Seed week label
    if (period === 'week') {
        const wl = document.getElementById('analysis-week-label');
        if (wl) wl.innerText = weekLabelStr(analysisWeekStart);
    }
    updateAnalysis();
}

function changeAnalysisPeriod(dir) {
    if (analysisPeriod === 'month') {
        analysisMonth += dir;
        if (analysisMonth > 11) { analysisMonth = 0; analysisYear++; }
        if (analysisMonth < 0)  { analysisMonth = 11; analysisYear--; }
    } else if (analysisPeriod === 'year') {
        analysisYear += dir;
    }
    updateAnalysis();
}

function changeAnalysisWeek(dir) {
    analysisWeekStart.setDate(analysisWeekStart.getDate() + dir * 7);
    const wl = document.getElementById('analysis-week-label');
    if (wl) wl.innerText = weekLabelStr(analysisWeekStart);
    updateAnalysis();
}

function setAnalysisCatType(type) {
    analysisCatType = type;
    ['spending','income'].forEach(t => {
        const btn = document.getElementById(`analysis-cat-pill-${t}`);
        if (!btn) return;
        if (t === type) {
            btn.className = "px-md py-xs rounded-full text-label-lg font-bold transition-all bg-primary text-on-primary shadow-sm";
        } else {
            btn.className = "px-md py-xs rounded-full text-label-lg font-bold transition-all text-on-surface-variant hover:bg-surface-container-high";
        }
    });
    updateAnalysis();
}

function transactionBelongsToAnalysisPeriod(t) {
    const now = new Date();
    let txDate = null;
    if (t.date === 'Today') {
        txDate = new Date(); txDate.setHours(0,0,0,0);
    } else {
        const parts = t.date.split(' ');
        if (parts.length >= 2) {
            const monthIdx = monthNames.indexOf(parts[1]);
            if (monthIdx !== -1) {
                const yr = parts.length === 3 ? (parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2])) : now.getFullYear();
                txDate = new Date(yr, monthIdx, parseInt(parts[0]));
            }
        }
    }
    if (!txDate) return false;
    if (analysisPeriod === 'week') {
        const weekEnd = new Date(analysisWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23,59,59,999);
        return txDate >= analysisWeekStart && txDate <= weekEnd;
    } else if (analysisPeriod === 'month') {
        return txDate.getMonth() === analysisMonth && txDate.getFullYear() === analysisYear;
    } else if (analysisPeriod === 'year') {
        return txDate.getFullYear() === analysisYear;
    } else { // custom
        const fromEl = document.getElementById('analysis-custom-from');
        const toEl   = document.getElementById('analysis-custom-to');
        if (!fromEl || !toEl || !fromEl.value || !toEl.value) return true;
        const from = new Date(fromEl.value); from.setHours(0,0,0,0);
        const to   = new Date(toEl.value);   to.setHours(23,59,59,999);
        return txDate >= from && txDate <= to;
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

    // Sum by category for active type
    let total = 0;
    const categorySums = {};
    transactions.forEach(t => {
        if (t.type === txType && transactionBelongsToAnalysisPeriod(t)) {
            total += t.amount;
            categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
        }
    });

    const totalLabel = document.getElementById('chart-total-spent');
    const totalLabelSub = totalLabel && totalLabel.previousElementSibling;
    if (totalLabel) totalLabel.innerText = `₹${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalLabelSub) totalLabelSub.innerText = isSpending ? 'Total Spent' : 'Total Earned';

    // Build dynamic list and donut chart
    const listContainer = document.getElementById('analysis-category-list');
    listContainer.innerHTML = '';

    const svg = document.getElementById('donut-svg');
    svg.innerHTML = '';

    // All known categories per type
    const allExpenseCats = expenseCategories.map(c => ({ name: c.name, icon: c.icon }));
    const allIncomeCats  = incomeCategories.map(c => ({ name: c.name, icon: c.icon }));
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
    const withValue  = allCats.filter(c => (categorySums[c.name] || 0) > 0)
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
        item.className = `flex items-center justify-between p-md bg-surface-container rounded-xl transition-colors ${
            isZero ? 'opacity-40' : 'hover:bg-surface-container-high cursor-pointer'
        }`;
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
    const titleEl = document.getElementById('cat-tx-sheet-title');
    const subtitleEl = document.getElementById('cat-tx-sheet-subtitle');
    if (titleEl) titleEl.innerText = catName;
    if (subtitleEl) {
        const periodStr = analysisPeriod === 'week'
            ? weekLabelStr(analysisWeekStart)
            : analysisPeriod === 'year'
                ? `${analysisYear}`
                : analysisPeriod === 'month'
                    ? `${monthNames[analysisMonth]} ${analysisYear}`
                    : 'Custom range';
        subtitleEl.innerText = `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} · ${periodStr}`;
    }

    // List
    const list = document.getElementById('cat-tx-sheet-list');
    list.innerHTML = '';
    if (filtered.length === 0) {
        list.innerHTML = `<p class="text-center text-on-surface-variant py-xl">No transactions found</p>`;
    } else {
        const isInc = txType === 'income';
        let runTotal = 0;
        filtered.forEach(t => { runTotal += t.amount; });

        // Summary row
        const summary = document.createElement('div');
        summary.className = 'flex justify-between items-center py-sm px-md bg-surface-container rounded-xl mb-sm';
        summary.innerHTML = `
            <span class="text-label-lg text-on-surface-variant">Total</span>
            <span class="text-headline-md font-headline-md ${isInc ? 'text-primary' : 'text-secondary'}">${isInc ? '+' : '-'}₹${runTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        `;
        list.appendChild(summary);

        filtered.forEach(t => {
            const card = document.createElement('div');
            card.className = 'bg-surface-container p-md rounded-xl flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]';
            card.onclick = () => { closeCatTransactionsSheet(); openEditTransactionModal(t); };
            const colorClass = isInc ? 'text-primary bg-primary-container/20' : 'text-secondary bg-secondary-container/20';
            card.innerHTML = `
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${colorClass} flex-shrink-0">
                    <span class="material-symbols-outlined text-[20px]">${t.categoryIcon || 'payments'}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline gap-sm">
                        <p class="text-body-md font-semibold text-on-surface truncate">${t.note || t.category}</p>
                        <p class="text-body-lg font-bold flex-shrink-0 ${isInc ? 'text-primary' : 'text-secondary'}">${isInc ? '+' : '-'}₹${t.amount.toFixed(2)}</p>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                        <p class="text-label-md text-on-surface-variant">${t.date}</p>
                        <span class="material-symbols-outlined text-on-surface-variant text-[16px]">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance'}</span>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    document.getElementById('sheet-cat-transactions').classList.remove('translate-y-full');
    showBackdrop();
}

function closeCatTransactionsSheet() {
    document.getElementById('sheet-cat-transactions').classList.add('translate-y-full');
    checkBackdropNeeded();
}

// Accounts tab renderer
function updateAccounts() {
    let bankAmt = accountBalances.bank;
    let cashAmt = accountBalances.cash;
    let cardAmt = accountBalances.card;

    // Adjust cash, bank, and card dynamically based on transactions
    transactions.forEach(t => {
        if (t.paymentMode === 'Cash') {
            if (t.type === 'expense') cashAmt -= t.amount;
            else cashAmt += t.amount;
        } else if (t.paymentMode === 'Credit Card') {
            if (t.type === 'expense') cardAmt += t.amount;
            else cardAmt -= t.amount;
        } else {
            if (t.type === 'expense') bankAmt -= t.amount;
            else bankAmt += t.amount;
        }
    });

    const bankEl = document.getElementById('acc-bank-balance');
    const cashEl = document.getElementById('acc-cash-balance');
    const cardEl = document.getElementById('acc-card-balance');
    const cardHeaderEl = document.getElementById('acc-card-header-balance');
    const totalEl = document.getElementById('acc-total-balance');

    if (bankEl) bankEl.innerText = `₹${bankAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (cashEl) cashEl.innerText = `₹${cashAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (cardEl) cardEl.innerText = `₹${cardAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (cardHeaderEl) cardHeaderEl.innerText = `₹${cardAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const total = bankAmt + cashAmt - cardAmt;
    if (totalEl) totalEl.innerText = `₹${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Budget tab rendering
function updateBudget() {
    let totalExpense = 0;
    const categorySums = {};
    const now = new Date();

    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (activeBudgetTab === 'monthly') {
                if (transactionBelongsToSelectedMonth(t)) {
                    totalExpense += t.amount;
                    categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
                }
            } else {
                let txYear = now.getFullYear();
                if (t.date !== 'Today') {
                    const parts = t.date.split(' ');
                    if (parts.length === 3) {
                        const y = parseInt(parts[2]);
                        txYear = y < 100 ? 2000 + y : y;
                    }
                }
                if (txYear === currentYear) {
                    totalExpense += t.amount;
                    categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
                }
            }
        }
    });

    const activeLimit = activeBudgetTab === 'monthly' ? monthlyBudgetLimit : yearlyBudgetLimit;

    // Update Header Date Info
    const headerDateText = document.querySelector('#view-budget h2.text-label-lg');
    if (headerDateText) {
        if (activeBudgetTab === 'monthly') {
            headerDateText.innerText = `${monthNames[currentMonth].slice(0, 3)} ${String(currentYear).slice(-2)} • Summary`;
        } else {
            headerDateText.innerText = `${currentYear} • Annual Summary`;
        }
    }

    document.getElementById('budget-spent-amount').innerText = `₹${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const limitDisplay = document.getElementById('budget-limit-display');
    if (limitDisplay) {
        limitDisplay.innerText = `Limit ₹${activeLimit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }

    const pct = Math.min((totalExpense / activeLimit) * 100, 100);
    const progressFill = document.getElementById('budget-progress-bar');
    progressFill.style.width = `${pct}%`;

    const statusText = document.getElementById('budget-status-text');
    const warningCard = document.getElementById('budget-warning-card');

    if (totalExpense > activeLimit) {
        progressFill.classList.remove('bg-primary-container');
        progressFill.classList.add('bg-secondary-container');
        statusText.innerHTML = `
            <span class="material-symbols-outlined text-[16px] text-error" style="font-variation-settings: 'FILL' 1;">error</span>
            <p class="text-label-lg font-label-lg text-error">Warning: Exceeded by <span class="font-bold">₹${(totalExpense - activeLimit).toFixed(2)}</span>!</p>
        `;
        warningCard.classList.remove('hidden');
    } else {
        progressFill.classList.add('bg-primary-container');
        progressFill.classList.remove('bg-secondary-container');
        statusText.innerHTML = `
            <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            <p class="text-label-lg font-label-lg text-primary">You are <span class="font-bold">₹${(activeLimit - totalExpense).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> under the limit.</p>
        `;
        if (pct > 70) {
            warningCard.classList.remove('hidden');
        } else {
            warningCard.classList.add('hidden');
        }
    }

    // Categories progress list
    const progressContainer = document.getElementById('budget-categories-progress');
    progressContainer.innerHTML = '';

    const icons = {
        'Groceries': 'shopping_basket',
        'Shopping': 'shopping_bag',
        'Education': 'school',
        'Transport': 'commute',
        'Bills & Utilities': 'receipt_long',
        'Entertainment': 'sports_esports',
        'Medical': 'medical_services',
        'Food & Drinks': 'restaurant'
    };

    for (const cat in categoryBudgetLimits) {
        const sum = categorySums[cat] || 0;
        const climit = activeBudgetTab === 'monthly' ? categoryBudgetLimits[cat] : categoryBudgetLimits[cat] * 12;
        const cpct = Math.min((sum / climit) * 100, 100);
        const isOver = sum > climit;
        const icon = icons[cat] || 'payments';

        const barColor = isOver ? 'bg-secondary-container' : 'bg-primary-container';
        const accentText = isOver ? 'text-secondary font-bold' : 'text-primary-fixed-dim';

        const progressItem = document.createElement('div');
        progressItem.className = "bg-surface-container p-md rounded-xl space-y-md border border-white/5 hover:bg-surface-container-high transition-colors cursor-pointer";
        progressItem.onclick = () => showToast(`${cat}: Limit ₹${climit}, spent ₹${sum}`);
        progressItem.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-md">
                    <div class="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
                        <span class="material-symbols-outlined text-secondary text-2xl">${icon}</span>
                    </div>
                    <span class="text-headline-md font-headline-md">${cat}</span>
                </div>
                <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
            <div class="space-y-sm">
                <div class="flex justify-between text-label-lg font-label-lg mb-1">
                    <span class="${accentText}">₹${sum.toFixed(2)}</span>
                    <span class="text-on-surface-variant">₹${climit}</span>
                </div>
                <div class="w-full h-4 bg-surface-container-high rounded-lg overflow-hidden relative">
                    <div class="absolute top-0 left-0 h-full ${barColor} progress-bar-fill" style="width: ${cpct}%;"></div>
                </div>
            </div>
        `;
        progressContainer.appendChild(progressItem);
    }
}

// Search trigger
function toggleSearch() {
    const inputContainer = document.getElementById('search-container');
    if (inputContainer.classList.contains('hidden')) {
        inputContainer.classList.remove('hidden');
        document.getElementById('search-input').focus();
    } else {
        inputContainer.classList.add('hidden');
        document.getElementById('search-input').value = '';
        updateDashboard();
    }
}

function filterTransactions() {
    const val = document.getElementById('search-input').value.toLowerCase();
    const filtered = transactions.filter(t =>
        t.note.toLowerCase().includes(val) ||
        t.category.toLowerCase().includes(val) ||
        t.paymentMode.toLowerCase().includes(val)
    );
    renderRecentTransactions(filtered);
}

// Add Transaction Modal controls
function openAddTransactionModal() {
    editingTransactionId = null;
    
    // Reset Title/Button text
    const titleEl = document.querySelector('#modal-add-transaction h1');
    if (titleEl) titleEl.innerText = "Add Transaction";


    // Hide Delete Button in Add Mode
    const deleteBtn = document.getElementById('header-delete-btn');
    if (deleteBtn) deleteBtn.classList.add('hidden');

    // Reset modal values
    document.getElementById('tx-input-amount').value = '';
    document.getElementById('tx-input-desc').value = '';

    selectedTxDateObj = new Date();
    updateTxDatePickerLabel();

    selectedCategory = 'Groceries';
    selectedCategoryIcon = 'shopping_basket';
    selectedPaymentMode = 'Cash';
    selectedPaymentIcon = 'payments';
    selectedTags = [];
    selectedTxType = 'expense';

    syncAddTransactionUI();

    const modal = document.getElementById('modal-add-transaction');
    modal.classList.remove('translate-y-full');
    showBackdrop();
}

function closeAddTransactionModal() {
    const modal = document.getElementById('modal-add-transaction');
    modal.classList.add('translate-y-full');
    closeAllSheets();
}

function syncAddTransactionUI() {
    document.getElementById('tx-selected-cat-name').innerText = selectedCategory;
    document.getElementById('tx-selected-cat-icon').innerText = selectedCategoryIcon;

    document.getElementById('tx-selected-pay-name').innerText = selectedPaymentMode;
    document.getElementById('tx-selected-pay-icon').innerText = selectedPaymentIcon;

    const tagsCont = document.getElementById('tx-selected-tags-container');
    tagsCont.innerHTML = '';
    if (selectedTags.length === 0) {
        tagsCont.innerHTML = `<span class="text-label-md text-on-surface-variant">Add tags...</span>`;
    } else {
        selectedTags.forEach(tag => {
            const pill = document.createElement('div');
            pill.className = "flex items-center gap-xs px-3 py-1 bg-surface-container rounded-full border border-outline-variant";
            pill.innerHTML = `<span class="text-label-lg font-label-lg">${tag}</span>`;
            tagsCont.appendChild(pill);
        });
    }

    // Sync color accents in form based on type
    const amtIcon = document.querySelector('#modal-add-transaction span.text-headline-lg');
    const descIcon = document.querySelector('#modal-add-transaction span.mt-1');
    if (selectedTxType === 'income') {
        if (amtIcon) amtIcon.className = "material-symbols-outlined text-primary text-headline-lg pb-1";
        if (descIcon) descIcon.className = "material-symbols-outlined text-primary mt-1";
    } else {
        if (amtIcon) amtIcon.className = "material-symbols-outlined text-secondary text-headline-lg pb-1";
        if (descIcon) descIcon.className = "material-symbols-outlined text-secondary mt-1";
    }
}

function switchTransactionType(type) {
    selectedTxType = type;
    const btnExp = document.getElementById('tx-type-expense');
    const btnInc = document.getElementById('tx-type-income');

    if (type === 'expense') {
        btnExp.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        selectedCategory = 'Groceries';
        selectedCategoryIcon = 'shopping_basket';
    } else {
        btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        btnExp.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        selectedCategory = 'Salary';
        selectedCategoryIcon = 'work';
    }
    syncAddTransactionUI();
}

// Category Sheet Toggles
function openCategorySheet() {
    renderCategories();
    document.getElementById('sheet-categories').classList.remove('translate-y-full');
    showBackdrop();
}

function renderCategories() {
    const container = document.getElementById('categories-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const list = selectedTxType === 'expense' ? expenseCategories : incomeCategories;

    if (categoryLayout === 'grid') {
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-5 gap-y-sm gap-x-1";
        
        list.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = "flex flex-col items-center gap-xs group py-1 overflow-hidden w-full";
            btn.onclick = () => selectCategory(cat.name, cat.icon);
            btn.innerHTML = `
                <div class="w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center transition-all group-active:scale-90 ${cat.fillClass}">
                    <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">${cat.icon}</span>
                </div>
                <span class="text-[10px] font-semibold text-on-surface-variant text-center leading-tight truncate w-full px-0.5" title="${cat.name}">${cat.name}</span>
            `;
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    } else {
        const listWrapper = document.createElement('div');
        listWrapper.className = "flex flex-col gap-1.5";
        
        list.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = "flex items-center gap-md w-full p-2 hover:bg-surface-container-high rounded-xl text-left transition-colors";
            btn.onclick = () => selectCategory(cat.name, cat.icon);
            btn.innerHTML = `
                <div class="w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center ${cat.fillClass}">
                    <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">${cat.icon}</span>
                </div>
                <span class="text-body-md font-semibold text-on-surface">${cat.name}</span>
            `;
            listWrapper.appendChild(btn);
        });
        container.appendChild(listWrapper);
    }
}

function setCategoryLayout(layout) {
    categoryLayout = layout;
    
    const btnGrid = document.getElementById('btn-cat-layout-grid');
    const btnList = document.getElementById('btn-cat-layout-list');
    
    if (layout === 'grid') {
        if (btnGrid) btnGrid.className = "p-1 rounded-full bg-primary text-on-primary shadow-sm flex items-center justify-center transition-all duration-150";
        if (btnList) btnList.className = "p-1 rounded-full text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all duration-150";
    } else {
        if (btnList) btnList.className = "p-1 rounded-full bg-primary text-on-primary shadow-sm flex items-center justify-center transition-all duration-150";
        if (btnGrid) btnGrid.className = "p-1 rounded-full text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all duration-150";
    }
    
    renderCategories();
}

function closeCategorySheet() {
    document.getElementById('sheet-categories').classList.add('translate-y-full');
    checkBackdropNeeded();
}

// Category Selector callback
function selectCategory(name, icon) {
    selectedCategory = name;
    selectedCategoryIcon = icon;
    syncAddTransactionUI();
    closeCategorySheet();
}

// Payment Mode Sheet Toggles
function openPaymentSheet() {
    document.getElementById('sheet-payments').classList.remove('translate-y-full');
    showBackdrop();
}

function closePaymentSheet() {
    document.getElementById('sheet-payments').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function selectPaymentMode(name, icon) {
    selectedPaymentMode = name;
    selectedPaymentIcon = icon;
    syncAddTransactionUI();
    closePaymentSheet();
}

// Tags Sheet Toggles
function openTagsSheet() {
    renderTagsSelector();
    document.getElementById('sheet-tags').classList.remove('translate-y-full');
    showBackdrop();
}

function closeTagsSheet() {
    document.getElementById('sheet-tags').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function renderTagsSelector() {
    const container = document.getElementById('available-tags-list');
    container.innerHTML = '';

    allAvailableTags.forEach(tag => {
        const isActive = selectedTags.includes(tag);
        const pill = document.createElement('button');

        if (isActive) {
            pill.className = "flex items-center gap-xs bg-primary/20 border-primary text-primary px-md py-sm rounded-full border transition-all active:scale-90 font-label-lg";
        } else {
            pill.className = "flex items-center gap-xs bg-surface-container-high hover:bg-surface-container-highest border-outline-variant text-on-surface px-md py-sm rounded-full border transition-all active:scale-90 font-label-lg";
        }

        pill.onclick = () => toggleTag(tag);
        pill.innerHTML = `<span>#</span><span>${tag}</span>`;
        container.appendChild(pill);
    });
}

function toggleTag(tag) {
    const idx = selectedTags.indexOf(tag);
    if (idx > -1) {
        selectedTags.splice(idx, 1);
    } else {
        selectedTags.push(tag);
    }
    renderTagsSelector();
    syncAddTransactionUI();
}

function createCustomTag() {
    const input = document.getElementById('custom-tag-input');
    const val = input.value.trim().toLowerCase();
    if (val && !allAvailableTags.includes(val)) {
        allAvailableTags.push(val);
        selectedTags.push(val);
        input.value = '';
        renderTagsSelector();
        syncAddTransactionUI();
        showToast(`Created tag #${val}`);
    }
}

function openIncomeDetailsSheet() {
    renderIncomeTransactions();
    document.getElementById('sheet-income-details').classList.remove('translate-y-full');
    showBackdrop();
}

function closeIncomeDetailsSheet() {
    document.getElementById('sheet-income-details').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function renderIncomeTransactions() {
    const container = document.getElementById('income-transactions-list');
    container.innerHTML = '';

    const incomeList = transactions.filter(t => t.type === 'income' && transactionBelongsToSelectedMonth(t));

    if (incomeList.length === 0) {
        container.innerHTML = `<p class="text-center text-on-surface-variant py-md">No income transactions recorded this month.</p>`;
        return;
    }

    incomeList.forEach(t => {
        const card = document.createElement('div');
        card.className = "bg-surface-container p-md rounded-xl flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]";
        bindLongPress(card, t);

        let colorClass = "text-primary bg-primary-container/20";

        card.innerHTML = `
            <div class="w-12 h-12 rounded-full flex items-center justify-center ${colorClass}">
                <span class="material-symbols-outlined">${t.categoryIcon || 'payments'}</span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <p class="text-body-lg font-bold text-on-surface">+₹${t.amount.toFixed(2)}</p>
                    <p class="text-label-md font-label-md text-on-surface-variant">${t.date}</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-body-md text-on-surface-variant">${t.note || t.category}</p>
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openSpendingDetailsSheet() {
    renderSpendingTransactions();
    document.getElementById('sheet-spending-details').classList.remove('translate-y-full');
    showBackdrop();
}

function closeSpendingDetailsSheet() {
    document.getElementById('sheet-spending-details').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function renderSpendingTransactions() {
    const container = document.getElementById('spending-transactions-list');
    container.innerHTML = '';
    
    const expenseList = transactions.filter(t => t.type === 'expense' && transactionBelongsToSelectedMonth(t));
    
    if (expenseList.length === 0) {
        container.innerHTML = `<p class="text-center text-on-surface-variant py-md">No expenses recorded this month.</p>`;
        return;
    }
    
    expenseList.forEach(t => {
        const card = document.createElement('div');
        card.className = "bg-surface-container p-md rounded-xl flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]";
        bindLongPress(card, t);
        
        let colorClass = "text-secondary bg-secondary-container/20";
        
        card.innerHTML = `
            <div class="w-12 h-12 rounded-full flex items-center justify-center ${colorClass}">
                <span class="material-symbols-outlined">${t.categoryIcon || 'payments'}</span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <p class="text-body-lg font-bold text-on-surface">-₹${t.amount.toFixed(2)}</p>
                    <p class="text-label-md font-label-md text-on-surface-variant">${t.date}</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-body-md text-on-surface-variant">${t.note || t.category}</p>
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Save Transaction to memory database
function saveTransaction() {
    const dtInput = document.getElementById('tx-input-datetime');
    if (dtInput && dtInput.value) {
        selectedTxDateObj = new Date(dtInput.value);
    }
    const amtVal = parseFloat(document.getElementById('tx-input-amount').value);
    const descVal = document.getElementById('tx-input-desc').value.trim();

    if (isNaN(amtVal) || amtVal <= 0) {
        showToast("Please enter a valid amount");
        return;
    }

    if (editingTransactionId !== null) {
        const tx = transactions.find(x => x.id === editingTransactionId);
        if (tx) {
            tx.amount = amtVal;
            tx.note = descVal || selectedCategory;
            tx.category = selectedCategory;
            tx.categoryIcon = selectedCategoryIcon;
            tx.type = selectedTxType;
            tx.paymentMode = selectedPaymentMode;
            tx.tags = [...selectedTags];
            tx.rawDate = selectedTxDateObj.toISOString();
            tx.date = getRelativeDateString(selectedTxDateObj);
        }
        editingTransactionId = null;
        showToast("Transaction updated successfully!");
    } else {
        const newTx = {
            id: transactions.length + 1,
            amount: amtVal,
            rawDate: selectedTxDateObj.toISOString(),
            date: getRelativeDateString(selectedTxDateObj),
            category: selectedCategory,
            categoryIcon: selectedCategoryIcon,
            note: descVal || selectedCategory,
            type: selectedTxType,
            paymentMode: selectedPaymentMode,
            tags: [...selectedTags]
        };

        transactions.unshift(newTx);
        showToast("Transaction saved successfully!");
    }

    saveToLocalStorage();

    // Sync all view layers
    updateDashboard();
    updateAnalysis();
    updateAccounts();
    updateBudget();

    closeAddTransactionModal();
}

// Helper UI functions
function showBackdrop() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'pointer-events-auto');
    }
    document.body.classList.add('overflow-hidden');
}

function closeAllSheets() {
    document.querySelectorAll('.bottom-sheet-transition').forEach(sheet => {
        sheet.classList.add('translate-y-full');
    });
    const txModal = document.getElementById('modal-add-transaction');
    if (txModal) txModal.classList.add('translate-y-full');

    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
    document.body.classList.remove('overflow-hidden');
}

function checkBackdropNeeded() {
    let openedSheet = false;
    document.querySelectorAll('.bottom-sheet-transition').forEach(sheet => {
        if (!sheet.classList.contains('translate-y-full')) {
            openedSheet = true;
        }
    });

    const txModal = document.getElementById('modal-add-transaction');
    if (txModal && !txModal.classList.contains('translate-y-full')) {
        openedSheet = true;
    }

    if (!openedSheet) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('opacity-100', 'pointer-events-auto');
            overlay.classList.add('opacity-0', 'pointer-events-none');
        }
        document.body.classList.remove('overflow-hidden');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 2500);
}

function showTransactionDetails(t) {
    openEditTransactionModal(t);
}

function openEditTransactionModal(t) {
    editingTransactionId = t.id;

    document.getElementById('tx-input-amount').value = t.amount;
    document.getElementById('tx-input-desc').value = t.note;

    if (t.rawDate) {
        selectedTxDateObj = new Date(t.rawDate);
    } else {
        selectedTxDateObj = parseTxDate(t.date);
    }
    updateTxDatePickerLabel();

    selectedCategory = t.category;
    selectedCategoryIcon = t.categoryIcon || 'payments';
    selectedPaymentMode = t.paymentMode;
    
    if (t.paymentMode === 'Cash') selectedPaymentIcon = 'payments';
    else if (t.paymentMode === 'Credit Card') selectedPaymentIcon = 'credit_card';
    else selectedPaymentIcon = 'account_balance_wallet';

    selectedTags = [...(t.tags || [])];
    selectedTxType = t.type;

    syncAddTransactionUI();

    const titleEl = document.querySelector('#modal-add-transaction h1');
    if (titleEl) titleEl.innerText = "Edit Transaction";


    // Show Delete Button in Edit Mode
    const deleteBtn = document.getElementById('header-delete-btn');
    if (deleteBtn) deleteBtn.classList.remove('hidden');

    const modal = document.getElementById('modal-add-transaction');
    modal.classList.remove('translate-y-full');

    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    }
    updateSheetMonthLabels();
    
    // Re-render dashboard, analysis, sheets, and budget
    updateDashboard();
    updateAnalysis();
    updateBudget();
    renderIncomeTransactions();
    renderSpendingTransactions();
}

function updateSheetMonthLabels() {
    const labelStr = `${monthNames[currentMonth]} ${currentYear}`;
    const incLabel = document.getElementById('income-sheet-month-label');
    const spdLabel = document.getElementById('spending-sheet-month-label');
    const anaLabel = document.getElementById('analysis-month-label');
    if (incLabel) incLabel.innerText = labelStr;
    if (spdLabel) spdLabel.innerText = labelStr;
    if (anaLabel) anaLabel.innerText = labelStr;
}

function transactionBelongsToSelectedMonth(t) {
    let txYear = 2024;
    let txMonth = 1; // Default to Feb 2024 (e.g. for mock data)
    
    if (t.date === 'Today') {
        const now = new Date();
        txYear = now.getFullYear();
        txMonth = now.getMonth();
    } else {
        // Parse date like '08 Feb 24'
        const parts = t.date.split(' ');
        if (parts.length === 3) {
            const monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mIdx = monthAbbrs.indexOf(parts[1]);
            if (mIdx !== -1) {
                txMonth = mIdx;
            }
            const y = parseInt(parts[2]);
            txYear = y < 100 ? 2000 + y : y;
        }
    }
    
    return txMonth === currentMonth && txYear === currentYear;
}

// CSV Export function
function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Amount,Type,Date,Category,Description,Payment Mode,Tags\n";
    transactions.forEach(t => {
        csvContent += `${t.id},${t.amount},${t.type},${t.date},"${t.category}","${t.note}","${t.paymentMode}","${t.tags.join(';')}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "midnight_ledger_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Export Started!");
}

function selectProfileAvatar(url, btn) {
    document.getElementById('profile-selected-avatar').value = url;
    const buttons = document.querySelectorAll('#profile-avatar-grid button');
    buttons.forEach(b => {
        b.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border border-transparent scale-90";
    });
    btn.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border-2 border-primary scale-110";
}

function openProfileSecuritySheet() {
    document.getElementById('profile-input-name').value = userProfile.name;
    document.getElementById('profile-input-email').value = userProfile.email;
    document.getElementById('security-biometric-toggle').checked = userProfile.biometricLock;

    const avatarVal = userProfile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar_1';
    document.getElementById('profile-selected-avatar').value = avatarVal;
    
    const buttons = document.querySelectorAll('#profile-avatar-grid button');
    buttons.forEach(btn => {
        const img = btn.querySelector('img');
        if (img && img.src === avatarVal) {
            btn.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border-2 border-primary scale-110";
        } else {
            btn.className = "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-surface hover:bg-surface-container transition-all border border-transparent scale-90";
        }
    });

    document.getElementById('sheet-profile-security').classList.remove('translate-y-full');
    showBackdrop();
}

function closeProfileSecuritySheet() {
    document.getElementById('sheet-profile-security').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function toggleBiometricLock() {
    const isChecked = document.getElementById('security-biometric-toggle').checked;
    userProfile.biometricLock = isChecked;
    saveToLocalStorage();
    showToast(isChecked ? "Biometric lock enabled" : "Biometric lock disabled");
}

function saveProfileSecurity() {
    const newName = document.getElementById('profile-input-name').value.trim();
    const newEmail = document.getElementById('profile-input-email').value.trim();
    const newAvatar = document.getElementById('profile-selected-avatar').value;

    if (!newName || !newEmail) {
        showToast("Name and email cannot be empty");
        return;
    }

    userProfile.name = newName;
    userProfile.email = newEmail;
    userProfile.avatar = newAvatar;

    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const dbName = document.getElementById('dashboard-user-name');
    const dbAvatar = document.getElementById('dashboard-user-avatar');
    const stAvatar = document.getElementById('settings-user-avatar');

    if (nameDisplay) nameDisplay.innerText = newName;
    if (emailDisplay) emailDisplay.innerText = newEmail;
    if (dbName) dbName.innerText = newName;
    if (dbAvatar) dbAvatar.innerText = newAvatar;
    if (stAvatar) stAvatar.innerText = newAvatar;

    saveToLocalStorage();
    showToast("Profile updated successfully!");
    closeProfileSecuritySheet();
}

function openExportDataSheet() {
    document.getElementById('sheet-export-data').classList.remove('translate-y-full');
    showBackdrop();
}

function closeExportDataSheet() {
    document.getElementById('sheet-export-data').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function openBackupRestoreSheet() {
    document.getElementById('sheet-backup-restore').classList.remove('translate-y-full');
    showBackdrop();
}

function closeBackupRestoreSheet() {
    document.getElementById('sheet-backup-restore').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "midnight_ledger_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("JSON Export Started!");
}

function runCloudBackup() {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    document.getElementById('cloud-backup-time').innerText = `Last backup: ${dateStr} at ${timeStr}`;
    showToast("Cloud Backup Synchronized!");
}

let autoBackupInterval = null;
function toggleAutoBackup() {
    const isChecked = document.getElementById('backup-auto-toggle').checked;
    if (isChecked) {
        showToast("Auto-save Backups enabled");
    } else {
        showToast("Auto-save Backups disabled");
    }
}

function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                transactions = imported;
                updateDashboard();
                updateAnalysis();
                updateAccounts();
                updateBudget();
                saveToLocalStorage();
                showToast("Data restored successfully!");
                closeBackupRestoreSheet();
            } else {
                showToast("Invalid backup file format.");
            }
        } catch(err) {
            showToast("Failed to parse backup file.");
        }
    };
    reader.readAsText(file);
}

function openEditBudgetSheet() {
    const labelEl = document.querySelector('#sheet-edit-budget label');
    const headerEl = document.querySelector('#sheet-edit-budget h3');

    if (activeBudgetTab === 'monthly') {
        if (headerEl) headerEl.innerText = "Total Monthly Limit";
        if (labelEl) labelEl.innerText = "Monthly Budget (₹)";
        document.getElementById('budget-input-limit').value = monthlyBudgetLimit;
    } else {
        if (headerEl) headerEl.innerText = "Total Yearly Limit";
        if (labelEl) labelEl.innerText = "Yearly Budget (₹)";
        document.getElementById('budget-input-limit').value = yearlyBudgetLimit;
    }

    document.getElementById('budget-cat-groceries').value = categoryBudgetLimits['Groceries'] || 0;
    document.getElementById('budget-cat-shopping').value = categoryBudgetLimits['Shopping'] || 0;
    document.getElementById('budget-cat-education').value = categoryBudgetLimits['Education'] || 0;
    document.getElementById('budget-cat-transport').value = categoryBudgetLimits['Transport'] || 0;
    document.getElementById('budget-cat-utilities').value = categoryBudgetLimits['Bills & Utilities'] || 0;
    document.getElementById('budget-cat-entertainment').value = categoryBudgetLimits['Entertainment'] || 0;
    document.getElementById('budget-cat-medical').value = categoryBudgetLimits['Medical'] || 0;
    document.getElementById('budget-cat-food').value = categoryBudgetLimits['Food & Drinks'] || 0;

    const toggle = document.getElementById('budget-toggle-enabled');
    if (toggle) toggle.checked = budgetEnabled;
    toggleBudgetActiveState(budgetEnabled);

    document.getElementById('sheet-edit-budget').classList.remove('translate-y-full');
    showBackdrop();
}

function closeEditBudgetSheet() {
    document.getElementById('sheet-edit-budget').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function saveBudgetSettings() {
    if (!budgetEnabled) {
        saveToLocalStorage();
        closeEditBudgetSheet();
        return;
    }
    const newLimit = parseFloat(document.getElementById('budget-input-limit').value);
    if (isNaN(newLimit) || newLimit <= 0) {
        showToast("Please enter a valid limit");
        return;
    }

    if (activeBudgetTab === 'monthly') {
        monthlyBudgetLimit = newLimit;
    } else {
        yearlyBudgetLimit = newLimit;
    }

    categoryBudgetLimits['Groceries'] = parseFloat(document.getElementById('budget-cat-groceries').value) || 0;
    categoryBudgetLimits['Shopping'] = parseFloat(document.getElementById('budget-cat-shopping').value) || 0;
    categoryBudgetLimits['Education'] = parseFloat(document.getElementById('budget-cat-education').value) || 0;
    categoryBudgetLimits['Transport'] = parseFloat(document.getElementById('budget-cat-transport').value) || 0;
    categoryBudgetLimits['Bills & Utilities'] = parseFloat(document.getElementById('budget-cat-utilities').value) || 0;
    categoryBudgetLimits['Entertainment'] = parseFloat(document.getElementById('budget-cat-entertainment').value) || 0;
    categoryBudgetLimits['Medical'] = parseFloat(document.getElementById('budget-cat-medical').value) || 0;
    categoryBudgetLimits['Food & Drinks'] = parseFloat(document.getElementById('budget-cat-food').value) || 0;

    updateDashboard();
    updateBudget();
    saveToLocalStorage();

    showToast("Budgets updated successfully!");
    closeEditBudgetSheet();
}

function toggleBudgetActiveState(enabled) {
    budgetEnabled = enabled;
    saveToLocalStorage();
    
    // Disable or enable inputs in edit sheet
    const inputs = [
        'budget-input-limit', 'budget-cat-groceries', 'budget-cat-shopping',
        'budget-cat-education', 'budget-cat-transport', 'budget-cat-utilities',
        'budget-cat-entertainment', 'budget-cat-medical', 'budget-cat-food'
    ];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = !enabled;
            if (!enabled) {
                el.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                el.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    });

    // Toggle widgets visibility
    const dashCard = document.getElementById('dashboard-budget-card');
    if (dashCard) {
        if (enabled) dashCard.classList.remove('hidden');
        else dashCard.classList.add('hidden');
    }
    const analysisCard = document.getElementById('analysis-budget-card');
    if (analysisCard) {
        if (enabled) analysisCard.classList.remove('hidden');
        else analysisCard.classList.add('hidden');
    }

    // Toggle Budget View contents
    const activeContent = document.getElementById('budget-active-content');
    const placeholder = document.getElementById('budget-disabled-placeholder');
    if (activeContent && placeholder) {
        if (enabled) {
            activeContent.classList.remove('hidden');
            placeholder.classList.add('hidden');
        } else {
            activeContent.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    }
}

let currentEditingAccountKey = null;

function openEditAccountSheet(key, title, label) {
    currentEditingAccountKey = key;
    document.getElementById('account-sheet-title').innerText = title;
    document.getElementById('account-input-label').innerText = label;
    document.getElementById('account-input-balance').value = accountBalances[key];

    document.getElementById('sheet-edit-account').classList.remove('translate-y-full');
    showBackdrop();
}

function closeEditAccountSheet() {
    document.getElementById('sheet-edit-account').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function saveAccountBalance() {
    const val = parseFloat(document.getElementById('account-input-balance').value);
    if (isNaN(val)) {
        showToast("Please enter a valid amount");
        return;
    }

    if (currentEditingAccountKey) {
        accountBalances[currentEditingAccountKey] = val;
        saveToLocalStorage();
        updateAccounts();
        showToast("Account balance updated!");
    }
    closeEditAccountSheet();
}

function performLogout() {
    openConfirmActionSheet("Confirm Log Out", "Are you sure you want to log out? This will clear all local transaction and profile data permanently.", () => {
        localStorage.clear();
        location.reload();
    });
}

let confirmActionCallback = null;

function openConfirmActionSheet(title, message, callback) {
    document.getElementById('confirm-sheet-title').innerText = title;
    document.getElementById('confirm-sheet-message').innerText = message;
    confirmActionCallback = callback;

    document.getElementById('sheet-confirm-action').classList.remove('translate-y-full');
    showBackdrop();
}

function closeConfirmActionSheet() {
    document.getElementById('sheet-confirm-action').classList.add('translate-y-full');
    checkBackdropNeeded();
}

// Bind confirmation callback button
window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('confirm-action-btn');
    if (btn) {
        btn.onclick = () => {
            if (confirmActionCallback) {
                confirmActionCallback();
            }
            closeConfirmActionSheet();
        };
    }
});

let selectedTransactionForOptions = null;
let longPressTriggered = false;
let longPressTimer = null;

function bindLongPress(card, t) {
    const start = (e) => {
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
            longPressTriggered = true;
            openTransactionOptionsSheet(t);
        }, 600);
    };

    const cancel = (e) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    };

    card.addEventListener('mousedown', start);
    card.addEventListener('touchstart', start, { passive: true });
    
    card.addEventListener('mouseup', cancel);
    card.addEventListener('touchend', cancel);
    card.addEventListener('mouseleave', cancel);
    card.addEventListener('touchmove', cancel);

    card.addEventListener('click', (e) => {
        if (longPressTriggered) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        showTransactionDetails(t);
    });
}

function openTransactionOptionsSheet(t) {
    selectedTransactionForOptions = t;
    
    const previewContainer = document.getElementById('options-entry-preview');
    const isInc = t.type === 'income';
    let colorClass = "text-secondary bg-secondary-container/20";
    if (isInc) colorClass = "text-primary bg-primary-container/20";
    
    previewContainer.innerHTML = `
        <div class="bg-surface-container p-md rounded-xl flex items-center gap-md border border-outline-variant/20">
            <div class="w-12 h-12 rounded-full flex items-center justify-center ${colorClass}">
                <span class="material-symbols-outlined">${t.categoryIcon || 'payments'}</span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <p class="text-body-lg font-bold text-on-surface">${isInc ? '+' : '-'}₹${t.amount.toFixed(2)}</p>
                    <p class="text-label-md font-label-md text-on-surface-variant">${t.date}</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-body-md text-on-surface-variant">${t.note || t.category}</p>
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('sheet-transaction-options').classList.remove('translate-y-full');
    showBackdrop();
}

function closeTransactionOptionsSheet() {
    document.getElementById('sheet-transaction-options').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function duplicateSelectedTransaction() {
    if (!selectedTransactionForOptions) return;
    const copied = {
        ...selectedTransactionForOptions,
        id: transactions.length + 1,
        date: 'Today'
    };
    transactions.unshift(copied);
    saveToLocalStorage();
    updateDashboard();
    updateAnalysis();
    updateAccounts();
    updateBudget();
    showToast("Transaction duplicated!");
    closeTransactionOptionsSheet();
}

function deleteSelectedTransaction() {
    if (!selectedTransactionForOptions) return;
    transactions = transactions.filter(tx => tx.id !== selectedTransactionForOptions.id);
    saveToLocalStorage();
    updateDashboard();
    updateAnalysis();
    updateAccounts();
    updateBudget();
    renderIncomeTransactions();
    renderSpendingTransactions();
    showToast("Transaction deleted!");
    closeTransactionOptionsSheet();
}

function createScheduledTransaction() {
    if (!selectedTransactionForOptions) return;
    openScheduleTransactionSheet();
}

let selectedDayVal = 1;
let selectedMonthVal = 0;
let selectedYearVal = 2026;
let selectedHourVal = 0;
let selectedMinuteVal = 0;

function populateWheel(elementId, items, defaultValue, callback) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    const spacerTop = document.createElement('div');
    spacerTop.style.height = '40px';
    spacerTop.style.flexShrink = '0';
    container.appendChild(spacerTop);

    items.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = "h-[40px] flex items-center justify-center snap-center text-body-lg font-bold select-none text-on-surface-variant transition-all flex-shrink-0 cursor-pointer duration-200";
        el.innerText = typeof item === 'string' ? item : item.toString().padStart(2, '0');
        el.onclick = () => {
            container.scrollTo({ top: index * 40, behavior: 'smooth' });
        };
        container.appendChild(el);
    });

    const spacerBottom = document.createElement('div');
    spacerBottom.style.height = '40px';
    spacerBottom.style.flexShrink = '0';
    container.appendChild(spacerBottom);

    container.onscroll = () => {
        const scrollPos = container.scrollTop;
        const index = Math.round(scrollPos / 40);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

        const children = container.querySelectorAll('div');
        children.forEach((child, i) => {
            if (i === clampedIndex + 1) {
                child.classList.add('text-primary', 'scale-110');
                child.classList.remove('text-on-surface-variant');
            } else {
                child.classList.remove('text-primary', 'scale-110');
                if (!child.style.height) {
                    child.classList.add('text-on-surface-variant');
                }
            }
        });

        callback(items[clampedIndex]);
    };

    const defIndex = items.indexOf(defaultValue);
    if (defIndex !== -1) {
        setTimeout(() => {
            container.scrollTop = defIndex * 40;
        }, 150);
    }
}

function openScheduleTransactionSheet() {
    const now = new Date();

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const startYear = now.getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => startYear + i);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    selectedDayVal = now.getDate();
    selectedMonthVal = now.getMonth();
    selectedYearVal = now.getFullYear();
    selectedHourVal = now.getHours();
    selectedMinuteVal = now.getMinutes();

    populateWheel('wheel-day', days, selectedDayVal, (val) => { selectedDayVal = val; });
    populateWheel('wheel-month', monthNames, monthNames[selectedMonthVal], (val) => { selectedMonthVal = monthNames.indexOf(val); });
    populateWheel('wheel-year', years, selectedYearVal, (val) => { selectedYearVal = val; });
    populateWheel('wheel-hour', hours, selectedHourVal, (val) => { selectedHourVal = val; });
    populateWheel('wheel-minute', minutes, selectedMinuteVal, (val) => { selectedMinuteVal = val; });

    closeTransactionOptionsSheet();

    document.getElementById('sheet-schedule-transaction').classList.remove('translate-y-full');
    showBackdrop();
}

function closeScheduleTransactionSheet(saved = false) {
    document.getElementById('sheet-schedule-transaction').classList.add('translate-y-full');
    if (!saved && selectedTransactionForOptions) {
        openTransactionOptionsSheet(selectedTransactionForOptions);
    } else {
        checkBackdropNeeded();
    }
}

function confirmScheduleTransaction() {
    const targetDate = new Date(selectedYearVal, selectedMonthVal, selectedDayVal, selectedHourVal, selectedMinuteVal);
    const targetTime = targetDate.getTime();
    const now = new Date().getTime();

    if (isNaN(targetTime)) {
        showToast("Please select a valid date and time");
        return;
    }

    if (targetTime <= now) {
        showToast("Scheduled time must be in the future");
        return;
    }

    if (!selectedTransactionForOptions) return;

    const newScheduled = {
        id: Date.now(),
        scheduledTime: targetTime,
        transaction: {
            ...selectedTransactionForOptions,
            id: transactions.length + 1,
            date: 'Today'
        }
    };

    scheduledTransactions.push(newScheduled);
    saveToLocalStorage();
    showToast("Transaction scheduled successfully!");
    closeScheduleTransactionSheet(true);
}

function checkScheduledTransactions() {
    const now = new Date().getTime();
    let executedAny = false;

    scheduledTransactions = scheduledTransactions.filter(item => {
        if (item.scheduledTime <= now) {
            transactions.unshift(item.transaction);
            showToast(`Auto-Executed Scheduled: ${item.transaction.category} (₹${item.transaction.amount})`);
            executedAny = true;
            return false;
        }
        return true;
    });

    if (executedAny) {
        saveToLocalStorage();
        updateDashboard();
        updateAnalysis();
        updateAccounts();
        updateBudget();
    }
}

let allTxTypeFilter = 'all';
let allTxSort = 'date-desc';

function toggleCustomFilterDropdown(type) {
    if (type === 'type') {
        document.getElementById('filter-type-dropdown').classList.toggle('hidden');
        document.getElementById('filter-sort-dropdown').classList.add('hidden');
    } else {
        document.getElementById('filter-sort-dropdown').classList.toggle('hidden');
        document.getElementById('filter-type-dropdown').classList.add('hidden');
    }
}

function setCustomFilterType(val) {
    allTxTypeFilter = val;
    const labelMap = { all: "All Types", expense: "Expenses", income: "Income" };
    document.getElementById('filter-type-label').innerText = labelMap[val];
    document.getElementById('filter-type-dropdown').classList.add('hidden');
    updateAllTransactionsView();
}

function setCustomSort(val) {
    allTxSort = val;
    const labelMap = {
        'date-desc': "Newest First",
        'date-asc': "Oldest First",
        'amount-desc': "Highest Amount",
        'amount-asc': "Lowest Amount"
    };
    document.getElementById('filter-sort-label').innerText = labelMap[val];
    document.getElementById('filter-sort-dropdown').classList.add('hidden');
    updateAllTransactionsView();
}

window.addEventListener('click', (e) => {
    if (!e || !e.target) return;

    // Dashboard Timeframe Filter
    const btn = document.getElementById('dashboard-filter-btn');
    const dropdown = document.getElementById('dashboard-filter-dropdown');
    if (btn && dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }

    // All Transactions View Filters
    const typeBtn = document.getElementById('filter-type-btn');
    const typeDropdown = document.getElementById('filter-type-dropdown');
    const sortBtn = document.getElementById('filter-sort-btn');
    const sortDropdown = document.getElementById('filter-sort-dropdown');

    if (typeBtn && typeDropdown && !typeBtn.contains(e.target) && !typeDropdown.contains(e.target)) {
        typeDropdown.classList.add('hidden');
    }
    if (sortBtn && sortDropdown && !sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.classList.add('hidden');
    }
});

function updateAllTransactionsView() {
    const searchVal = document.getElementById('all-tx-search').value.toLowerCase().trim();
    const typeFilter = allTxTypeFilter;
    const sortVal = allTxSort;

    let filtered = [...transactions];

    // 1. Apply Search
    if (searchVal) {
        filtered = filtered.filter(t => 
            (t.category && t.category.toLowerCase().includes(searchVal)) ||
            (t.note && t.note.toLowerCase().includes(searchVal)) ||
            (t.paymentMode && t.paymentMode.toLowerCase().includes(searchVal))
        );
    }

    // 2. Apply Type Filter
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Helper to get raw date timestamp from t.date
    const getTimestamp = (t) => {
        if (t.date === 'Today') {
            return new Date().getTime();
        }
        if (t.date === 'Yesterday') {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            return y.getTime();
        }
        const d = new Date(t.date);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    // 3. Apply Sort
    if (sortVal === 'date-desc') {
        filtered.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    } else if (sortVal === 'date-asc') {
        filtered.sort((a, b) => getTimestamp(a) - getTimestamp(b));
    } else if (sortVal === 'amount-desc') {
        filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amount-asc') {
        filtered.sort((a, b) => a.amount - b.amount);
    }

    // 4. Group by Day
    const groups = {};
    filtered.forEach(t => {
        let groupName = t.date;
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(t);
    });

    const container = document.getElementById('all-transactions-grouped-container');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-center text-on-surface-variant py-lg">No transactions found matching your filters</p>`;
        return;
    }

    for (const day in groups) {
        const groupCard = document.createElement('div');
        groupCard.className = "bg-surface-container p-md rounded-xl border border-outline-variant/10 space-y-md";

        const safeDayId = day.replace(/[^a-zA-Z0-9]/g, '-');
        groupCard.innerHTML = `
            <div class="border-b border-outline-variant/10 pb-xs">
                <span class="text-label-md font-bold text-primary uppercase tracking-wider">${day}</span>
            </div>
            <div class="space-y-sm" id="group-list-${safeDayId}">
            </div>
        `;
        
        container.appendChild(groupCard);

        const listContainer = groupCard.querySelector(`#group-list-${safeDayId}`);
        groups[day].forEach(t => {
            const isInc = t.type === 'income';
            const itemEl = document.createElement('div');
            itemEl.className = "p-sm rounded-lg flex items-center gap-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-[0.98]";
            bindLongPress(itemEl, t);

            let colorClass = "text-secondary bg-secondary-container/20";
            if (isInc) colorClass = "text-primary bg-primary-container/20";

            itemEl.innerHTML = `
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${colorClass}">
                    <span class="material-symbols-outlined text-[20px]">${t.categoryIcon || 'payments'}</span>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between">
                        <p class="text-body-md font-bold text-on-surface">${isInc ? '+' : '-'}₹${t.amount.toFixed(2)}</p>
                        <span class="material-symbols-outlined text-on-surface-variant text-lg">${t.paymentMode === 'Cash' ? 'payments' : t.paymentMode === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-label-md text-on-surface-variant">${t.note || t.category}</p>
                    </div>
                </div>
            `;
            listContainer.appendChild(itemEl);
        });
    }
}

function openSearchOnTransactionsPage() {
    switchView('transactions-all');
    setTimeout(() => {
        const searchInput = document.getElementById('all-tx-search');
        if (searchInput) {
            searchInput.focus();
        }
    }, 150);
}

function deleteCurrentEditingTransaction() {
    if (editingTransactionId !== null) {
        openConfirmActionSheet("Delete Transaction", "Are you sure you want to delete this transaction?", () => {
            transactions = transactions.filter(tx => tx.id !== editingTransactionId);
            saveToLocalStorage();
            updateDashboard();
            updateAnalysis();
            updateAccounts();
            updateBudget();
            closeAddTransactionModal();
            showToast("Transaction deleted successfully");
        });
    } else {
        closeAddTransactionModal();
    }
}

function updateTxDatePickerLabel() {
    const d = selectedTxDateObj;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const str = `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    
    const label = document.getElementById('tx-selected-datetime');
    if (label) label.innerText = str;

    const dtInput = document.getElementById('tx-input-datetime');
    if (dtInput) {
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
        dtInput.value = localISOTime;
    }
}

function getRelativeDateString(d) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24*60*60*1000);
    const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (checkDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (checkDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day} ${month} ${year}`;
    }
}

function parseTxDate(dateStr) {
    if (!dateStr || dateStr === 'Today') return new Date();
    if (dateStr === 'Yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
    }
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
        const monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dVal = parseInt(parts[0]);
        const mIdx = monthAbbrs.indexOf(parts[1]);
        let yVal = parseInt(parts[2]);
        if (yVal < 100) yVal += 2000;
        if (!isNaN(dVal) && mIdx !== -1 && !isNaN(yVal)) {
            return new Date(yVal, mIdx, dVal, 12, 0);
        }
    }
    return new Date();
}

let budgetPeriod = 'monthly';

function setBudgetPeriod(period) {
    budgetPeriod = period;
    const btnMonthly = document.getElementById('toggle-budget-monthly');
    const btnYearly = document.getElementById('toggle-budget-yearly');
    const titleEl = document.getElementById('budget-card-title');

    const abtnMonthly = document.getElementById('analysis-toggle-budget-monthly');
    const abtnYearly = document.getElementById('analysis-toggle-budget-yearly');
    const atitleEl = document.getElementById('analysis-budget-card-title');

    const activeCls = "px-md py-xs rounded-full text-label-lg font-bold transition-all bg-primary text-on-primary shadow-sm";
    const inactiveCls = "px-md py-xs rounded-full text-label-lg font-bold transition-all text-on-surface-variant hover:text-on-surface";

    if (period === 'monthly') {
        if (btnMonthly) btnMonthly.className = activeCls;
        if (btnYearly) btnYearly.className = inactiveCls;
        if (titleEl) titleEl.innerText = "Monthly budget";

        if (abtnMonthly) abtnMonthly.className = activeCls;
        if (abtnYearly) abtnYearly.className = inactiveCls;
        if (atitleEl) atitleEl.innerText = "Monthly budget";
    } else {
        if (btnYearly) btnYearly.className = activeCls;
        if (btnMonthly) btnMonthly.className = inactiveCls;
        if (titleEl) titleEl.innerText = "Yearly budget";

        if (abtnYearly) abtnYearly.className = activeCls;
        if (abtnMonthly) abtnMonthly.className = inactiveCls;
        if (atitleEl) atitleEl.innerText = "Yearly budget";
    }

    updateDashboard();
}

let activeBudgetTab = 'monthly';
let yearlyBudgetLimit = 0;

function switchBudgetViewTab(tab) {
    activeBudgetTab = tab;
    const btnMonthly = document.getElementById('btn-budget-tab-monthly');
    const btnYearly = document.getElementById('btn-budget-tab-yearly');

    if (tab === 'monthly') {
        btnMonthly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        btnYearly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
    } else {
        btnYearly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        btnMonthly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
    }

    updateBudget();
}

function openNetBalancesSheet() {
    let periodIncome = 0;
    let periodExpense = 0;
    transactions.forEach(t => {
        if (transactionBelongsToFilter(t)) {
            if (t.type === 'income') periodIncome += t.amount;
            else periodExpense += t.amount;
        }
    });
    const periodNet = periodIncome - periodExpense;

    let periodLabel = "For this month";
    if (dashboardFilter === 'month') {
        periodLabel = `For ${monthNames[currentMonth]} ${currentYear}`;
    } else if (dashboardFilter === 'year') {
        periodLabel = `For the year ${currentYear}`;
    } else {
        periodLabel = "For all time";
    }
    const lbl = document.getElementById('net-balance-period-label');
    if (lbl) lbl.innerText = periodLabel;

    let bankAmt = accountBalances.bank;
    let cashAmt = accountBalances.cash;
    let cardAmt = accountBalances.card;
    transactions.forEach(t => {
        if (t.paymentMode === 'Cash') {
            if (t.type === 'expense') cashAmt -= t.amount;
            else cashAmt += t.amount;
        } else if (t.paymentMode === 'Credit Card') {
            if (t.type === 'expense') cardAmt += t.amount;
            else cardAmt -= t.amount;
        } else {
            if (t.type === 'expense') bankAmt -= t.amount;
            else bankAmt += t.amount;
        }
    });
    const carryForward = bankAmt + cashAmt - cardAmt;

    let allTimeIncome = 0;
    let allTimeExpense = 0;
    transactions.forEach(t => {
        if (t.type === 'income') allTimeIncome += t.amount;
        else allTimeExpense += t.amount;
    });
    const allTimeNet = allTimeIncome - allTimeExpense;

    renderNetVal('net-balance-period', periodNet);
    renderNetVal('net-balance-carry', carryForward);
    renderNetVal('net-balance-alltime', allTimeNet);

    // Sync checkmark indicators
    const ticks = {
        period: document.getElementById('tick-balance-period'),
        carry: document.getElementById('tick-balance-carry'),
        alltime: document.getElementById('tick-balance-alltime')
    };
    for (const key in ticks) {
        if (ticks[key]) {
            ticks[key].classList.toggle('invisible', activeDashboardBalanceType !== key);
        }
    }

    document.getElementById('sheet-net-balances').classList.remove('translate-y-full');
    showBackdrop();
}

function renderNetVal(elementId, val) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const sign = val >= 0 ? '+' : '-';
    el.innerText = `${sign}₹${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (val >= 0) {
        el.className = "text-headline-md font-headline-md text-primary font-bold";
    } else {
        el.className = "text-headline-md font-headline-md text-secondary font-bold";
    }
}

function closeNetBalancesSheet() {
    document.getElementById('sheet-net-balances').classList.add('translate-y-full');
    checkBackdropNeeded();
}

let activeDashboardBalanceType = 'carry';

function selectDashboardBalanceType(type) {
    activeDashboardBalanceType = type;
    saveToLocalStorage();
    
    const ticks = {
        period: document.getElementById('tick-balance-period'),
        carry: document.getElementById('tick-balance-carry'),
        alltime: document.getElementById('tick-balance-alltime')
    };
    for (const key in ticks) {
        if (ticks[key]) {
            ticks[key].classList.toggle('invisible', key !== type);
        }
    }

    updateDashboard();
}

let manageCatTab = 'spending';
let selectedManageIcon = 'category';

function openManageCategoriesSheet() {
    manageCatTab = 'spending';
    selectedManageIcon = 'category';
    const previewIcon = document.getElementById('mgcat-selected-icon-name');
    if (previewIcon) previewIcon.innerText = selectedManageIcon;
    
    // Reset inputs
    const nameInput = document.getElementById('mgcat-new-name');
    if (nameInput) nameInput.value = '';
    
    setManageCatTab('spending');
    renderManageIconGrid();
    document.getElementById('sheet-manage-categories').classList.remove('translate-y-full');
    showBackdrop();
}

function closeManageCategoriesSheet() {
    document.getElementById('sheet-manage-categories').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function setManageCatTab(tab) {
    manageCatTab = tab;
    const btnSpend = document.getElementById('mgcat-pill-spending');
    const btnInc = document.getElementById('mgcat-pill-income');
    if (tab === 'spending') {
        if (btnSpend) btnSpend.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        if (btnInc) btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant";
    } else {
        if (btnInc) btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        if (btnSpend) btnSpend.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant";
    }
    renderManagedCategories();
}

function renderManagedCategories() {
    const list = manageCatTab === 'spending' ? expenseCategories : incomeCategories;
    const container = document.getElementById('mgcat-list');
    if (!container) return;
    container.innerHTML = '';
    
    list.forEach((cat, index) => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-md bg-surface-container-high rounded-xl border border-outline-variant/30";
        item.innerHTML = `
            <div class="flex items-center gap-md">
                <span class="material-symbols-outlined text-primary">${cat.icon}</span>
                <span class="text-body-lg font-semibold">${cat.name}</span>
            </div>
            <button class="material-symbols-outlined text-error hover:bg-error-container/20 p-1 rounded-full" onclick="deleteManagedCategory(${index})">delete</button>
        `;
        container.appendChild(item);
    });
}

function renderManageIconGrid() {
    const icons = ['shopping_basket', 'restaurant', 'shopping_bag', 'commute', 'receipt_long', 'sports_esports', 'flight', 'medical_services', 'school', 'work', 'laptop_mac', 'trending_up', 'redeem', 'payments', 'home', 'movie', 'directions_car', 'fitness_center', 'spa', 'pets'];
    const container = document.getElementById('mgcat-icon-grid');
    if (!container) return;
    container.innerHTML = '';
    
    icons.forEach(ico => {
        const btn = document.createElement('button');
        btn.className = "w-10 h-10 rounded-xl bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center border border-outline-variant/20";
        btn.type = 'button';
        btn.onclick = () => {
            selectedManageIcon = ico;
            const previewIcon = document.getElementById('mgcat-selected-icon-name');
            if (previewIcon) previewIcon.innerText = ico;
        };
        btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${ico}</span>`;
        container.appendChild(btn);
    });
}

function addNewManagedCategory() {
    const nameInput = document.getElementById('mgcat-new-name');
    const name = nameInput.value.trim();
    if (!name) {
        showToast("Please enter a category name");
        return;
    }
    
    const list = manageCatTab === 'spending' ? expenseCategories : incomeCategories;
    if (list.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast("Category already exists");
        return;
    }
    
    const newCat = {
        name: name,
        icon: selectedManageIcon,
        color: 'bg-primary-container/10 border-primary-container/20 text-primary',
        fillClass: 'group-hover:bg-primary-container/20 text-primary'
    };
    
    list.push(newCat);
    nameInput.value = '';
    renderManagedCategories();
    showToast("Category added!");
}

function deleteManagedCategory(index) {
    const list = manageCatTab === 'spending' ? expenseCategories : incomeCategories;
    if (list.length <= 1) {
        showToast("Cannot delete the last category");
        return;
    }
    list.splice(index, 1);
    renderManagedCategories();
    showToast("Category deleted");
}

let pickerSelectedDate = new Date();
let pickerActiveTab = 'date';
let pickerMode = 'tx'; // 'tx', 'analysis-from', 'analysis-to'

function initPickerSelects() {
    const hrOptions = document.getElementById('dtpicker-custom-hour-options');
    const minOptions = document.getElementById('dtpicker-custom-minute-options');
    if (!hrOptions || !minOptions) return;
    
    hrOptions.innerHTML = '';
    minOptions.innerHTML = '';
    
    for (let h = 1; h <= 12; h++) {
        const val = String(h).padStart(2, '0');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = "w-full text-center py-1.5 hover:bg-surface-container-high text-body-md text-on-surface font-semibold";
        btn.innerText = val;
        btn.onclick = () => selectPickerDropdownValue('hour', val);
        hrOptions.appendChild(btn);
    }
    for (let m = 0; m < 60; m++) {
        const val = String(m).padStart(2, '0');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = "w-full text-center py-1.5 hover:bg-surface-container-high text-body-md text-on-surface font-semibold";
        btn.innerText = val;
        btn.onclick = () => selectPickerDropdownValue('minute', val);
        minOptions.appendChild(btn);
    }
}

function togglePickerDropdown(type) {
    const dropdowns = ['hour', 'minute', 'ampm'];
    dropdowns.forEach(d => {
        const el = document.getElementById(`dtpicker-custom-${d}-options`);
        if (el) {
            if (d === type) {
                el.classList.toggle('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

function selectPickerDropdownValue(type, val) {
    const label = document.getElementById(`dtpicker-custom-${type}-value`);
    if (label) label.innerText = val;
    
    const el = document.getElementById(`dtpicker-custom-${type}-options`);
    if (el) el.classList.add('hidden');
    
    syncClockFromSelects();
}

function setPickerTab(tab) {
    pickerActiveTab = tab;
    const btnDate = document.getElementById('dtpicker-tab-date');
    const btnTime = document.getElementById('dtpicker-tab-time');
    const contentDate = document.getElementById('dtpicker-content-date');
    const contentTime = document.getElementById('dtpicker-content-time');
    
    // Close any open custom picker dropdowns
    togglePickerDropdown('none');
    
    if (tab === 'date') {
        if (btnDate) btnDate.className = "flex-1 py-1 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        if (btnTime) btnTime.className = "flex-1 py-1 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        if (contentDate) contentDate.classList.remove('hidden');
        if (contentTime) contentTime.classList.add('hidden');
        stopClockTicking();
    } else {
        if (btnTime) btnTime.className = "flex-1 py-1 rounded-lg text-label-lg font-label-lg transition-all bg-primary text-on-primary shadow-sm";
        if (btnDate) btnDate.className = "flex-1 py-1 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        if (contentTime) contentTime.classList.remove('hidden');
        if (contentDate) contentDate.classList.add('hidden');
        startClockTicking();
    }
}

function changePickerMonth(dir) {
    pickerSelectedDate.setMonth(pickerSelectedDate.getMonth() + dir);
    renderPickerCalendar();
}

function renderPickerCalendar() {
    const year = pickerSelectedDate.getFullYear();
    const month = pickerSelectedDate.getMonth();
    const label = document.getElementById('dtpicker-month-label');
    if (label) {
        label.innerText = `${monthNames[month]} ${year}`;
    }
    
    const grid = document.getElementById('dtpicker-calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    // Previous Month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = prevTotalDays - i;
        const cell = document.createElement('div');
        cell.className = "text-sm text-on-surface-variant/30 py-1.5";
        cell.innerText = d;
        grid.appendChild(cell);
    }
    
    // Current Month's days
    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement('div');
        const isSelected = d === pickerSelectedDate.getDate() && 
                           month === pickerSelectedDate.getMonth() && 
                           year === pickerSelectedDate.getFullYear();
        if (isSelected) {
            cell.className = "relative flex justify-center items-center py-1 cursor-pointer";
            cell.innerHTML = `<span class="absolute w-8 h-8 bg-primary rounded-full shadow-sm"></span><span class="relative text-sm font-bold text-on-primary">${d}</span>`;
        } else {
            cell.className = "text-sm font-bold text-on-surface hover:bg-surface-container-high rounded-full py-1.5 cursor-pointer";
            cell.innerText = d;
            cell.onclick = () => selectPickerDate(d);
        }
        grid.appendChild(cell);
    }
    
    // Next Month's leading days to complete grid
    const totalCells = firstDayIndex + totalDays;
    const remaining = 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
        const cell = document.createElement('div');
        cell.className = "text-sm text-on-surface-variant/30 py-1.5";
        cell.innerText = String(d).padStart(2, '0');
        grid.appendChild(cell);
    }
}

function selectPickerDate(day) {
    pickerSelectedDate.setDate(day);
    renderPickerCalendar();
}

function openTxDateTimePicker() {
    pickerMode = 'tx';
    pickerSelectedDate = new Date(selectedTxDateObj);
    
    const tabs = document.getElementById('dtpicker-tabs-container');
    if (tabs) tabs.classList.remove('hidden');
    
    const title = document.getElementById('dtpicker-title');
    if (title) title.innerText = "Select Date & Time";
    
    initPickerSelects();
    
    // Sync Custom Dropdowns
    let hr = pickerSelectedDate.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12;
    hr = hr ? hr : 12;
    const min = pickerSelectedDate.getMinutes();
    
    const hrVal = document.getElementById('dtpicker-custom-hour-value');
    const minVal = document.getElementById('dtpicker-custom-minute-value');
    const ampmVal = document.getElementById('dtpicker-custom-ampm-value');
    
    if (hrVal) hrVal.innerText = String(hr).padStart(2, '0');
    if (minVal) minVal.innerText = String(min).padStart(2, '0');
    if (ampmVal) ampmVal.innerText = ampm;
    
    syncClockFromSelects();
    
    setPickerTab('date');
    renderPickerCalendar();
    
    document.getElementById('sheet-datetime-picker').classList.remove('translate-y-full');
    showBackdrop();
}

function openCustomDatePicker(type) {
    pickerMode = 'analysis-' + type;
    const inputVal = document.getElementById('analysis-custom-' + type).value;
    pickerSelectedDate = inputVal ? new Date(inputVal) : new Date();
    
    const tabs = document.getElementById('dtpicker-tabs-container');
    if (tabs) tabs.classList.add('hidden');
    
    const title = document.getElementById('dtpicker-title');
    if (title) title.innerText = type === 'from' ? "Select From Date" : "Select To Date";
    
    setPickerTab('date');
    renderPickerCalendar();
    
    document.getElementById('sheet-datetime-picker').classList.remove('translate-y-full');
    showBackdrop();
}

function closeDateTimePickerSheet() {
    document.getElementById('sheet-datetime-picker').classList.add('translate-y-full');
    checkBackdropNeeded();
    stopClockTicking();
}

function confirmDateTimePickerSelection() {
    if (pickerMode === 'tx') {
        let hr = parseInt(document.getElementById('dtpicker-custom-hour-value').innerText) || 12;
        const min = parseInt(document.getElementById('dtpicker-custom-minute-value').innerText) || 0;
        const ampm = document.getElementById('dtpicker-custom-ampm-value').innerText;
        
        if (ampm === 'PM' && hr < 12) hr += 12;
        if (ampm === 'AM' && hr === 12) hr = 0;
        
        pickerSelectedDate.setHours(hr, min, 0, 0);
        selectedTxDateObj = new Date(pickerSelectedDate);
        updateTxDatePickerLabel();
    } else {
        const type = pickerMode.split('-')[1];
        const year = pickerSelectedDate.getFullYear();
        const month = String(pickerSelectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(pickerSelectedDate.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        
        document.getElementById('analysis-custom-' + type).value = isoDate;
        document.getElementById('analysis-custom-' + type + '-label').innerText = `${pickerSelectedDate.getDate()} ${monthNames[pickerSelectedDate.getMonth()]}`;
        updateAnalysis();
    }
    closeDateTimePickerSheet();
}

function syncClockHands(hour, minute) {
    const hourHand = document.getElementById('clock-hand-hour');
    const minHand = document.getElementById('clock-hand-minute');
    if (hourHand) {
        const hAngle = (hour % 12) * 30 + (minute * 0.5) + 90;
        hourHand.style.transform = `rotate(${hAngle}deg)`;
    }
    if (minHand) {
        const mAngle = minute * 6;
        minHand.style.transform = `rotate(${mAngle}deg)`;
    }
}

function syncClockFromSelects() {
    const hr = parseInt(document.getElementById('dtpicker-custom-hour-value').innerText) || 12;
    const min = parseInt(document.getElementById('dtpicker-custom-minute-value').innerText) || 0;
    syncClockHands(hr, min);
}

function initClockFaceInteraction() {
    const face = document.getElementById('analog-clock-face');
    if (!face) return;
    
    let isDragging = false;
    let dragTarget = 'minute'; // 'hour' or 'minute'
    
    function getDragAngleAndDistance(e) {
        const rect = face.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        
        return { angle, dist, dx, dy };
    }
    
    function startDrag(e) {
        isDragging = true;
        const { angle } = getDragAngleAndDistance(e);
        
        const hr = parseInt(document.getElementById('dtpicker-custom-hour-value').innerText) || 12;
        const min = parseInt(document.getElementById('dtpicker-custom-minute-value').innerText) || 0;
        
        const hourAngle = ((hr % 12) * 30 + min * 0.5) % 360;
        const minuteAngle = (min * 6) % 360;
        
        const diffHour = Math.min(Math.abs(angle - hourAngle), 360 - Math.abs(angle - hourAngle));
        const diffMinute = Math.min(Math.abs(angle - minuteAngle), 360 - Math.abs(angle - minuteAngle));
        
        if (diffHour < diffMinute) {
            dragTarget = 'hour';
        } else {
            dragTarget = 'minute';
        }
        
        handleTimeDrag(e);
    }
    
    function handleTimeDrag(e) {
        if (!isDragging) return;
        const { angle } = getDragAngleAndDistance(e);
        
        const hrVal = document.getElementById('dtpicker-custom-hour-value');
        const minVal = document.getElementById('dtpicker-custom-minute-value');
        
        if (dragTarget === 'hour') {
            let hr = Math.round(angle / 30) % 12;
            hr = hr === 0 ? 12 : hr;
            if (hrVal) hrVal.innerText = String(hr).padStart(2, '0');
        } else {
            let min = Math.round(angle / 6) % 60;
            if (minVal) minVal.innerText = String(min).padStart(2, '0');
        }
        syncClockFromSelects();
    }
    
    face.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', handleTimeDrag);
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    face.addEventListener('touchstart', (e) => {
        startDrag(e);
    });
    window.addEventListener('touchmove', handleTimeDrag);
    window.addEventListener('touchend', () => {
        isDragging = false;
    });
}

let calcExpression = '';
let calcCurrentVal = '0';
let calcResetOnNext = false;

function openCalculatorSheet() {
    const amt = document.getElementById('tx-input-amount').value;
    calcCurrentVal = amt && !isNaN(amt) ? String(amt) : '0';
    calcExpression = '';
    calcResetOnNext = false;
    updateCalcDisplay();
    
    document.getElementById('sheet-calculator').classList.remove('translate-y-full');
    showBackdrop();
}

function closeCalculatorSheet() {
    document.getElementById('sheet-calculator').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function updateCalcDisplay() {
    const disp = document.getElementById('calc-display');
    const expr = document.getElementById('calc-expression');
    if (disp) disp.innerText = calcCurrentVal;
    if (expr) {
        expr.innerText = calcExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    }
}

function pressCalcKey(key) {
    if (key === 'C') {
        calcCurrentVal = '0';
        calcExpression = '';
        calcResetOnNext = false;
    } else if (key === '+/-') {
        if (calcCurrentVal !== '0') {
            if (calcCurrentVal.startsWith('-')) {
                calcCurrentVal = calcCurrentVal.substring(1);
            } else {
                calcCurrentVal = '-' + calcCurrentVal;
            }
        }
    } else if (key === '%') {
        calcCurrentVal = String(parseFloat(calcCurrentVal) / 100);
        calcResetOnNext = true;
    } else if (['+', '-', '*', '/'].includes(key)) {
        if (calcExpression && !calcResetOnNext) {
            calcExpression += calcCurrentVal;
            const res = safeEvaluate(calcExpression);
            calcCurrentVal = String(res);
            calcExpression = calcCurrentVal + key;
        } else {
            calcExpression = calcCurrentVal + key;
        }
        calcResetOnNext = true;
    } else if (key === '=') {
        if (calcExpression) {
            calcExpression += calcCurrentVal;
            const res = safeEvaluate(calcExpression);
            calcCurrentVal = String(res);
            calcExpression = '';
            calcResetOnNext = true;
        }
    } else {
        if (calcResetOnNext) {
            calcCurrentVal = key === '.' ? '0.' : key;
            calcResetOnNext = false;
        } else {
            if (key === '.') {
                if (!calcCurrentVal.includes('.')) {
                    calcCurrentVal += '.';
                }
            } else {
                if (calcCurrentVal === '0') {
                    calcCurrentVal = key;
                } else {
                    calcCurrentVal += key;
                }
            }
        }
    }
    updateCalcDisplay();
}

function safeEvaluate(str) {
    try {
        const clean = str.replace(/[^0-9+\-*/.]/g, '');
        const res = new Function(`return ${clean}`)();
        if (isNaN(res) || !isFinite(res)) return 'Error';
        return Math.round(res * 100) / 100;
    } catch (e) {
        return 'Error';
    }
}

function confirmCalculatorValue() {
    if (calcCurrentVal !== 'Error') {
        const amtInput = document.getElementById('tx-input-amount');
        if (amtInput) {
            amtInput.value = calcCurrentVal;
            amtInput.dispatchEvent(new Event('input'));
        }
    }
    closeCalculatorSheet();
}

let clockTickingInterval = null;

function startClockTicking() {
    if (clockTickingInterval) clearInterval(clockTickingInterval);
    
    function tick() {
        const secondHand = document.getElementById('clock-hand-second');
        if (secondHand) {
            const s = new Date().getSeconds();
            const sAngle = s * 6;
            secondHand.style.transform = `rotate(${sAngle}deg)`;
        }
    }
    
    tick(); // initial tick
    clockTickingInterval = setInterval(tick, 1000);
}

function stopClockTicking() {
    if (clockTickingInterval) {
        clearInterval(clockTickingInterval);
        clockTickingInterval = null;
    }
}

// Hook up the Custom Date labels and Clock interactions on load
window.addEventListener('DOMContentLoaded', () => {
    initClockFaceInteraction();
    
    // Close custom dropdowns on outside click
    window.addEventListener('click', (e) => {
        if (!e.target.closest('#dtpicker-custom-hour') && 
            !e.target.closest('#dtpicker-custom-minute') && 
            !e.target.closest('#dtpicker-custom-ampm')) {
            togglePickerDropdown('none');
        }
    });

    // Auto-prefill transaction details based on past description
    const descInput = document.getElementById('tx-input-desc');
    if (descInput) {
        const handlePrefill = () => {
            const val = descInput.value.trim().toLowerCase();
            if (!val || !transactions) return;
            
            // Find most recent transaction with this description (case insensitive)
            const match = transactions.slice().reverse().find(t => {
                const descStr = t.description || t.note || "";
                return descStr.trim().toLowerCase() === val;
            });
            
            if (match) {
                selectedCategory = match.category;
                selectedCategoryIcon = match.categoryIcon || 'payments';
                
                selectedPaymentMode = match.paymentMode;
                if (match.paymentMode === 'Bank/UPI') selectedPaymentIcon = 'account_balance';
                else if (match.paymentMode === 'Credit Card') selectedPaymentIcon = 'credit_card';
                else selectedPaymentIcon = 'account_balance_wallet';
                
                selectedTags = [...(match.tags || [])];
                
                syncAddTransactionUI();
            }
        };
        descInput.addEventListener('blur', handlePrefill);
        descInput.addEventListener('change', handlePrefill);
    }

    setTimeout(() => {
        const fromVal = document.getElementById('analysis-custom-from');
        const toVal = document.getElementById('analysis-custom-to');
        if (fromVal && fromVal.value) {
            const d = new Date(fromVal.value);
            document.getElementById('analysis-custom-from-label').innerText = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        }
        if (toVal && toVal.value) {
            const d = new Date(toVal.value);
            document.getElementById('analysis-custom-to-label').innerText = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        }
    }, 100);
});

