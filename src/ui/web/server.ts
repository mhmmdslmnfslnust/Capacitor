import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import { User } from '../../core/models/User';
import { BudgetingState } from '../../patterns/state/BudgetingState';
import { Transaction } from '../../core/models/Transaction';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';
import { IndividualAccount, AccountGroup } from '../../patterns/composite/FinancialComponent';
import { Goal } from '../../core/models/Goal';
import { ReportingService } from '../../services/reporting/ReportingService';
import { TransactionCategorizationService } from '../../services/categorization/TransactionCategorizationService';
import { RecommendationEngine } from '../../services/recommendations/RecommendationEngine';
import { BudgetStrategyContext } from '../../patterns/strategy/BudgetStrategyContext';
import { FiftyThirtyTwentyStrategy } from '../../services/budget/FiftyThirtyTwentyStrategy';
import { ZeroBasedBudgetStrategy } from '../../services/budget/ZeroBasedBudgetStrategy';

// Initialize application
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const reportingService = new ReportingService();
const categorizationService = new TransactionCategorizationService();
const recommendationEngine = new RecommendationEngine();

// In-memory data store (in a real app, this would be a database)
const usersMap = new Map<string, User>();
const transactionsMap = new Map<string, Transaction[]>();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup API routes
// Get all users
app.get('/api/users', (req: Request, res: Response) => {
  const users = Array.from(usersMap.values()).map(user => ({
    id: user.getId(),
    name: user.getName(),
    email: user.getEmail(),
    totalBalance: user.getTotalBalance()
  }));
  
  res.json(users);
});

// Create user
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const userId = uuidv4();
  const initialState = new BudgetingState();
  const user = new User(userId, name, email, initialState);
  
  usersMap.set(userId, user);
  transactionsMap.set(userId, []);
  
  res.status(201).json({
    id: user.getId(),
    name: user.getName(),
    email: user.getEmail()
  });
});

// Get user by ID
app.get('/api/users/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.getId(),
    name: user.getName(),
    email: user.getEmail(),
    totalBalance: user.getTotalBalance()
  });
});

// Get user accounts
app.get('/api/users/:userId/accounts', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const accounts = user.getAccounts().map(account => {
    const result: any = {
      name: account.getName(),
      balance: account.getBalance(),
    };
    
    // If it's an account group, include the child accounts
    if (account instanceof AccountGroup) {
      result.type = 'group';
      result.accounts = account.getAccounts?.().map(childAccount => ({
        name: childAccount.getName(),
        balance: childAccount.getBalance()
      }));
    } else if (account instanceof IndividualAccount) {
      result.type = account.getAccountType();
    }
    
    return result;
  });
  
  res.json(accounts);
});

// Add account to user
app.post('/api/users/:userId/accounts', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, accountType, initialBalance } = req.body;
  
  if (!name || !accountType) {
    return res.status(400).json({ error: 'Name and account type are required' });
  }
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const balance = initialBalance || 0;
  const account = new IndividualAccount(name, balance, accountType);
  user.addAccount(account);
  
  res.status(201).json({
    name: account.getName(),
    balance: account.getBalance(),
    type: account.getAccountType()
  });
});

// Get user transactions
app.get('/api/users/:userId/transactions', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const transactions = transactionsMap.get(userId) || [];
  
  res.json(transactions);
});

// Add transaction
app.post('/api/users/:userId/transactions', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { amount, description, type, category, accountId, date } = req.body;
  
  if (!amount || !description || !type || !category || !accountId) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const accounts = user.getAccounts();
  const account = accounts.find(a => a.getName() === accountId);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  const transaction = new Transaction(
    uuidv4(),
    amount,
    description,
    date ? new Date(date) : new Date(),
    type as TransactionType,
    category as CategoryType,
    accountId
  );
  
  // Add to transactions list
  const userTransactions = transactionsMap.get(userId) || [];
  userTransactions.push(transaction);
  transactionsMap.set(userId, userTransactions);
  
  // Handle the transaction in user's financial state
  user.handleTransaction(transaction);
  
  // Update account balance - need to handle error cases properly
  if (account instanceof IndividualAccount) {
    if (type === TransactionType.INCOME || type === TransactionType.DEPOSIT) {
      account.deposit(amount);
    } else if (type === TransactionType.EXPENSE || type === TransactionType.WITHDRAWAL) {
      // Make sure there are sufficient funds
      if (!account.withdraw(amount)) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
    }
  }
  
  res.status(201).json(transaction);
});

// Get user reports
app.get('/api/users/:userId/reports/:reportType', (req: Request, res: Response) => {
  const { userId, reportType } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const transactions = transactionsMap.get(userId) || [];
  
  let report;
  switch (reportType) {
    case 'income-expense':
      report = reportingService.generateIncomeVsExpenseReport(transactions);
      break;
    case 'expenses-by-category':
      report = reportingService.generateExpensesByCategoryReport(transactions);
      break;
    case 'savings-goals':
      report = reportingService.generateSavingsGoalsReport(user);
      break;
    case 'net-worth':
      report = reportingService.generateNetWorthReport(user);
      break;
    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }
  
  res.json(report);
});

// Get recommendations
app.get('/api/users/:userId/recommendations', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const transactions = transactionsMap.get(userId) || [];
  const recommendations = recommendationEngine.generateRecommendations(user, transactions);
  
  res.json(recommendations);
});

// Create a budget
app.post('/api/users/:userId/budgets', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { strategyType, income } = req.body;
  
  if (!strategyType || !income) {
    return res.status(400).json({ error: 'Strategy type and income are required' });
  }
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  let budgetStrategy;
  switch (strategyType) {
    case 'fifty-thirty-twenty':
      budgetStrategy = new FiftyThirtyTwentyStrategy();
      break;
    case 'zero-based':
      budgetStrategy = new ZeroBasedBudgetStrategy();
      break;
    default:
      return res.status(400).json({ error: 'Invalid budget strategy type' });
  }
  
  const budgetContext = new BudgetStrategyContext(budgetStrategy);
  const budget = budgetContext.calculateBudget(income);
  
  // Convert budget Map to object for JSON response
  const budgetObject: any = {
    strategyName: budgetContext.getStrategyName(),
    strategyDescription: budgetContext.getStrategyDescription(),
    categories: {}
  };
  
  budget.forEach((amount, category) => {
    budgetObject.categories[category] = amount;
  });
  
  res.json(budgetObject);
});

// Add endpoint for goals (missing in original)
app.get('/api/users/:userId/goals', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const goals = user.getGoals().map(goal => ({
    id: goal.getId(),
    name: goal.getName(),
    category: goal.getCategory(),
    targetAmount: goal.getTargetAmount(),
    currentAmount: goal.getCurrentAmount(),
    progress: goal.getProgress(),
    status: goal.getStatus(),
    deadline: goal.getDeadline(),
    description: goal.getDescription()
  }));
  
  res.json(goals);
});

// Add endpoint to create goals
app.post('/api/users/:userId/goals', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, category, targetAmount, deadline, description } = req.body;
  
  if (!name || !category || !targetAmount) {
    return res.status(400).json({ error: 'Name, category, and target amount are required' });
  }
  
  const user = usersMap.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const goalId = uuidv4();
  const deadlineDate = deadline ? new Date(deadline) : undefined;
  
  const goal = new Goal(goalId, name, targetAmount, category, deadlineDate, description);
  
  user.addGoal(goal);
  
  res.status(201).json({
    id: goal.getId(),
    name: goal.getName(),
    category: goal.getCategory(),
    targetAmount: goal.getTargetAmount(),
    currentAmount: goal.getCurrentAmount(),
    progress: goal.getProgress(),
    status: goal.getStatus()
  });
});

// Serve the frontend app for all other routes
app.get('*', (req: Request, res: Response) => {
  // Check if the file exists to prevent errors
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
