// Capacitor Finance Web UI

// Application state
let currentUser = null;
let currentUserId = null;
let userAccounts = [];
let userTransactions = [];
let userGoals = [];
let charts = {};

// API endpoint (replace with your actual API URL in production)
const API_URL = 'http://localhost:3000/api';

// DOM ready event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    initializeEventListeners();
    
    // Check if user is already in session storage
    const savedUserId = sessionStorage.getItem('userId');
    if (savedUserId) {
        currentUserId = savedUserId;
        loadUserData();
    }
});

function initializeEventListeners() {
    // User form submission
    document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
    
    // Demo user button
    document.getElementById('demo-user').addEventListener('click', loadDemoUser);
    
    // Account form submission
    document.getElementById('save-account-btn').addEventListener('click', handleSaveAccount);
    
    // Transaction form submission
    document.getElementById('save-transaction-btn').addEventListener('click', handleSaveTransaction);
    
    // Budget form submission
    document.getElementById('budget-strategy-form').addEventListener('submit', handleBudgetFormSubmit);
    
    // Goal form submission
    document.getElementById('save-goal-btn').addEventListener('click', handleSaveGoal);
    
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Initialize transaction form category options
    populateCategoryDropdown();
}

// Event handlers
async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    const userData = {
        name: nameInput.value,
        email: emailInput.value
    };
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        
        const user = await response.json();
        currentUserId = user.id;
        
        // Save to session storage
        sessionStorage.setItem('userId', currentUserId);
        
        // Load user data and show dashboard
        await loadUserData();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showAlert('Error creating user account. Please try again.', 'danger');
    }
}

async function loadDemoUser() {
    // Create a demo user with sample data
    const userData = {
        name: 'Demo User',
        email: 'demo@example.com'
    };
    
    try {
        // Create user
        const userResponse = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to create demo user');
        }
        
        const user = await userResponse.json();
        currentUserId = user.id;
        
        // Save to session storage
        sessionStorage.setItem('userId', currentUserId);
        
        // Add demo accounts
        await addDemoAccount('Checking', 'Checking', 2500);
        await addDemoAccount('Savings', 'Savings', 10000);
        await addDemoAccount('Investment', 'Investment', 5000);
        
        // Add demo transactions
        await addDemoTransactions();
        
        // Load user data and show dashboard
        await loadUserData();
        
        showAlert('Demo data loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading demo data:', error);
        showAlert('Error loading demo data. Please try again.', 'danger');
    }
}

async function addDemoAccount(name, type, balance) {
    const accountData = {
        name: name,
        accountType: type,
        initialBalance: balance
    };
    
    await fetch(`${API_URL}/users/${currentUserId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
    });
}

async function addDemoTransactions() {
    const accounts = await (await fetch(`${API_URL}/users/${currentUserId}/accounts`)).json();
    
    if (accounts.length === 0) return;
    
    const checkingAccount = accounts.find(a => a.name === 'Checking');
    const savingsAccount = accounts.find(a => a.name === 'Savings');
    
    if (!checkingAccount || !savingsAccount) return;
    
    const transactions = [
        {
            amount: 3000,
            description: 'Monthly Salary',
            date: new Date().toISOString(),
            type: 'INCOME',
            category: 'SALARY',
            accountId: checkingAccount.name
        },
        {
            amount: 1000,
            description: 'Rent Payment',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'HOUSING',
            accountId: checkingAccount.name
        },
        {
            amount: 200,
            description: 'Grocery Shopping',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'FOOD',
            accountId: checkingAccount.name
        },
        {
            amount: 100,
            description: 'Electric Bill',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'UTILITIES',
            accountId: checkingAccount.name
        },
        {
            amount: 50,
            description: 'Netflix Subscription',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'ENTERTAINMENT',
            accountId: checkingAccount.name
        },
        {
            amount: 500,
            description: 'Emergency Fund Contribution',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'EMERGENCY_FUND',
            accountId: savingsAccount.name
        },
        {
            amount: 300,
            description: 'Retirement Contribution',
            date: new Date().toISOString(),
            type: 'EXPENSE',
            category: 'RETIREMENT',
            accountId: savingsAccount.name
        }
    ];
    
    // Add each transaction
    for (const transaction of transactions) {
        await fetch(`${API_URL}/users/${currentUserId}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
    }
}

async function loadUserData() {
    try {
        // Load user data
        const userResponse = await fetch(`${API_URL}/users/${currentUserId}`);
        if (!userResponse.ok) {
            throw new Error('Failed to load user data');
        }
        
        currentUser = await userResponse.json();
        
        // Load accounts
        const accountsResponse = await fetch(`${API_URL}/users/${currentUserId}/accounts`);
        userAccounts = await accountsResponse.json();
        
        // Load transactions
        const transactionsResponse = await fetch(`${API_URL}/users/${currentUserId}/transactions`);
        userTransactions = await transactionsResponse.json();
        
        // Hide welcome screen and show dashboard
        document.getElementById('welcome-section').classList.add('d-none');
        document.getElementById('dashboard').classList.remove('d-none');
        
        // Update UI components
        updateUserInfo();
        updateAccountsList();
        updateTransactionsList();
        updateFinancialOverview();
        loadRecommendations();
        
        // Show dashboard section
        showSection('dashboard');
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showAlert('Error loading user data. Please try again.', 'danger');
    }
}

function updateUserInfo() {
    // Update user info in navbar
    document.getElementById('user-info').innerHTML = `
        <span class="text-light me-2">${currentUser.name}</span>
        <button class="btn btn-sm btn-outline-light" id="logout-btn">
            Logout
        </button>
    `;
    
    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

function handleLogout() {
    // Clear session storage
    sessionStorage.removeItem('userId');
    
    // Reset application state
    currentUser = null;
    currentUserId = null;
    userAccounts = [];
    userTransactions = [];
    userGoals = [];
    
    // Hide all sections and show welcome screen
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById('welcome-section').classList.remove('d-none');
    
    // Clear user info
    document.getElementById('user-info').innerHTML = '';
}

async function handleSaveAccount() {
    const accountName = document.getElementById('account-name').value;
    const accountType = document.getElementById('account-type').value;
    const initialBalance = parseFloat(document.getElementById('initial-balance').value);
    
    if (!accountName || isNaN(initialBalance)) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        const accountData = {
            name: accountName,
            accountType: accountType,
            initialBalance: initialBalance
        };
        
        const response = await fetch(`${API_URL}/users/${currentUserId}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(accountData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create account');
        }
        
        // Reload accounts and update UI
        const accountsResponse = await fetch(`${API_URL}/users/${currentUserId}/accounts`);
        userAccounts = await accountsResponse.json();
        
        updateAccountsList();
        updateFinancialOverview();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAccountModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('add-account-form').reset();
        
        showAlert('Account created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating account:', error);
        showAlert('Error creating account. Please try again.', 'danger');
    }
}

async function handleSaveTransaction() {
    const transactionType = document.getElementById('transaction-type').value;
    const accountId = document.getElementById('transaction-account').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const description = document.getElementById('transaction-description').value;
    const category = document.getElementById('transaction-category').value;
    
    if (!transactionType || !accountId || isNaN(amount) || !date || !description || !category) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        const transactionData = {
            amount: amount,
            description: description,
            date: new Date(date).toISOString(),
            type: transactionType,
            category: category,
            accountId: accountId
        };
        
        const response = await fetch(`${API_URL}/users/${currentUserId}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create transaction');
        }
        
        // Reload transactions and accounts
        const transactionsResponse = await fetch(`${API_URL}/users/${currentUserId}/transactions`);
        userTransactions = await transactionsResponse.json();
        
        const accountsResponse = await fetch(`${API_URL}/users/${currentUserId}/accounts`);
        userAccounts = await accountsResponse.json();
        
        updateTransactionsList();
        updateAccountsList();
        updateFinancialOverview();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('add-transaction-form').reset();
        
        showAlert('Transaction added successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating transaction:', error);
        showAlert('Error adding transaction. Please try again.', 'danger');
    }
}

async function handleBudgetFormSubmit(e) {
    e.preventDefault();
    
    const strategyType = document.getElementById('strategy-select').value;
    const income = parseFloat(document.getElementById('income-input').value);
    
    if (isNaN(income) || income <= 0) {
        showAlert('Please enter a valid income amount', 'warning');
        return;
    }
    
    try {
        const budgetData = {
            strategyType: strategyType,
            income: income
        };
        
        const response = await fetch(`${API_URL}/users/${currentUserId}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budgetData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate budget');
        }
        
        const budget = await response.json();
        
        // Display budget
        displayBudget(budget, income);
        
    } catch (error) {
        console.error('Error generating budget:', error);
        showAlert('Error generating budget. Please try again.', 'danger');
    }
}

async function handleSaveGoal() {
    const goalName = document.getElementById('goal-name').value;
    const goalCategory = document.getElementById('goal-category').value;
    const targetAmount = parseFloat(document.getElementById('goal-target').value);
    const currentAmount = parseFloat(document.getElementById('goal-current').value || 0);
    const deadline = document.getElementById('goal-deadline').value;
    const description = document.getElementById('goal-description').value;
    
    if (!goalName || !goalCategory || isNaN(targetAmount) || targetAmount <= 0) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        const goalData = {
            name: goalName,
            category: goalCategory,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            description: description
        };
        
        // In a real app, we would call an API endpoint to create a goal
        // For now, we'll just simulate it and update the UI
        console.log('Creating goal:', goalData);
        
        // Add goal to list
        const goalId = 'goal-' + Date.now();
        const goal = { 
            id: goalId,
            ...goalData,
            progress: currentAmount > 0 ? (currentAmount / targetAmount) * 100 : 0,
            status: currentAmount >= targetAmount ? 'ACHIEVED' : 
                   currentAmount > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
        };
        
        userGoals.push(goal);
        
        // Update UI
        updateGoalsList();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGoalModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('add-goal-form').reset();
        
        showAlert('Goal created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating goal:', error);
        showAlert('Error creating goal. Please try again.', 'danger');
    }
}

function updateAccountsList() {
    // Update accounts container
    const accountsContainer = document.getElementById('accounts-container');
    accountsContainer.innerHTML = '';
    
    // Update transaction form account dropdown
    const transactionAccountSelect = document.getElementById('transaction-account');
    transactionAccountSelect.innerHTML = '';
    
    userAccounts.forEach(account => {
        // Create account card for accounts page
        const accountCard = document.createElement('div');
        accountCard.className = 'col-md-4 mb-4';
        accountCard.innerHTML = `
            <div class="card account-card">
                <div class="card-body">
                    <h5 class="card-title">${account.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${account.type}</h6>
                    <p class="card-text fs-4 fw-bold">$${account.balance.toFixed(2)}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary view-transactions-btn" data-account="${account.name}">
                        View Transactions
                    </button>
                </div>
            </div>
        `;
        accountsContainer.appendChild(accountCard);
        
        // Add option to transaction form
        const option = document.createElement('option');
        option.value = account.name;
        option.textContent = `${account.name} ($${account.balance.toFixed(2)})`;
        transactionAccountSelect.appendChild(option);
    });
    
    // Add event listeners to view-transactions buttons
    document.querySelectorAll('.view-transactions-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const accountName = btn.getAttribute('data-account');
            showSection('transactions');
            filterTransactionsByAccount(accountName);
        });
    });
}

function updateTransactionsList() {
    // Update recent transactions on dashboard
    const recentTransactionsBody = document.getElementById('transactions-table-body');
    recentTransactionsBody.innerHTML = '';
    
    // Update all transactions table
    const allTransactionsTable = document.getElementById('all-transactions-table');
    allTransactionsTable.innerHTML = '';
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...userTransactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Display recent transactions on dashboard (limit to 5)
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td>${formatCategory(transaction.category)}</td>
            <td class="${getTransactionColorClass(transaction.type)}">
                ${transaction.type === 'INCOME' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
        `;
        recentTransactionsBody.appendChild(row);
    });
    
    // Display all transactions in transactions page
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td>${formatCategory(transaction.category)}</td>
            <td>${transaction.accountId}</td>
            <td>${transaction.type}</td>
            <td class="${getTransactionColorClass(transaction.type)}">
                ${transaction.type === 'INCOME' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
        `;
        allTransactionsTable.appendChild(row);
    });
}

function updateFinancialOverview() {
    // Calculate total balance
    const totalBalance = userAccounts.reduce((sum, account) => sum + account.balance, 0);
    document.getElementById('total-balance').textContent = `$${totalBalance.toFixed(2)}`;
    
    // Calculate monthly income and expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = userTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
    document.getElementById('monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
    
    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(1)}%`;
    
    // Create income vs expense chart
    createIncomeExpenseChart();
}

function updateGoalsList() {
    const goalsContainer = document.getElementById('goals-container');
    goalsContainer.innerHTML = '';
    
    const goalsProgress = document.getElementById('goals-progress');
    goalsProgress.innerHTML = '';
    
    if (userGoals.length === 0) {
        goalsProgress.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted">No financial goals set yet.</p>
                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#addGoalModal">
                    Create Your First Goal
                </button>
            </div>
        `;
        
        goalsContainer.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">You haven't set any financial goals yet.</p>
                <p>Setting specific goals can help you stay motivated and track your progress.</p>
            </div>
        `;
        return;
    }
    
    // Display goals on dashboard
    userGoals.forEach(goal => {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-progress';
        goalItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span>${goal.name}</span>
                <span>${goal.progress.toFixed(0)}%</span>
            </div>
            <div class="progress">
                <div class="progress-bar ${getGoalProgressColorClass(goal.progress)}" 
                     role="progressbar" 
                     style="width: ${goal.progress}%" 
                     aria-valuenow="${goal.progress}" 
                     aria-valuemin="0" 
                     aria-valuemax="100"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-1">
                <small class="text-muted">$${goal.currentAmount.toFixed(2)} of $${goal.targetAmount.toFixed(2)}</small>
                <small class="text-muted">${getGoalStatusText(goal.status)}</small>
            </div>
        `;
        goalsProgress.appendChild(goalItem);
        
        // Create goal cards for goals page
        const goalCard = document.createElement('div');
        goalCard.className = 'col-md-4 mb-4';
        goalCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${goal.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${goal.category}</h6>
                    
                    <div class="progress mb-3 mt-3">
                        <div class="progress-bar ${getGoalProgressColorClass(goal.progress)}" 
                             role="progressbar" 
                             style="width: ${goal.progress}%" 
                             aria-valuenow="${goal.progress}" 
                             aria-valuemin="0" 
                             aria-valuemax="100"></div>
                    </div>
                    
                    <p class="card-text">
                        <strong>Target:</strong> $${goal.targetAmount.toFixed(2)}<br>
                        <strong>Current:</strong> $${goal.currentAmount.toFixed(2)}<br>
                        <strong>Status:</strong> ${getGoalStatusText(goal.status)}<br>
                        ${goal.deadline ? `<strong>Deadline:</strong> ${new Date(goal.deadline).toLocaleDateString()}<br>` : ''}
                        ${goal.description ? `<strong>Description:</strong> ${goal.description}` : ''}
                    </p>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-success me-1 contribute-btn" data-goal-id="${goal.id}">
                        Contribute
                    </button>
                    <button class="btn btn-sm btn-outline-danger withdraw-btn" data-goal-id="${goal.id}">
                        Withdraw
                    </button>
                </div>
            </div>
        `;
        goalsContainer.appendChild(goalCard);
    });
    
    // Add event listeners for goal buttons
    document.querySelectorAll('.contribute-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const goalId = btn.getAttribute('data-goal-id');
            // Add contribute modal/functionality
            console.log('Contribute to goal:', goalId);
        });
    });
    
    document.querySelectorAll('.withdraw-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const goalId = btn.getAttribute('data-goal-id');
            // Add withdraw modal/functionality
            console.log('Withdraw from goal:', goalId);
        });
    });
}

async function loadRecommendations() {
    try {
        const recommendationsContainer = document.getElementById('recommendations-list');
        recommendationsContainer.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        // In a real app, we would fetch recommendations from the API
        // For now, simulate a delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock recommendations
        const recommendations = [
            {
                title: 'Reduce Dining Out Expenses',
                description: 'You spent 30% more on dining out this month compared to last month. Consider cooking at home more often.',
                priorityLevel: 1,
                category: 'Spending',
                potentialSavings: 150.0,
                implementationDifficulty: 'MEDIUM'
            },
            {
                title: 'Increase Emergency Fund',
                description: 'Your emergency fund is only at 40% of the recommended amount. Try to allocate more to this fund.',
                priorityLevel: 2,
                category: 'Savings',
                implementationDifficulty: 'MEDIUM'
            },
            {
                title: 'Consider Index Fund Investing',
                description: 'Based on your savings, you could benefit from investing in low-cost index funds.',
                priorityLevel: 3,
                category: 'Investments',
                implementationDifficulty: 'HARD'
            }
        ];
        
        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <p class="text-muted text-center">No recommendations available at this time.</p>
            `;
            return;
        }
        
        recommendationsContainer.innerHTML = '';
        
        recommendations.forEach(rec => {
            const priorityClass = rec.priorityLevel === 1 ? 'high-priority' : 
                                  rec.priorityLevel === 2 ? 'medium-priority' : 
                                  'low-priority';
                                  
            const recElement = document.createElement('div');
            recElement.className = `recommendation-card mb-3 ${priorityClass}`;
            recElement.innerHTML = `
                <h6>${rec.title}</h6>
                <p class="mb-2">${rec.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-secondary">${rec.category}</span>
                    <span class="badge ${rec.implementationDifficulty === 'EASY' ? 'bg-success' : 
                                        rec.implementationDifficulty === 'MEDIUM' ? 'bg-warning' : 
                                        'bg-danger'}">
                        ${rec.implementationDifficulty}
                    </span>
                </div>
                ${rec.potentialSavings ? `
                <div class="mt-2">
                    <small class="text-success">Potential savings: $${rec.potentialSavings.toFixed(2)}</small>
                </div>
                ` : ''}
            `;
            recommendationsContainer.appendChild(recElement);
        });
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendations-list').innerHTML = `
            <p class="text-danger">Error loading recommendations. Please try again later.</p>
        `;
    }
}

function displayBudget(budget, income) {
    // Show budget description
    const budgetDescription = document.getElementById('budget-description');
    budgetDescription.classList.remove('d-none');
    budgetDescription.textContent = budget.strategyDescription;
    
    // Create budget table
    const budgetTableBody = document.getElementById('budget-table-body');
    budgetTableBody.innerHTML = '';
    
    const categories = [];
    const amounts = [];
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 99, 132, 0.7)',
        'rgba(130, 162, 235, 0.7)',
    ];
    
    let colorIndex = 0;
    
    for (const [category, amount] of Object.entries(budget.categories)) {
        const row = document.createElement('tr');
        const percent = (amount / income) * 100;
        
        row.innerHTML = `
            <td>${formatCategory(category)}</td>
            <td>$${amount.toFixed(2)}</td>
            <td>${percent.toFixed(1)}%</td>
        `;
        budgetTableBody.appendChild(row);
        
        // Add data for chart
        categories.push(formatCategory(category));
        amounts.push(amount);
    }
    
    // Create budget chart
    createBudgetChart(categories, amounts, colors);
}

function createIncomeExpenseChart() {
    const ctx = document.getElementById('income-expense-chart');
    
    // Destroy previous chart if it exists
    if (charts.incomeExpense) {
        charts.incomeExpense.destroy();
    }
    
    // Get monthly data
    const monthlyData = getMonthlyData();
    
    charts.incomeExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.map(m => m.month),
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.map(m => m.income),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: monthlyData.map(m => m.expenses),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Income vs Expenses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}

function createBudgetChart(categories, amounts, colors) {
    const ctx = document.getElementById('budget-chart');
    
    // Destroy previous chart if it exists
    if (charts.budget) {
        charts.budget.destroy();
    }
    
    charts.budget = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [
                {
                    data: amounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15
                    }
                }
            }
        }
    });
}

function getMonthlyData() {
    // Group transactions by month
    const monthlyData = {};
    
    userTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthName,
                income: 0,
                expenses: 0
            };
        }
        
        if (transaction.type === 'INCOME') {
            monthlyData[monthKey].income += transaction.amount;
        } else if (transaction.type === 'EXPENSE') {
            monthlyData[monthKey].expenses += transaction.amount;
        }
    });
    
    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => {
        const monthA = new Date(a.month);
        const monthB = new Date(b.month);
        return monthA - monthB;
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the requested section
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Handle special section initializations
    if (sectionId === 'accounts' && userAccounts) {
        updateAccountsList();
    } else if (sectionId === 'transactions' && userTransactions) {
        updateTransactionsList();
    } else if (sectionId === 'reports') {
        initializeReports();
    } else if (sectionId === 'goals') {
        updateGoalsList();
    }
}

function initializeReports() {
    // Initialize report tabs and charts
    // In a real app, this would load data from API endpoints
    
    // Income vs Expense trend chart
    createIncomeExpenseTrendChart();
    
    // Expense categories chart
    createExpenseCategoriesChart();
    
    // Net worth chart
    createNetWorthChart();
}

function createIncomeExpenseTrendChart() {
    const ctx = document.getElementById('income-expense-trend-chart');
    
    // Destroy previous chart if it exists
    if (charts.incomeTrend) {
        charts.incomeTrend.destroy();
    }
    
    // Get monthly data
    const monthlyData = getMonthlyData();
    
    charts.incomeTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(m => m.month),
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.map(m => m.income),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: monthlyData.map(m => m.expenses),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Savings',
                    data: monthlyData.map(m => m.income - m.expenses),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses Trend'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}

function createExpenseCategoriesChart() {
    const ctx = document.getElementById('expense-categories-chart');
    const table = document.getElementById('expense-categories-table');
    
    // Destroy previous chart if it exists
    if (charts.expenseCategories) {
        charts.expenseCategories.destroy();
    }
    
    // Clear table
    table.innerHTML = '';
    
    // Group expenses by category
    const expensesByCategory = {};
    let totalExpenses = 0;
    
    userTransactions.forEach(transaction => {
        if (transaction.type === 'EXPENSE') {
            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }
            expensesByCategory[transaction.category] += transaction.amount;
            totalExpenses += transaction.amount;
        }
    });
    
    // Convert to arrays for chart
    const categories = [];
    const amounts = [];
    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)'
    ];
    
    // Sort categories by amount
    const sortedCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([category, amount], index) => {
        categories.push(formatCategory(category));
        amounts.push(amount);
        
        // Add row to table
        const row = document.createElement('tr');
        const percent = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        
        row.innerHTML = `
            <td>${formatCategory(category)}</td>
            <td>$${amount.toFixed(2)}</td>
            <td>${percent.toFixed(1)}%</td>
        `;
        table.appendChild(row);
    });
    
    // Create chart
    charts.expenseCategories = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [
                {
                    data: amounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15
                    }
                }
            }
        }
    });
}

function createNetWorthChart() {
    const ctx = document.getElementById('net-worth-chart');
    const table = document.getElementById('net-worth-table');
    const totalNetWorthElement = document.getElementById('total-net-worth');
    
    // Destroy previous chart if it exists
    if (charts.netWorth) {
        charts.netWorth.destroy();
    }
    
    // Clear table
    table.innerHTML = '';
    
    // Calculate total net worth
    const totalNetWorth = userAccounts.reduce((sum, account) => sum + account.balance, 0);
    totalNetWorthElement.textContent = `$${totalNetWorth.toFixed(2)}`;
    
    // Prepare data for chart
    const labels = [];
    const data = [];
    const colors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    
    // Sort accounts by balance
    const sortedAccounts = [...userAccounts].sort((a, b) => b.balance - a.balance);
    
    sortedAccounts.forEach((account, index) => {
        labels.push(account.name);
        data.push(account.balance);
        
        // Add row to table
        const row = document.createElement('tr');
        const percent = totalNetWorth > 0 ? (account.balance / totalNetWorth) * 100 : 0;
        
        row.innerHTML = `
            <td>${account.name}</td>
            <td>$${account.balance.toFixed(2)}</td>
            <td>${percent.toFixed(1)}%</td>
        `;
        table.appendChild(row);
    });
    
    // Create chart
    charts.netWorth = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15
                    }
                }
            }
        }
    });
}

function filterTransactionsByAccount(accountName) {
    // In a real app, this would filter the transactions table to show only transactions for the selected account
    console.log('Filtering transactions for account:', accountName);
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('transaction-category');
    const transactionTypeSelect = document.getElementById('transaction-type');
    
    // Define category groups
    const incomeCategories = [
        'SALARY', 'BUSINESS', 'GIFTS', 'INVESTMENTS'
    ];
    
    const expenseCategories = [
        'HOUSING', 'TRANSPORTATION', 'FOOD', 'UTILITIES', 'HEALTHCARE',
        'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'PERSONAL_CARE',
        'TRAVEL', 'DINING_OUT', 'SUBSCRIPTIONS', 'EMERGENCY_FUND',
        'RETIREMENT', 'VACATION', 'EDUCATION_SAVINGS', 'OTHER'
    ];
    
    // Update categories when transaction type changes
    transactionTypeSelect.addEventListener('change', () => {
        updateCategoryOptions(transactionTypeSelect.value);
    });
    
    // Initialize with default options
    updateCategoryOptions('EXPENSE');
    
    function updateCategoryOptions(transactionType) {
        categorySelect.innerHTML = '';
        
        const categories = transactionType === 'INCOME' ? incomeCategories : expenseCategories;
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = formatCategory(category);
            categorySelect.appendChild(option);
        });
    }
}

// Helper functions
function formatCategory(category) {
    if (!category) return '';
    
    // Convert SNAKE_CASE to Title Case
    return category
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

function getTransactionColorClass(type) {
    switch (type) {
        case 'INCOME':
            return 'transaction-income';
        case 'EXPENSE':
            return 'transaction-expense';
        case 'TRANSFER':
            return 'transaction-transfer';
        case 'INVESTMENT':
            return 'transaction-investment';
        default:
            return '';
    }
}

function getGoalProgressColorClass(progress) {
    if (progress >= 100) return 'bg-success';
    if (progress >= 50) return 'bg-info';
    if (progress >= 25) return 'bg-warning';
    return 'bg-danger';
}

function getGoalStatusText(status) {
    switch (status) {
        case 'ACHIEVED':
            return 'Achieved';
        case 'ON_TRACK':
            return 'On Track';
        case 'IN_PROGRESS':
            return 'In Progress';
        case 'FALLING_BEHIND':
            return 'Falling Behind';
        case 'NOT_STARTED':
            return 'Not Started';
        default:
            return status;
    }
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = 1050;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}
