import { Command } from 'commander';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import * as figlet from 'figlet';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../core/models/User';
import { BudgetingState } from '../../patterns/state/BudgetingState';
import { Transaction } from '../../core/models/Transaction';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';
import { IndividualAccount } from '../../patterns/composite/FinancialComponent';
import { Goal } from '../../core/models/Goal';
import { ReportingService } from '../../services/reporting/ReportingService';
import { BudgetStrategyContext } from '../../patterns/strategy/BudgetStrategyContext';
import { ZeroBasedBudgetStrategy } from '../../services/budget/ZeroBasedBudgetStrategy';
import { FiftyThirtyTwentyStrategy } from '../../services/budget/FiftyThirtyTwentyStrategy';
import { TransactionCategorizationService } from '../../services/categorization/TransactionCategorizationService';
import { RecommendationEngine } from '../../services/recommendations/RecommendationEngine';

// Display ASCII art title
console.log(
  chalk.blue(
    figlet.textSync('Capacitor Finance', { horizontalLayout: 'full' })
  )
);

console.log(chalk.yellow('Personal Finance Management System with AI Recommendations'));
console.log(chalk.dim('Use the commands below to manage your finances\n'));

// Initialize CLI application
const program = new Command();
program.version('1.0.0');

// Create user command
program
  .command('create-user')
  .description('Create a new user')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter your name:',
        validate: input => input ? true : 'Name is required'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: input => /\S+@\S+\.\S+/.test(input) ? true : 'Please enter a valid email address'
      }
    ]);
    
    console.log(chalk.green(`User created: ${answers.name} (${answers.email})`));
    // In a real app, we would save the user to a database
  });

// Initialize services
const reportingService = new ReportingService();
const categorizationService = new TransactionCategorizationService();
const recommendationEngine = new RecommendationEngine();

// Set up the CLI application state
let currentUser: User | null = null;
let transactions: Transaction[] = [];
const budgetContext = new BudgetStrategyContext(new FiftyThirtyTwentyStrategy());

// Command to create a new user
program
  .command('create-user')
  .description('Create a new user profile')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter your name:',
        validate: (input) => input.length > 0 ? true : 'Name is required'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input) => /\S+@\S+\.\S+/.test(input) ? true : 'Please enter a valid email'
      }
    ]);

    const initialState = new BudgetingState();
    currentUser = new User(uuidv4(), answers.name, answers.email, initialState);
    
    console.log(chalk.green(`User created successfully: ${currentUser.getName()} (${currentUser.getEmail()})`));
  });

// Command to add an account
program
  .command('add-account')
  .description('Add a new financial account')
  .action(async () => {
    if (!currentUser) {
      console.log(chalk.red('Please create a user first with the "create-user" command'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter account name:',
        validate: (input) => input.length > 0 ? true : 'Account name is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Select account type:',
        choices: ['Checking', 'Savings', 'Investment', 'Credit Card', 'Retirement']
      },
      {
        type: 'number',
        name: 'balance',
        message: 'Enter current balance:',
        default: 0,
        validate: (input) => !isNaN(input) ? true : 'Please enter a valid number'
      }
    ]);

    const account = new IndividualAccount(answers.name, answers.balance, answers.type);
    currentUser.addAccount(account);
    
    console.log(chalk.green(`Account added: ${answers.name} (${answers.type}) with balance $${answers.balance}`));
  });

// Command to add a transaction
program
  .command('add-transaction')
  .description('Add a new transaction')
  .action(async () => {
    if (!currentUser) {
      console.log(chalk.red('Please create a user first with the "create-user" command'));
      return;
    }

    const accounts = currentUser.getAccounts();
    if (accounts.length === 0) {
      console.log(chalk.red('Please add an account first with the "add-account" command'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select transaction type:',
        choices: Object.values(TransactionType)
      },
      {
        type: 'list',
        name: 'accountId',
        message: 'Select account:',
        choices: accounts.map(account => account.getName())
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Enter amount:',
        validate: (input) => !isNaN(input) && input > 0 ? true : 'Please enter a valid positive number'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter description:',
        validate: (input) => input.length > 0 ? true : 'Description is required'
      },
      {
        type: 'list',
        name: 'category',
        message: 'Select category:',
        choices: Object.values(CategoryType)
      }
    ]);

    const transaction = new Transaction(
      uuidv4(),
      answers.amount,
      answers.description,
      new Date(),
      answers.type as TransactionType,
      answers.category as CategoryType,
      answers.accountId
    );

    transactions.push(transaction);
    currentUser.handleTransaction(transaction);

    // Update account balance
    const account = accounts.find(a => a.getName() === answers.accountId) as IndividualAccount;
    if (answers.type === TransactionType.INCOME || answers.type === TransactionType.DEPOSIT) {
      account.deposit(answers.amount);
    } else if (answers.type === TransactionType.EXPENSE || answers.type === TransactionType.WITHDRAWAL) {
      account.withdraw(answers.amount);
    }

    console.log(chalk.green(`Transaction added: $${answers.amount} - ${answers.description}`));
  });

// Command to view account summary
program
  .command('summary')
  .description('View account summary')
  .action(() => {
    if (!currentUser) {
      console.log(chalk.red('Please create a user first with the "create-user" command'));
      return;
    }

    console.log(chalk.blue.bold('\nAccount Summary'));
    console.log(chalk.blue('=============='));
    
    const accounts = currentUser.getAccounts();
    accounts.forEach(account => {
      console.log(`${account.getName()}: ${chalk.green('$' + account.getBalance().toFixed(2))}`);
    });
    
    console.log(chalk.blue('\nTotal Balance:'), chalk.green('$' + currentUser.getTotalBalance().toFixed(2)));
  });

// Command to view income vs expense report
program
  .command('report')
  .description('Generate income vs expense report')
  .action(() => {
    if (!currentUser || transactions.length === 0) {
      console.log(chalk.red('Please create a user and add some transactions first'));
      return;
    }

    const report = reportingService.generateIncomeVsExpenseReport(transactions);
    
    console.log(chalk.blue.bold('\nIncome vs Expense Report'));
    console.log(chalk.blue('====================='));
    console.log(`Total Income: ${chalk.green('$' + report.data.summary.totalIncome.toFixed(2))}`);
    console.log(`Total Expenses: ${chalk.red('$' + report.data.summary.totalExpenses.toFixed(2))}`);
    console.log(`Net Cashflow: ${report.data.summary.netCashflow >= 0 ? 
      chalk.green('$' + report.data.summary.netCashflow.toFixed(2)) : 
      chalk.red('$' + report.data.summary.netCashflow.toFixed(2))}`);
    console.log(`Savings Rate: ${chalk.yellow(report.data.summary.savingsRate.toFixed(1) + '%')}`);

    // Show monthly breakdown
    console.log(chalk.blue.bold('\nMonthly Breakdown'));
    console.log(chalk.blue('================'));
    
    report.data.monthly.forEach((month: any) => {
      console.log(`${chalk.yellow(month.month)}:`);
      console.log(`  Income: ${chalk.green('$' + month.income.toFixed(2))}`);
      console.log(`  Expenses: ${chalk.red('$' + month.expenses.toFixed(2))}`);
      console.log(`  Savings: ${month.savings >= 0 ? 
        chalk.green('$' + month.savings.toFixed(2)) : 
        chalk.red('$' + month.savings.toFixed(2))}`);
    });
  });

// Command to view recommendations
program
  .command('recommendations')
  .description('View personalized financial recommendations')
  .action(() => {
    if (!currentUser || transactions.length === 0) {
      console.log(chalk.red('Please create a user and add some transactions first'));
      return;
    }

    const recommendations = recommendationEngine.generateRecommendations(currentUser, transactions);
    
    console.log(chalk.blue.bold('\nPersonalized Recommendations'));
    console.log(chalk.blue('=========================='));
    
    if (recommendations.length === 0) {
      console.log(chalk.yellow('No recommendations available at this time.'));
    } else {
      recommendations.forEach((rec, index) => {
        console.log(chalk.yellow(`\n${index + 1}. ${rec.title}`));
        console.log(`   ${rec.description}`);
        console.log(`   Priority: ${chalk.red('★').repeat(rec.priorityLevel)}`);
        console.log(`   Difficulty: ${rec.implementationDifficulty}`);
        if (rec.potentialSavings) {
          console.log(`   Potential Savings: ${chalk.green('$' + rec.potentialSavings.toFixed(2))}`);
        }
      });
    }
  });

// Command to switch budget strategy
program
  .command('switch-strategy')
  .description('Switch budget strategy')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'strategy',
        message: 'Select budget strategy:',
        choices: [
          { name: '50/30/20 Budget Rule', value: 'fifty-thirty-twenty' },
          { name: 'Zero-Based Budgeting', value: 'zero-based' }
        ]
      }
    ]);

    if (answers.strategy === 'fifty-thirty-twenty') {
      budgetContext.setStrategy(new FiftyThirtyTwentyStrategy());
    } else {
      budgetContext.setStrategy(new ZeroBasedBudgetStrategy());
    }

    console.log(chalk.green(`Budget strategy switched to ${budgetContext.getStrategyName()}`));
    console.log(chalk.dim(budgetContext.getStrategyDescription()));
  });

// Command to run a demonstration
program
  .command('demo')
  .description('Run a demonstration with sample data')
  .action(() => {
    const initialState = new BudgetingState();
    currentUser = new User(uuidv4(), "John Doe", "john@example.com", initialState);
    
    // Add accounts
    const checkingAccount = new IndividualAccount("Checking", 2500, "Checking");
    const savingsAccount = new IndividualAccount("Savings", 10000, "Savings");
    currentUser.addAccount(checkingAccount);
    currentUser.addAccount(savingsAccount);
    
    // Add goals
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
    
    currentUser.addGoal(vacationGoal);
    currentUser.addGoal(emergencyFundGoal);
    
    // Create sample transactions
    transactions = [
      new Transaction(uuidv4(), 3000, "Monthly Salary", new Date(), TransactionType.INCOME, CategoryType.SALARY, checkingAccount.getName()),
      new Transaction(uuidv4(), 1000, "Rent Payment", new Date(), TransactionType.EXPENSE, CategoryType.HOUSING, checkingAccount.getName()),
      new Transaction(uuidv4(), 200, "Grocery Shopping", new Date(), TransactionType.EXPENSE, CategoryType.FOOD, checkingAccount.getName()),
      new Transaction(uuidv4(), 100, "Electric Bill", new Date(), TransactionType.EXPENSE, CategoryType.UTILITIES, checkingAccount.getName()),
      new Transaction(uuidv4(), 50, "Netflix Subscription", new Date(), TransactionType.EXPENSE, CategoryType.ENTERTAINMENT, checkingAccount.getName()),
      new Transaction(uuidv4(), 500, "Emergency Fund Contribution", new Date(), TransactionType.EXPENSE, CategoryType.EMERGENCY_FUND, savingsAccount.getName()),
      new Transaction(uuidv4(), 300, "Retirement Contribution", new Date(), TransactionType.EXPENSE, CategoryType.RETIREMENT, savingsAccount.getName()),
    ];
    
    // Process transactions
    transactions.forEach(transaction => {
      currentUser!.handleTransaction(transaction);
    });

    console.log(chalk.green('Demo data loaded successfully!'));
    console.log(chalk.yellow('Try running "summary", "report", or "recommendations" to see the results'));
  });

// Help command
program
  .command('help')
  .description('Display help information')
  .action(() => {
    program.outputHelp();
  });

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length === 2) {
  console.log(chalk.yellow('Type a command to get started, or "help" to see available commands'));
}
