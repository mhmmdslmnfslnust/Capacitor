import { ITransaction } from '../../core/interfaces/ITransaction';
import { User } from '../../core/models/User';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';

export interface Report {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    data: any;
    chartType?: 'pie' | 'bar' | 'line';
}

export class ReportingService {
    public generateIncomeVsExpenseReport(transactions: ITransaction[]): Report {
        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        
        const monthlySeries = this.generateMonthlySeries(transactions);
        
        return {
            id: `report-income-expense-${Date.now()}`,
            title: 'Income vs Expenses',
            description: `Your savings rate is ${savingsRate.toFixed(1)}%`,
            createdAt: new Date(),
            data: {
                summary: {
                    totalIncome: income,
                    totalExpenses: expenses,
                    netCashflow: income - expenses,
                    savingsRate: savingsRate
                },
                monthly: monthlySeries,
            },
            chartType: 'bar'
        };
    }
    
    public generateExpensesByCategoryReport(transactions: ITransaction[]): Report {
        const expensesByCategory = new Map<CategoryType, number>();
        
        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.EXPENSE) {
                const currentTotal = expensesByCategory.get(transaction.category) || 0;
                expensesByCategory.set(transaction.category, currentTotal + transaction.amount);
            }
        });
        
        const totalExpenses = Array.from(expensesByCategory.values()).reduce((sum, amount) => sum + amount, 0);
        
        const categoriesData = Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
            category: category.toString(),
            amount: amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }));
        
        categoriesData.sort((a, b) => b.amount - a.amount);
        
        return {
            id: `report-expenses-category-${Date.now()}`,
            title: 'Expenses by Category',
            description: 'Breakdown of your expenses by category',
            createdAt: new Date(),
            data: {
                totalExpenses: totalExpenses,
                categories: categoriesData
            },
            chartType: 'pie'
        };
    }
    
    public generateSavingsGoalsReport(user: User): Report {
        const goals = user.getGoals();
        
        const goalsData = goals.map(goal => ({
            name: goal.getName(),
            target: goal.getTargetAmount(),
            current: goal.getCurrentAmount(),
            progress: goal.getProgress(),
            status: goal.getStatus(),
            deadline: goal.getDeadline()
        }));
        
        return {
            id: `report-savings-goals-${Date.now()}`,
            title: 'Savings Goals Progress',
            description: 'Track the progress of your financial goals',
            createdAt: new Date(),
            data: goalsData,
            chartType: 'bar'
        };
    }
    
    public generateNetWorthReport(user: User): Report {
        const accounts = user.getAccounts();
        const totalBalance = user.getTotalBalance();
        
        const accountsData = accounts.map(account => ({
            name: account.getName(),
            balance: account.getBalance(),
            percentage: totalBalance > 0 ? (account.getBalance() / totalBalance) * 100 : 0
        }));
        
        return {
            id: `report-net-worth-${Date.now()}`,
            title: 'Net Worth',
            description: 'Summary of your assets across all accounts',
            createdAt: new Date(),
            data: {
                totalNetWorth: totalBalance,
                accounts: accountsData
            },
            chartType: 'pie'
        };
    }
    
    private generateMonthlySeries(transactions: ITransaction[]): any[] {
        const monthlySeries: any[] = [];
        
        // Group transactions by month
        const monthlyData = new Map<string, { income: number, expenses: number }>();
        
        transactions.forEach(transaction => {
            const date = transaction.date;
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            const monthData = monthlyData.get(monthKey) || { income: 0, expenses: 0 };
            
            if (transaction.type === TransactionType.INCOME) {
                monthData.income += transaction.amount;
            } else if (transaction.type === TransactionType.EXPENSE) {
                monthData.expenses += transaction.amount;
            }
            
            monthlyData.set(monthKey, monthData);
        });
        
        // Convert to array and sort by date
        Array.from(monthlyData.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([monthKey, data]) => {
                const [year, month] = monthKey.split('-').map(Number);
                monthlySeries.push({
                    month: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    income: data.income,
                    expenses: data.expenses,
                    savings: data.income - data.expenses
                });
            });
        
        return monthlySeries;
    }
}
