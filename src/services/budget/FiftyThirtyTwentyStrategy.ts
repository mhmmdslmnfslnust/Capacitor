import { IBudgetStrategy } from '../../core/interfaces/IBudgetStrategy';
import { CategoryType } from '../../core/enums/CategoryType';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { TransactionType } from '../../core/enums/TransactionType';

export class FiftyThirtyTwentyStrategy implements IBudgetStrategy {
    name: string = '50/30/20 Rule';
    description: string = 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.';
    
    calculateBudget(income: number): Map<CategoryType, number> {
        const budget = new Map<CategoryType, number>();
        
        // 50% to needs
        const needs = income * 0.5;
        budget.set(CategoryType.HOUSING, needs * 0.5);          // 25% of total
        budget.set(CategoryType.FOOD, needs * 0.2);            // 10% of total
        budget.set(CategoryType.TRANSPORTATION, needs * 0.15);  // 7.5% of total
        budget.set(CategoryType.UTILITIES, needs * 0.1);        // 5% of total
        budget.set(CategoryType.HEALTHCARE, needs * 0.05);      // 2.5% of total
        
        // 30% to wants
        const wants = income * 0.3;
        budget.set(CategoryType.ENTERTAINMENT, wants * 0.4);    // 12% of total
        budget.set(CategoryType.DINING_OUT, wants * 0.3);       // 9% of total
        budget.set(CategoryType.SHOPPING, wants * 0.2);         // 6% of total
        budget.set(CategoryType.TRAVEL, wants * 0.1);           // 3% of total
        
        // 20% to savings and debt
        const savings = income * 0.2;
        budget.set(CategoryType.EMERGENCY_FUND, savings * 0.4); // 8% of total
        budget.set(CategoryType.RETIREMENT, savings * 0.6);     // 12% of total
        
        return budget;
    }
    
    getRecommendations(transactions: ITransaction[]): string[] {
        const recommendations: string[] = [];
        
        // Group expenses into needs, wants, and savings
        let totalNeeds = 0;
        let totalWants = 0;
        let totalSavings = 0;
        let totalIncome = 0;
        
        // Define which categories belong to each group
        const needsCategories = [
            CategoryType.HOUSING, CategoryType.FOOD, CategoryType.TRANSPORTATION, 
            CategoryType.UTILITIES, CategoryType.HEALTHCARE
        ];
        
        const wantsCategories = [
            CategoryType.ENTERTAINMENT, CategoryType.DINING_OUT, 
            CategoryType.SHOPPING, CategoryType.TRAVEL, CategoryType.PERSONAL_CARE
        ];
        
        const savingsCategories = [
            CategoryType.EMERGENCY_FUND, CategoryType.RETIREMENT, CategoryType.VACATION, 
            CategoryType.EDUCATION_SAVINGS
        ];
        
        // Calculate sums
        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.INCOME) {
                totalIncome += transaction.amount;
            } else if (transaction.type === TransactionType.EXPENSE) {
                if (needsCategories.includes(transaction.category)) {
                    totalNeeds += transaction.amount;
                } else if (wantsCategories.includes(transaction.category)) {
                    totalWants += transaction.amount;
                } else if (savingsCategories.includes(transaction.category)) {
                    totalSavings += transaction.amount;
                }
            }
        });
        
        // Check if spending ratios align with the 50/30/20 rule
        if (totalIncome > 0) {
            const needsRatio = totalNeeds / totalIncome;
            const wantsRatio = totalWants / totalIncome;
            const savingsRatio = totalSavings / totalIncome;
            
            if (needsRatio > 0.5) {
                recommendations.push(`You're spending ${Math.round(needsRatio * 100)}% on needs, which is above the recommended 50%. Consider reducing housing or other essential expenses if possible.`);
            }
            
            if (wantsRatio > 0.3) {
                recommendations.push(`You're spending ${Math.round(wantsRatio * 100)}% on wants, which is above the recommended 30%. Look for areas to cut back on discretionary spending.`);
            }
            
            if (savingsRatio < 0.2) {
                recommendations.push(`You're only saving ${Math.round(savingsRatio * 100)}% of your income, which is below the recommended 20%. Try to increase contributions to savings or retirement accounts.`);
            }
        }
        
        return recommendations;
    }
}
