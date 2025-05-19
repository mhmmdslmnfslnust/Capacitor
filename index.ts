import { BudgetStrategyContext } from './src/patterns/strategy/BudgetStrategyContext';
import { FiftyThirtyTwentyStrategy } from './src/services/budget/FiftyThirtyTwentyStrategy';
import { ZeroBasedBudgetStrategy } from './src/services/budget/ZeroBasedBudgetStrategy';
import { BudgetingState } from './src/patterns/state/BudgetingState';
import { User } from './src/core/models/User';
import { Transaction } from './src/core/models/Transaction';
import { TransactionType } from './src/core/enums/TransactionType';
import { CategoryType } from './src/core/enums/CategoryType';
import { Goal } from './src/core/models/Goal';
import { ReportingService } from './src/services/reporting/ReportingService';
import { TransactionCategorizationService } from './src/services/categorization/TransactionCategorizationService';
import { RecommendationEngine } from './src/services/recommendations/RecommendationEngine';
import { IndividualAccount } from './src/patterns/composite/FinancialComponent';

// Demo function to show the application working
function runDemo() {
  console.log("Starting Capacitor Finance App Demo");
  
  // Initialize services
  const reportingService = new ReportingService();
  const categorizationService = new TransactionCategorizationService();
  const recommendationEngine = new RecommendationEngine();
  
  // Create initial state and user
  const initialState = new BudgetingState();
  const user = new User("user1", "John Doe", "john@example.com", initialState);
  
  // Add accounts
  const checkingAccount = new IndividualAccount("Checking", 2500, "Checking");
  const savingsAccount = new IndividualAccount("Savings", 10000, "Savings");
  user.addAccount(checkingAccount);
  user.addAccount(savingsAccount);
  
  // Add goals
  const vacationGoal = new Goal(
    "goal1", 
    "Summer Vacation", 
    2000, 
    "Vacation", 
    new Date(new Date().getFullYear() + 1, 5, 15)
  );
  vacationGoal.addContribution(500);
  
  const emergencyFundGoal = new Goal(
    "goal2",
    "Emergency Fund",
    15000,
    "Emergency",
    undefined,
    "6 months of expenses"
  );
  emergencyFundGoal.addContribution(7500);
  
  user.addGoal(vacationGoal);
  user.addGoal(emergencyFundGoal);
  
  // Create sample transactions
  const transactions = [
    new Transaction("t1", 3000, "Monthly Salary", new Date(), TransactionType.INCOME, CategoryType.SALARY, checkingAccount.getName()),
    new Transaction("t2", 1000, "Rent Payment", new Date(), TransactionType.EXPENSE, CategoryType.HOUSING, checkingAccount.getName()),
    new Transaction("t3", 200, "Grocery Shopping", new Date(), TransactionType.EXPENSE, CategoryType.FOOD, checkingAccount.getName()),
    new Transaction("t4", 100, "Electric Bill", new Date(), TransactionType.EXPENSE, CategoryType.UTILITIES, checkingAccount.getName()),
    new Transaction("t5", 50, "Netflix Subscription", new Date(), TransactionType.EXPENSE, CategoryType.ENTERTAINMENT, checkingAccount.getName()),
    new Transaction("t6", 500, "Emergency Fund Contribution", new Date(), TransactionType.EXPENSE, CategoryType.EMERGENCY_FUND, savingsAccount.getName()),
    new Transaction("t7", 300, "Retirement Contribution", new Date(), TransactionType.EXPENSE, CategoryType.RETIREMENT, savingsAccount.getName()),
  ];
  
  // Process each transaction through the user's financial state
  transactions.forEach(transaction => {
    user.handleTransaction(transaction);
  });
  
  // Test budget strategies
  const budgetContext = new BudgetStrategyContext(new FiftyThirtyTwentyStrategy());
  console.log("\n50/30/20 Budget Strategy:");
  console.log(budgetContext.getStrategyName(), "-", budgetContext.getStrategyDescription());
  
  const fiftyThirtyTwentyBudget = budgetContext.calculateBudget(3000);
  console.log("\nBudget Allocation:");
  fiftyThirtyTwentyBudget.forEach((amount, category) => {
    console.log(`${category}: $${amount.toFixed(2)}`);
  });
  
  console.log("\nRecommendations:");
  const recommendations = budgetContext.getRecommendations(transactions);
  recommendations.forEach(rec => console.log(`- ${rec}`));
  
  // Switch strategy
  budgetContext.setStrategy(new ZeroBasedBudgetStrategy());
  console.log("\nZero-Based Budget Strategy:");
  console.log(budgetContext.getStrategyName(), "-", budgetContext.getStrategyDescription());
  
  // Generate reports
  console.log("\nGenerating Reports:");
  const incomeVsExpenseReport = reportingService.generateIncomeVsExpenseReport(transactions);
  console.log(`Report: ${incomeVsExpenseReport.title}`);
  console.log(`Description: ${incomeVsExpenseReport.description}`);
  console.log(`Income: $${incomeVsExpenseReport.data.summary.totalIncome.toFixed(2)}`);
  console.log(`Expenses: $${incomeVsExpenseReport.data.summary.totalExpenses.toFixed(2)}`);
  console.log(`Net Cashflow: $${incomeVsExpenseReport.data.summary.netCashflow.toFixed(2)}`);
  
  // Generate recommendations
  console.log("\nPersonalized Recommendations:");
  const personalizedRecs = recommendationEngine.generateRecommendations(user, transactions);
  personalizedRecs.forEach(rec => {
    console.log(`- ${rec.title}: ${rec.description}`);
    console.log(`  Priority: ${rec.priorityLevel}, Difficulty: ${rec.implementationDifficulty}`);
    if (rec.potentialSavings) {
      console.log(`  Potential Savings: $${rec.potentialSavings.toFixed(2)}`);
    }
    console.log();
  });
}

// Run the demo
runDemo();