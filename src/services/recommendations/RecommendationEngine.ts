import { ITransaction } from '../../core/interfaces/ITransaction';
import { IRecommendation } from '../../core/interfaces/IRecommendation';
import { User } from '../../core/models/User';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';

export class RecommendationEngine {
    public generateRecommendations(user: User, transactions: ITransaction[]): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Add spending recommendations
        recommendations.push(...this.analyzeSpending(transactions));
        
        // Add savings recommendations
        recommendations.push(...this.analyzeSavings(user, transactions));
        
        // Add investment recommendations
        recommendations.push(...this.analyzeInvestments(user, transactions));
        
        // Sort recommendations by priority
        return recommendations.sort((a, b) => a.priorityLevel - b.priorityLevel);
    }
    
    private analyzeSpending(transactions: ITransaction[]): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Group transactions by category
        const expensesByCategory = new Map<CategoryType, number>();
        
        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.EXPENSE) {
                const currentTotal = expensesByCategory.get(transaction.category) || 0;
                expensesByCategory.set(transaction.category, currentTotal + transaction.amount);
            }
        });
        
        // Find the highest spending categories
        const categoriesArray = Array.from(expensesByCategory.entries());
        categoriesArray.sort((a, b) => b[1] - a[1]);
        
        // Generate recommendations for the top spending categories
        const topCategories = categoriesArray.slice(0, 3);
        topCategories.forEach(([category, amount]) => {
            // Check if this category is a significant portion of spending
            const totalExpenses = categoriesArray.reduce((sum, entry) => sum + entry[1], 0);
            const percentageOfTotal = (amount / totalExpenses) * 100;
            
            if (percentageOfTotal > 25) {
                recommendations.push({
                    id: `spend-rec-${Date.now()}-${category}`,
                    title: `High Spending in ${category}`,
                    description: `You're spending ${percentageOfTotal.toFixed(1)}% of your expenses on ${category}. Consider setting a budget for this category.`,
                    priorityLevel: 1,
                    category: category.toString(),
                    potentialSavings: amount * 0.2, // Assume 20% potential savings
                    implementationDifficulty: 'MEDIUM',
                    isApplied: false,
                    dateGenerated: new Date(),
                    applyRecommendation: function(): void { this.isApplied = true; },
                    dismissRecommendation: function(): void { /* implementation */ }
                });
            }
        });
        
        // Look for frequent small transactions that might add up
        const smallTransactions = transactions.filter(t => 
            t.type === TransactionType.EXPENSE && t.amount < 20
        );
        
        const smallTransactionsTotal = smallTransactions.reduce((sum, t) => sum + t.amount, 0);
        if (smallTransactionsTotal > 100 && smallTransactions.length >= 5) {
            recommendations.push({
                id: `spend-rec-${Date.now()}-small`,
                title: 'Small Purchases Adding Up',
                description: `You've made ${smallTransactions.length} small purchases totaling $${smallTransactionsTotal.toFixed(2)}. These small expenses can add up quickly.`,
                priorityLevel: 2,
                category: 'General',
                potentialSavings: smallTransactionsTotal * 0.5,
                implementationDifficulty: 'EASY',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implementation */ }
            });
        }
        
        return recommendations;
    }
    
    private analyzeSavings(user: User, transactions: ITransaction[]): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Calculate total income and savings
        const totalIncome = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalSavings = transactions
            .filter(t => t.type === TransactionType.EXPENSE && 
                     [CategoryType.EMERGENCY_FUND, CategoryType.RETIREMENT, CategoryType.EDUCATION_SAVINGS].includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Check if the user is saving enough
        const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
        
        if (savingsRate < 10) {
            recommendations.push({
                id: `save-rec-${Date.now()}-rate`,
                title: 'Increase Your Savings Rate',
                description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 15-20% of your income.`,
                priorityLevel: 1,
                category: 'Savings',
                potentialSavings: (totalIncome * 0.15) - totalSavings,
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implementation */ }
            });
        }
        
        // Check for emergency fund
        const emergencyFundSavings = transactions
            .filter(t => t.category === CategoryType.EMERGENCY_FUND)
            .reduce((sum, t) => sum + t.amount, 0);
            
        if (emergencyFundSavings < totalIncome * 0.5) { // Check if emergency fund is less than 6 months of income
            recommendations.push({
                id: `save-rec-${Date.now()}-emergency`,
                title: 'Build Your Emergency Fund',
                description: 'Financial experts recommend having 3-6 months of expenses saved in an emergency fund.',
                priorityLevel: 2,
                category: 'Savings',
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implementation */ }
            });
        }
        
        return recommendations;
    }
    
    private analyzeInvestments(user: User, transactions: ITransaction[]): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Check for investment transactions
        const investmentTransactions = transactions.filter(t => 
            t.type === TransactionType.INVESTMENT || t.category === CategoryType.INVESTMENTS
        );
        
        if (investmentTransactions.length === 0) {
            recommendations.push({
                id: `invest-rec-${Date.now()}-start`,
                title: 'Start Investing',
                description: 'You don\'t have any recorded investments. Consider starting with index funds or ETFs for long-term wealth building.',
                priorityLevel: 2,
                category: 'Investments',
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implementation */ }
            });
        } else {
            // Check retirement savings
            const retirementSavings = transactions
                .filter(t => t.category === CategoryType.RETIREMENT)
                .reduce((sum, t) => sum + t.amount, 0);
                
            const totalIncome = transactions
                .filter(t => t.type === TransactionType.INCOME)
                .reduce((sum, t) => sum + t.amount, 0);
                
            if (retirementSavings < totalIncome * 0.1) {
                recommendations.push({
                    id: `invest-rec-${Date.now()}-retirement`,
                    title: 'Increase Retirement Savings',
                    description: 'Financial experts recommend saving at least 15% of your income for retirement.',
                    priorityLevel: 1,
                    category: 'Investments',
                    implementationDifficulty: 'MEDIUM',
                    isApplied: false,
                    dateGenerated: new Date(),
                    applyRecommendation: function(): void { this.isApplied = true; },
                    dismissRecommendation: function(): void { /* implementation */ }
                });
            }
        }
        
        return recommendations;
    }
}
