import { FinancialState } from './FinancialState';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { IRecommendation } from '../../core/interfaces/IRecommendation';
import { User } from '../../core/models/User';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';
import { BudgetingState } from './BudgetingState';
import { InvestmentState } from './InvestmentState';

/**
 * SavingsState represents a financial state focused on building savings and emergency funds
 * This state provides recommendations tailored to users who are actively trying to save money
 */
export class SavingsState extends FinancialState {
    private savingsGoals: Map<string, number> = new Map();
    private totalSaved: number = 0;
    private savingsStreak: number = 0;
    
    constructor() {
        super('Savings Mode');
    }
    
    public handleTransaction(transaction: ITransaction): void {
        // Track savings transactions to understand user's saving behaviors
        if (transaction.type === TransactionType.EXPENSE) {
            if ([CategoryType.EMERGENCY_FUND, CategoryType.RETIREMENT, 
                 CategoryType.VACATION, CategoryType.EDUCATION_SAVINGS].includes(transaction.category)) {
                // Record savings contribution
                const currentAmount = this.savingsGoals.get(transaction.category.toString()) || 0;
                this.savingsGoals.set(transaction.category.toString(), currentAmount + transaction.amount);
                this.totalSaved += transaction.amount;
                this.savingsStreak++;
            } else {
                // Reset savings streak if spending on non-savings categories
                this.savingsStreak = 0;
            }
        }
        
        // If the user has a lot of spending transactions, consider transitioning to budgeting state
        if (this.savingsStreak < 0 && this.context) {
            this.context.transitionTo(new BudgetingState());
            console.log('Transitioning to Budgeting State due to increased spending');
        }
        
        // If the user has significant investments, consider transitioning to investment state
        if (transaction.type === TransactionType.INVESTMENT && transaction.amount > 1000 && this.context) {
            this.context.transitionTo(new InvestmentState());
            console.log('Transitioning to Investment State due to significant investment activity');
        }
    }
    
    public generateRecommendations(user: User): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Check if emergency fund exists and is sufficiently funded
        const emergencyFund = this.savingsGoals.get(CategoryType.EMERGENCY_FUND.toString()) || 0;
        const totalBalance = user.getTotalBalance();
        
        // Recommendation for emergency fund (if less than 3 months of estimated expenses)
        if (emergencyFund < totalBalance * 0.25) {
            recommendations.push({
                id: `savings-rec-${Date.now()}-emergency`,
                title: 'Build Your Emergency Fund',
                description: 'Aim to save 3-6 months of expenses in your emergency fund.',
                priorityLevel: 1,
                category: 'Savings',
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implement logic */ }
            });
        }
        
        // Recommendation for high-yield savings accounts
        recommendations.push({
            id: `savings-rec-${Date.now()}-highyield`,
            title: 'Consider a High-Yield Savings Account',
            description: 'Move your savings to a high-yield savings account to earn more interest.',
            priorityLevel: 2,
            category: 'Savings',
            implementationDifficulty: 'EASY',
            isApplied: false,
            dateGenerated: new Date(),
            applyRecommendation: function(): void { this.isApplied = true; },
            dismissRecommendation: function(): void { /* implement logic */ }
        });
        
        // Recommendation for retirement savings
        const retirementSavings = this.savingsGoals.get(CategoryType.RETIREMENT.toString()) || 0;
        if (retirementSavings < this.totalSaved * 0.15) {
            recommendations.push({
                id: `savings-rec-${Date.now()}-retirement`,
                title: 'Increase Retirement Savings',
                description: 'Consider allocating more of your savings to retirement accounts for tax advantages and long-term growth.',
                priorityLevel: 2,
                category: 'Retirement',
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implement logic */ }
            });
        }
        
        // As user becomes more financially secure, suggest investments
        if (this.totalSaved > 10000) {
            recommendations.push({
                id: `savings-rec-${Date.now()}-invest`,
                title: 'Consider Starting to Invest',
                description: 'With your solid savings foundation, you might consider investing some of your savings for potentially higher returns.',
                priorityLevel: 3,
                category: 'Investments',
                implementationDifficulty: 'HARD',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implement logic */ }
            });
        }
        
        return recommendations;
    }
    
    public getStateSpecificReports(): any[] {
        // Reports specific to savings-focused users
        return [
            {
                title: 'Savings Goals Progress',
                description: 'Track progress towards your savings goals',
                data: Object.fromEntries(this.savingsGoals)
            },
            {
                title: 'Savings Rate Over Time',
                description: 'View how your savings rate has changed over time',
                data: {
                    currentSavingsRate: `${(Math.random() * 25).toFixed(1)}%`, // Mock data
                    historicalRates: [/* Would contain historical savings rate data */]
                }
            },
            {
                title: 'Interest Earned Report',
                description: 'Summary of interest earned on savings accounts',
                data: {
                    totalInterest: (Math.random() * 200).toFixed(2), // Mock data
                    projectedAnnualInterest: (Math.random() * 500).toFixed(2) // Mock data
                }
            }
        ];
    }
}
