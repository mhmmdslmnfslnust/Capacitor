import { IBudgetStrategy } from '../../core/interfaces/IBudgetStrategy';
import { CategoryType } from '../../core/enums/CategoryType';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { TransactionType } from '../../core/enums/TransactionType';

export class ZeroBasedBudgetStrategy implements IBudgetStrategy {
    name: string = 'Zero-Based Budgeting';
    description: string = 'A method of budgeting where all expenses must be justified for each new period. Income - Expenses = 0';
    
    calculateBudget(income: number): Map<CategoryType, number> {
        const budget = new Map<CategoryType, number>();
        
        // Zero-based budgeting assigns every dollar a job
        // These are example allocations; in a real system, this would be configurable
        budget.set(CategoryType.HOUSING, income * 0.30);
        budget.set(CategoryType.FOOD, income * 0.15);
        budget.set(CategoryType.TRANSPORTATION, income * 0.10);
        budget.set(CategoryType.UTILITIES, income * 0.05);
        budget.set(CategoryType.HEALTHCARE, income * 0.05);
        budget.set(CategoryType.ENTERTAINMENT, income * 0.05);
        budget.set(CategoryType.PERSONAL_CARE, income * 0.05);
        budget.set(CategoryType.EMERGENCY_FUND, income * 0.10);
        budget.set(CategoryType.RETIREMENT, income * 0.10);
        budget.set(CategoryType.OTHER, income * 0.05);
        
        return budget;
    }
    
    getRecommendations(transactions: ITransaction[]): string[] {
        const recommendations: string[] = [];
        const categorySums = new Map<CategoryType, number>();
        
        // Calculate the sum of expenses by category
        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.EXPENSE) {
                const currentSum = categorySums.get(transaction.category) || 0;
                categorySums.set(transaction.category, currentSum + transaction.amount);
            }
        });
        
        // Calculate total income
        const totalIncome = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
            
        // Get the ideal budget
        const idealBudget = this.calculateBudget(totalIncome);
        
        // Compare actual spending with budget
        idealBudget.forEach((budgetAmount, category) => {
            const actualSpending = categorySums.get(category) || 0;
            if (actualSpending > budgetAmount) {
                recommendations.push(`You've spent ${actualSpending - budgetAmount} more than allocated for ${category}. Consider cutting back.`);
            } else if (actualSpending < budgetAmount * 0.8) {
                recommendations.push(`You've only used ${actualSpending} of your ${budgetAmount} budget for ${category}. Consider reallocating.`);
            }
        });
        
        return recommendations;
    }
}
