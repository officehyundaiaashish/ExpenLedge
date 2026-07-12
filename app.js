// State storage
let transactions = [];
let userProfile = {
    name: "Alex Thompson",
    email: "alex.t@expenseledg.com",
    biometricLock: false
};
let monthlyBudgetLimit = 9000;
let categoryBudgetLimits = {
    'Groceries': 2000,
    'Shopping': 1000,
    'Education': 800,
    'Transport': 500,
    'Bills & Utilities': 1500,
    'Entertainment': 600,
    'Medical': 1000,
    'Food & Drinks': 1200
};
let accountBalances = {
    bank: 25650.00,
    card: 5521.00,
    cash: 950.00
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

// Add transaction state variables
let selectedTxType = 'expense';
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

        const savedL = localStorage.getItem('expenledge_budget_limit');
        if (savedL) monthlyBudgetLimit = parseFloat(savedL) || 9000;

        const savedYL = localStorage.getItem('expenledge_yearly_budget_limit');
        if (savedYL) yearlyBudgetLimit = parseFloat(savedYL) || 108000;

        const savedBT = localStorage.getItem('expenledge_active_balance_type');
        if (savedBT) activeDashboardBalanceType = savedBT;

        const savedC = localStorage.getItem('expenledge_category_limits');
        if (savedC) categoryBudgetLimits = JSON.parse(savedC);

        const savedA = localStorage.getItem('expenledge_accounts');
        if (savedA) accountBalances = JSON.parse(savedA);

        const savedS = localStorage.getItem('expenledge_scheduled');
        if (savedS) scheduledTransactions = JSON.parse(savedS);

        const savedTheme = localStorage.getItem('expenledge_theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            document.body.classList.add('light-theme');
            currentTheme = 'light';
            setTimeout(() => {
                const icon = document.getElementById('theme-toggle-icon');
                if (icon) icon.innerText = 'dark_mode';
            }, 100);
        }
    } catch (e) {
        console.error("Local storage load failed: ", e);
    }
}

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
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
function setAnalysisPeriod(period) {
    analysisPeriod = period;
    ['week','month','year','custom'].forEach(p => {
        const btn = document.getElementById(`analysis-pill-${p}`);
        if (!btn) return;
        if (p === period) {
            btn.classList.add('bg-surface-variant','text-on-surface');
            btn.classList.remove('text-on-surface-variant');
        } else {
            btn.classList.remove('bg-surface-variant','text-on-surface');
            btn.classList.add('text-on-surface-variant');
        }
    });
    const nav = document.getElementById('analysis-period-nav');
    if (nav) nav.classList.toggle('hidden', period === 'week' || period === 'custom');
    updateAnalysis();
}

function changeAnalysisPeriod(dir) {
    if (analysisPeriod === 'month') {
        analysisMonth += dir;
        if (analysisMonth > 11) { analysisMonth = 0; analysisYear++; }
        if (analysisMonth < 0) { analysisMonth = 11; analysisYear--; }
        const label = document.getElementById('analysis-month-label');
        if (label) label.innerText = `${monthNames[analysisMonth]} ${analysisYear}`;
    } else if (analysisPeriod === 'year') {
        analysisYear += dir;
        const label = document.getElementById('analysis-month-label');
        if (label) label.innerText = `${analysisYear}`;
    }
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
        const weekEnd = new Date(analysisWeekStart); weekEnd.setDate(weekEnd.getDate() + 6); weekEnd.setHours(23,59,59,999);
        return txDate >= analysisWeekStart && txDate <= weekEnd;
    } else if (analysisPeriod === 'month') {
        return txDate.getMonth() === analysisMonth && txDate.getFullYear() === analysisYear;
    } else if (analysisPeriod === 'year') {
        return txDate.getFullYear() === analysisYear;
    } else { // custom — show all for now
        return true;
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
    let totalSpent = 0;
    const categorySums = {};

    transactions.forEach(t => {
        if (t.type === 'expense' && transactionBelongsToAnalysisPeriod(t)) {
            totalSpent += t.amount;
            categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
        }
    });

    document.getElementById('chart-total-spent').innerText = `₹${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Build dynamic list and donut chart
    const listContainer = document.getElementById('analysis-category-list');
    listContainer.innerHTML = '';

    const svg = document.getElementById('donut-svg');
    svg.innerHTML = ''; // reset SVG

    let offset = 0;
    const colors = {
        'Groceries': '#ff8a50',
        'Shopping': '#40c4ff',
        'Education': '#b388ff',
        'Transport': '#ff5252',
        'Bills & Utilities': '#7e57c2',
        'Entertainment': '#66bb6a',
        'Medical': '#ef5350',
        'Food & Drinks': '#ffd54f'
    };
    const bgLightColors = {
        'Groceries': 'bg-orange-500/10 text-orange-400',
        'Shopping': 'bg-blue-500/10 text-blue-400',
        'Education': 'bg-purple-500/10 text-purple-400',
        'Transport': 'bg-red-500/10 text-red-400',
        'Bills & Utilities': 'bg-indigo-500/10 text-indigo-400',
        'Entertainment': 'bg-green-500/10 text-green-400',
        'Medical': 'bg-red-400/10 text-red-300',
        'Food & Drinks': 'bg-yellow-500/10 text-yellow-400'
    };
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

    const sortedCategories = Object.keys(categorySums).sort((a, b) => categorySums[b] - categorySums[a]);

    if (sortedCategories.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-on-surface-variant py-md">No expenses recorded this month.</p>`;
        return;
    }

    sortedCategories.forEach(cat => {
        const sum = categorySums[cat];
        const pct = totalSpent > 0 ? (sum / totalSpent) * 100 : 0;
        const strokeColor = colors[cat] || '#899484';
        const bgLight = bgLightColors[cat] || 'bg-surface-container-high text-on-surface-variant';
        const icon = icons[cat] || 'payments';

        // Add list item
        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-md bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group";
        item.onclick = () => showToast(`${cat}: ₹${sum.toFixed(2)} (${pct.toFixed(1)}%)`);
        item.innerHTML = `
            <div class="flex items-center gap-md">
                <div class="w-12 h-12 rounded-full flex items-center justify-center ${bgLight}">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${icon}</span>
                </div>
                <div>
                    <p class="text-body-lg font-semibold">${cat}</p>
                    <p class="text-label-md text-on-surface-variant">${pct.toFixed(1)}% of total</p>
                </div>
            </div>
            <p class="text-body-lg font-bold">₹${sum.toFixed(2)}</p>
        `;
        listContainer.appendChild(item);

        // Add SVG circle segment
        // SVG formula: radius 15.915 gives a circumference of exactly 100
        const strokeDasharray = `${pct} ${100 - pct}`;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'donut-segment transition-all duration-500');
        circle.setAttribute('cx', '18');
        circle.setAttribute('cy', '18');
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('r', '15.915');
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', '4.5');
        circle.setAttribute('stroke-dasharray', strokeDasharray);
        circle.setAttribute('stroke-dashoffset', (-offset).toString());

        svg.appendChild(circle);
        offset += pct;
    });
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
    const btnEl = document.querySelector('#modal-add-transaction button[onclick="saveTransaction()"]');
    if (btnEl) btnEl.innerText = "Save Transaction";

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
        btnExp.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-surface-variant text-on-surface";
        btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
        selectedCategory = 'Groceries';
        selectedCategoryIcon = 'shopping_basket';
    } else {
        btnInc.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-surface-variant text-on-surface";
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
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = "grid grid-cols-3 gap-y-xl gap-x-gutter";

    const list = selectedTxType === 'expense' ? expenseCategories : incomeCategories;

    list.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = "flex flex-col items-center gap-sm group";
        btn.onclick = () => selectCategory(cat.name, cat.icon);
        btn.innerHTML = `
            <div class="w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center transition-all group-active:scale-90 ${cat.fillClass}">
                <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">${cat.icon}</span>
            </div>
            <span class="text-label-lg font-label-lg text-on-surface-variant text-center">${cat.name}</span>
        `;
        grid.appendChild(btn);
    });
    container.appendChild(grid);
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
    const btnEl = document.querySelector('#modal-add-transaction button[onclick="saveTransaction()"]');
    if (btnEl) btnEl.innerText = "Save Changes";

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

function openProfileSecuritySheet() {
    document.getElementById('profile-input-name').value = userProfile.name;
    document.getElementById('profile-input-email').value = userProfile.email;
    document.getElementById('security-biometric-toggle').checked = userProfile.biometricLock;

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

    if (!newName || !newEmail) {
        showToast("Name and email cannot be empty");
        return;
    }

    userProfile.name = newName;
    userProfile.email = newEmail;

    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const dbName = document.getElementById('dashboard-user-name');

    if (nameDisplay) nameDisplay.innerText = newName;
    if (emailDisplay) emailDisplay.innerText = newEmail;
    if (dbName) dbName.innerText = newName;

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

    document.getElementById('sheet-edit-budget').classList.remove('translate-y-full');
    showBackdrop();
}

function closeEditBudgetSheet() {
    document.getElementById('sheet-edit-budget').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function saveBudgetSettings() {
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

let txSelectedDayVal = 1;
let txSelectedMonthVal = 0;
let txSelectedYearVal = 2026;
let txSelectedHourVal = 0;
let txSelectedMinuteVal = 0;

function openTxDatePickerSheet() {
    const d = selectedTxDateObj;
    
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const startYear = new Date().getFullYear() - 5;
    const years = Array.from({ length: 11 }, (_, i) => startYear + i);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    txSelectedDayVal = d.getDate();
    txSelectedMonthVal = d.getMonth();
    txSelectedYearVal = d.getFullYear();
    txSelectedHourVal = d.getHours();
    txSelectedMinuteVal = d.getMinutes();

    populateWheel('txwheel-day', days, txSelectedDayVal, (val) => { txSelectedDayVal = val; });
    populateWheel('txwheel-month', monthNames, monthNames[txSelectedMonthVal], (val) => { txSelectedMonthVal = monthNames.indexOf(val); });
    populateWheel('txwheel-year', years, txSelectedYearVal, (val) => { txSelectedYearVal = val; });
    populateWheel('txwheel-hour', hours, txSelectedHourVal, (val) => { txSelectedHourVal = val; });
    populateWheel('txwheel-minute', minutes, txSelectedMinuteVal, (val) => { txSelectedMinuteVal = val; });

    document.getElementById('sheet-tx-datepicker').classList.remove('translate-y-full');
    showBackdrop();
}

function closeTxDatePickerSheet() {
    document.getElementById('sheet-tx-datepicker').classList.add('translate-y-full');
    checkBackdropNeeded();
}

function confirmTxDatePicker() {
    selectedTxDateObj = new Date(txSelectedYearVal, txSelectedMonthVal, txSelectedDayVal, txSelectedHourVal, txSelectedMinuteVal);
    updateTxDatePickerLabel();
    closeTxDatePickerSheet();
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
let yearlyBudgetLimit = 108000;

function switchBudgetViewTab(tab) {
    activeBudgetTab = tab;
    const btnMonthly = document.getElementById('btn-budget-tab-monthly');
    const btnYearly = document.getElementById('btn-budget-tab-yearly');

    if (tab === 'monthly') {
        btnMonthly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-surface-variant text-on-surface";
        btnYearly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all text-on-surface-variant hover:bg-surface-container-high";
    } else {
        btnYearly.className = "flex-1 py-2 rounded-lg text-label-lg font-label-lg transition-all bg-surface-variant text-on-surface";
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

function toggleTheme() {
    console.log("toggleTheme called. Current theme state:", currentTheme);
    const icon = document.getElementById('theme-toggle-icon');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
        currentTheme = 'light';
        if (icon) icon.innerText = 'dark_mode';
        showToast("Switched to Light Theme");
    } else {
        document.documentElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
        currentTheme = 'dark';
        if (icon) icon.innerText = 'light_mode';
        showToast("Switched to Dark Theme");
    }
    localStorage.setItem('expenledge_theme', currentTheme);
    console.log("New theme state:", currentTheme, "body classes:", document.body.className);
}
window.toggleTheme = toggleTheme;
