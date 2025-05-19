/**
 * Capacitor Finance Demo
 * This demo file runs a demonstration of the Personal Finance Management System
 * It creates sample data and demonstrates key features
 */

import { v4 as uuidv4 } from 'uuid';
import { BudgetStrategyContext } from './patterns/strategy/BudgetStrategyContext';
import { FiftyThirtyTwentyStrategy } from './services/budget/FiftyThirtyTwentyStrategy';
import { ZeroBasedBudgetStrategy } from './services/budget/ZeroBasedBudgetStrategy';
import { BudgetingState } from './patterns/state/BudgetingState';
import { SavingsState } from './patterns/state/SavingsState';
import { InvestmentState } from './patterns/state/InvestmentState';
import { User } from './core/models/User';
import { Transaction } from './core/models/Transaction';
import { TransactionType } from './core/enums/TransactionType';
import { CategoryType } from './core/enums/CategoryType';
import { Goal } from './core/models/Goal';
import { ReportingService } from './services/reporting/ReportingService';
import { TransactionCategorizationService } from './services/categorization/TransactionCategorizationService';
import { RecommendationEngine } from './services/recommendations/RecommendationEngine';
import { IndividualAccount, AccountGroup } from './patterns/composite/FinancialComponent';
import { FinancialStateContext } from './patterns/state/FinancialState';

/**
 * Main demo function that showcases the capabilities of the system
 */
export default function runDemo() {
    console.log("\n========================================================");
    console.log("      CAPACITOR FINANCE MANAGEMENT SYSTEM DEMO");
    console.log("========================================================\n");

    // Initialize services
    console.log("Initializing services...");
    const reportingService = new ReportingService();
    const categorizationService = new TransactionCategorizationService();
    const recommendationEngine = new RecommendationEngine();

    // Create initial state and user
    console.log("\nCreating user and financial state...");
    const initialState = new BudgetingState();
    const user = new User(uuidv4(), "John Doe", "john@example.com", initialState);
    console.log(`User created: ${user.getName()} (${user.getEmail()})`);

    // Initialize financial state context
    const stateContext = new FinancialStateContext(user, initialState);
    // Ensure the initial state is properly connected to the context
    initialState.setContext(stateContext);

    // Add accounts using Composite pattern
    console.log("\nCreating financial accounts (using Composite pattern)...");
    const checkingAccount = new IndividualAccount("Checking", 2500, "Checking");
    const savingsAccount = new IndividualAccount("Savings", 10000, "Savings");
    const investmentAccount = new IndividualAccount("Investment", 15000, "Investment");
    const retirementAccount = new IndividualAccount("401k", 50000, "Retirement");

    // Create an account group for investments
    const investmentGroup = new AccountGroup("Investment Accounts");
    investmentGroup.addAccount(investmentAccount);
    investmentGroup.addAccount(retirementAccount);

    user.addAccount(checkingAccount);
    user.addAccount(savingsAccount);
    user.addAccount(investmentGroup);

    console.log("Accounts created:");
    user.getAccounts().forEach(account => {
        console.log(`- ${account.getName()}: $${account.getBalance().toFixed(2)}`);

        // If it's an account group, also list its children
        if ('getAccounts' in account && typeof account.getAccounts === 'function') {
            const childAccounts = account.getAccounts();
            childAccounts?.forEach(childAccount => {
                console.log(`  - ${childAccount.getName()}: $${childAccount.getBalance().toFixed(2)}`);
            });
        }
    });
    console.log(`Total balance: $${user.getTotalBalance().toFixed(2)}`);

    // Create financial goals
    console.log("\nCreating financial goals...");
    const vacationGoal = new Goal(
        uuidv4(),
        "Summer Vacation",
        2000,
        "Vacation",
        new Date(new Date().getFullYear() + 1, 5, 15)
    );
    vacationGoal.addContribution(500);

    const emergencyFundGoal = new Goal(
        uuidv4(),
        "Emergency Fund",
        15000,
        "Emergency",
        undefined,
        "6 months of expenses"
    );
    emergencyFundGoal.addContribution(7500);

    const homeDownPaymentGoal = new Goal(
        uuidv4(),
        "House Down Payment",
        60000,
        "Home",
        new Date(new Date().getFullYear() + 3, 0, 1),
        "20% down payment on a home"
    );
    homeDownPaymentGoal.addContribution(20000);

    user.addGoal(vacationGoal);
    user.addGoal(emergencyFundGoal);
    user.addGoal(homeDownPaymentGoal);

    console.log("Goals created:");
    user.getGoals().forEach(goal => {
        console.log(`- ${goal.getName()}: $${goal.getCurrentAmount().toFixed(2)} / $${goal.getTargetAmount().toFixed(2)} (${goal.getProgress().toFixed(1)}%)`);
        console.log(`  Status: ${goal.getStatus()}`);
    });

    // Create sample transactions
    console.log("\nCreating sample transactions...");
    const transactions = [
        new Transaction(uuidv4(), 5000, "Monthly Salary", new Date(), TransactionType.INCOME, CategoryType.SALARY, checkingAccount.getName()),
        new Transaction(uuidv4(), 1500, "Rent Payment", new Date(), TransactionType.EXPENSE, CategoryType.HOUSING, checkingAccount.getName()),
        new Transaction(uuidv4(), 400, "Grocery Shopping", new Date(), TransactionType.EXPENSE, CategoryType.FOOD, checkingAccount.getName()),
        new Transaction(uuidv4(), 150, "Electric Bill", new Date(), TransactionType.EXPENSE, CategoryType.UTILITIES, checkingAccount.getName()),
        new Transaction(uuidv4(), 80, "Internet Bill", new Date(), TransactionType.EXPENSE, CategoryType.UTILITIES, checkingAccount.getName()),
        new Transaction(uuidv4(), 50, "Netflix Subscription", new Date(), TransactionType.EXPENSE, CategoryType.ENTERTAINMENT, checkingAccount.getName()),
        new Transaction(uuidv4(), 150, "Dining Out", new Date(), TransactionType.EXPENSE, CategoryType.DINING_OUT, checkingAccount.getName()),
        new Transaction(uuidv4(), 800, "Emergency Fund Contribution", new Date(), TransactionType.EXPENSE, CategoryType.EMERGENCY_FUND, savingsAccount.getName()),
        new Transaction(uuidv4(), 500, "Retirement Contribution", new Date(), TransactionType.EXPENSE, CategoryType.RETIREMENT, retirementAccount.getName()),
        new Transaction(uuidv4(), 200, "Investment Purchase", new Date(), TransactionType.INVESTMENT, CategoryType.INVESTMENTS, investmentAccount.getName()),
    ];

    // Process each transaction through the user's financial state
    console.log("Processing transactions...");
    transactions.forEach(transaction => {
        // Use the state context to handle transactions which will update the user state as well
        stateContext.handleTransaction(transaction);
        console.log(`- ${transaction.description}: $${transaction.amount.toFixed(2)} (${transaction.type})`);
    });

    // Demonstrate the Strategy Pattern with different budget strategies
    console.log("\nDemonstrating Strategy Pattern with different budget strategies:");

    // Use the 50/30/20 strategy
    console.log("\n1. 50/30/20 Budget Strategy:");
    const budgetContext = new BudgetStrategyContext(new FiftyThirtyTwentyStrategy());
    console.log(`Strategy: ${budgetContext.getStrategyName()}`);
    console.log(`Description: ${budgetContext.getStrategyDescription()}`);

    const fiftyThirtyTwentyBudget = budgetContext.calculateBudget(5000);
    console.log("\nBudget Allocation:");
    fiftyThirtyTwentyBudget.forEach((amount, category) => {
        console.log(`${category}: $${amount.toFixed(2)}`);
    });

    console.log("\nRecommendations based on 50/30/20 strategy:");
    const recommendations1 = budgetContext.getRecommendations(transactions);
    recommendations1.forEach(rec => console.log(`- ${rec}`));

    // Switch to Zero-based budget strategy
    console.log("\n2. Zero-Based Budget Strategy:");
    budgetContext.setStrategy(new ZeroBasedBudgetStrategy());
    console.log(`Strategy: ${budgetContext.getStrategyName()}`);
    console.log(`Description: ${budgetContext.getStrategyDescription()}`);

    const zeroBasedBudget = budgetContext.calculateBudget(5000);
    console.log("\nBudget Allocation:");
    zeroBasedBudget.forEach((amount, category) => {
        console.log(`${category}: $${amount.toFixed(2)}`);
    });

    console.log("\nRecommendations based on Zero-Based strategy:");
    const recommendations2 = budgetContext.getRecommendations(transactions);
    recommendations2.forEach(rec => console.log(`- ${rec}`));

    // Demonstrate the State Pattern
    console.log("\nDemonstrating State Pattern with different financial states:");

    // Start with Budgeting State
    console.log("\n1. Current state: " + stateContext.getState().getName());
    console.log("\nGenerating reports specific to Budgeting State:");
    const budgetingStateReports = stateContext.getStateSpecificReports();
    budgetingStateReports.forEach(report => {
        console.log(`- ${report.title}: ${report.description}`);
    });

    // Transition to Savings State
    console.log("\n2. Transitioning to Savings State:");
    const savingsState = new SavingsState();
    stateContext.transitionTo(savingsState);
    console.log("Current state: " + stateContext.getState().getName());
    console.log("\nGenerating recommendations specific to Savings State:");
    const savingsRecommendations = stateContext.generateRecommendations();
    savingsRecommendations.forEach(rec => {
        console.log(`- ${rec.title}: ${rec.description}`);
        console.log(`  Priority: ${rec.priorityLevel}, Difficulty: ${rec.implementationDifficulty}`);
    });

    // Transition to Investment State
    console.log("\n3. Transitioning to Investment State:");
    const investmentState = new InvestmentState();
    stateContext.transitionTo(investmentState);
    console.log("Current state: " + stateContext.getState().getName());
    console.log("\nGenerating recommendations specific to Investment State:");
    const investmentRecommendations = stateContext.generateRecommendations();
    investmentRecommendations.forEach(rec => {
        console.log(`- ${rec.title}: ${rec.description}`);
        console.log(`  Priority: ${rec.priorityLevel}, Difficulty: ${rec.implementationDifficulty}`);
    });

    // Generate reports
    console.log("\nGenerating Financial Reports:");
    const incomeVsExpenseReport = reportingService.generateIncomeVsExpenseReport(transactions);
    console.log(`\n1. ${incomeVsExpenseReport.title}`);
    console.log(`${incomeVsExpenseReport.description}`);
    console.log(`Income: $${incomeVsExpenseReport.data.summary.totalIncome.toFixed(2)}`);
    console.log(`Expenses: $${incomeVsExpenseReport.data.summary.totalExpenses.toFixed(2)}`);
    console.log(`Net Cashflow: $${incomeVsExpenseReport.data.summary.netCashflow.toFixed(2)}`);
    console.log(`Savings Rate: ${incomeVsExpenseReport.data.summary.savingsRate.toFixed(1)}%`);

    const expensesByCategoryReport = reportingService.generateExpensesByCategoryReport(transactions);
    console.log(`\n2. ${expensesByCategoryReport.title}`);
    console.log(`${expensesByCategoryReport.description}`);
    console.log("Top Categories by Expense:");
    expensesByCategoryReport.data.categories.forEach((category: { category: string, amount: number, percentage: number }, index: number) => {
        if (index < 5) { // Show top 5
            console.log(`- ${category.category}: $${category.amount.toFixed(2)} (${category.percentage.toFixed(1)}%)`);
        }
    });

    const netWorthReport = reportingService.generateNetWorthReport(user);
    console.log(`\n3. ${netWorthReport.title}`);
    console.log(`${netWorthReport.description}`);
    console.log(`Total Net Worth: $${netWorthReport.data.totalNetWorth.toFixed(2)}`);

    const savingsGoalsReport = reportingService.generateSavingsGoalsReport(user);
    console.log(`\n4. ${savingsGoalsReport.title}`);
    console.log(`${savingsGoalsReport.description}`);
    savingsGoalsReport.data.forEach((goal: { name: string; progress: number }) => {
        console.log(`- ${goal.name}: ${goal.progress.toFixed(1)}% complete`);
    });

    // Transaction categorization using AI (simulated)
    console.log("\nDemonstrating Transaction Categorization Service:");
    const uncategorizedTransactions = [
        new Transaction(uuidv4(), 25.50, "AMZN Marketplace", new Date(), TransactionType.EXPENSE, CategoryType.OTHER, checkingAccount.getName()),
        new Transaction(uuidv4(), 42.18, "Shell Gas Station", new Date(), TransactionType.EXPENSE, CategoryType.OTHER, checkingAccount.getName()),
        new Transaction(uuidv4(), 127.35, "Safeway", new Date(), TransactionType.EXPENSE, CategoryType.OTHER, checkingAccount.getName()),
        new Transaction(uuidv4(), 9.99, "Spotify Premium", new Date(), TransactionType.EXPENSE, CategoryType.OTHER, checkingAccount.getName()),
    ];

    console.log("Uncategorized Transactions:");
    uncategorizedTransactions.forEach(transaction => {
        console.log(`- ${transaction.description}: $${transaction.amount.toFixed(2)} (Initially: ${transaction.category})`);
    });

    console.log("\nAfter AI Categorization:");
    const categorizedTransactions = categorizationService.bulkCategorize(uncategorizedTransactions);
    categorizedTransactions.forEach(transaction => {
        console.log(`- ${transaction.description}: $${transaction.amount.toFixed(2)} (Categorized as: ${transaction.category})`);
    });

    // Generate AI-powered recommendations
    console.log("\nGenerating AI-Powered Personalized Recommendations:");
    const personalizedRecs = recommendationEngine.generateRecommendations(user, transactions);
    personalizedRecs.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.title}`);
        console.log(`   ${rec.description}`);
        console.log(`   Priority Level: ${rec.priorityLevel}, Difficulty: ${rec.implementationDifficulty}`);
        if (rec.potentialSavings) {
            console.log(`   Potential Savings: $${rec.potentialSavings.toFixed(2)}`);
        }
    });

    console.log("\n========================================================");
    console.log("                   DEMO COMPLETED");
    console.log("========================================================\n");
    console.log("This demo demonstrated the following design patterns:");
    console.log("1. Singleton Pattern: For database connection management (DatabaseSingleton)");
    console.log("2. Strategy Pattern: For different budgeting methods (50/30/20, Zero-Based)");
    console.log("3. State Pattern: For different financial modes (Budgeting, Savings, Investment)");
    console.log("4. Composite Pattern: For organizing accounts hierarchically");
    console.log("\nIt also showcased the AI-powered features:");
    console.log("1. Transaction Categorization");
    console.log("2. Personalized Financial Recommendations");
    console.log("3. Financial Analysis and Reporting");
    console.log("\nThanks for using Capacitor Finance!");
}
