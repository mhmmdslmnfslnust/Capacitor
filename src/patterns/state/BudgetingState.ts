import { FinancialState } from './FinancialState';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { IRecommendation } from '../../core/interfaces/IRecommendation';
import { User } from '../../core/models/User';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';

export class BudgetingState extends FinancialState {
    private overBudgetCategories: Map<CategoryType, number> = new Map();
    private transactionCount: number = 0;
    
    constructor() {
        super('Budgeting Mode');
    }
    
    public handleTransaction(transaction: ITransaction): void {
        this.transactionCount++;
        
        if (transaction.type === TransactionType.EXPENSE) {
            // Track categories that are over budget
            // In a real system, we'd compare against actual budget allocations
            const currentOverAmount = this.overBudgetCategories.get(transaction.category) || 0;
            this.overBudgetCategories.set(transaction.category, currentOverAmount + transaction.amount);
            
            // Check if we're consistently saving
            if (this.transactionCount >= 10 && this.isSavingConsistently()) {
                // Transition to savings mode if appropriate
                if (this.context) {
                    // Import would create circular dependency, so we'd need a factory or DI in real system
                    // this.context.transitionTo(new SavingsState());
                    console.log('Should transition to Savings State because user is consistently saving');
                }
            }
        }
    }
    
    public generateRecommendations(user: User): IRecommendation[] {
        // In a real system, we would analyze the user's transaction history,
        // compare to budget allocations, and generate personalized recommendations
        
        const recommendations: IRecommendation[] = [];
        
        // Example recommendation based on over-budget categories
        this.overBudgetCategories.forEach((amount, category) => {
            recommendations.push({
                id: `budget-rec-${Date.now()}-${category}`,
                title: `Reduce spending in ${category}`,
                description: `You're over budget in ${category} by $${amount.toFixed(2)}. Consider reducing spending in this category.`,
                priorityLevel: amount > 100 ? 1 : 2,
                category: category.toString(),
                potentialSavings: amount,
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implement logic */ }
            });
        });
        
        // Example general recommendations for budgeting state
        recommendations.push({
            id: `budget-rec-${Date.now()}-general`,
            title: 'Consider zero-based budgeting',
            description: 'Zero-based budgeting can help you allocate every dollar of your income and ensure you\'re not overspending.',
            priorityLevel: 3,
            category: 'General',
            implementationDifficulty: 'HARD',
            isApplied: false,
            dateGenerated: new Date(),
            applyRecommendation: function(): void { this.isApplied = true; },
            dismissRecommendation: function(): void { /* implement logic */ }
        });
        
        return recommendations;
    }
    
    public getStateSpecificReports(): any[] {
        return [
            {
                title: 'Budget Utilization Report',
                description: 'Shows how much of each budget category has been used',
                data: this.overBudgetCategories
            },
            {
                title: 'Spending Trends Report',
                description: 'Shows spending trends across different categories',
                // In a real system, we'd generate actual data here
            }
        ];
    }
    
    private isSavingConsistently(): boolean {
        // In a real system, we'd analyze transaction history to determine
        // if the user is consistently saving money
        // This is a simplified placeholder
        return Math.random() > 0.7; // 30% chance of returning true
    }
}
