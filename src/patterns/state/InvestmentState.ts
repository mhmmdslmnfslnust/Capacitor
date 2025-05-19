import { FinancialState } from './FinancialState';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { IRecommendation } from '../../core/interfaces/IRecommendation';
import { User } from '../../core/models/User';
import { TransactionType } from '../../core/enums/TransactionType';
import { CategoryType } from '../../core/enums/CategoryType';
import { SavingsState } from './SavingsState';

/**
 * InvestmentState represents a financial state focused on growing wealth through investments
 * This state provides recommendations for users who are ready to focus on investment strategies
 */
export class InvestmentState extends FinancialState {
    private investmentsByType: Map<string, number> = new Map();
    private totalInvested: number = 0;
    private riskProfile: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    constructor() {
        super('Investment Mode');
    }
    
    public handleTransaction(transaction: ITransaction): void {
        // Track investment transactions to understand user's investment behaviors
        if (transaction.type === TransactionType.INVESTMENT) {
            const currentAmount = this.investmentsByType.get(transaction.category.toString()) || 0;
            this.investmentsByType.set(transaction.category.toString(), currentAmount + transaction.amount);
            this.totalInvested += transaction.amount;
        }
        
        // If the user has significant savings contributions, they might be shifting focus
        if (transaction.type === TransactionType.EXPENSE && 
            [CategoryType.EMERGENCY_FUND, CategoryType.RETIREMENT].includes(transaction.category) &&
            transaction.amount > 1000 && 
            this.context) {
            console.log('User appears to be focusing on savings again');
            this.context.transitionTo(new SavingsState());
        }
    }
    
    public generateRecommendations(user: User): IRecommendation[] {
        const recommendations: IRecommendation[] = [];
        
        // Portfolio diversification recommendation
        if (this.investmentsByType.size < 3) {
            recommendations.push({
                id: `invest-rec-${Date.now()}-diversify`,
                title: 'Diversify Your Investment Portfolio',
                description: 'Consider investing in a mix of stocks, bonds, and other asset classes to reduce risk.',
                priorityLevel: 1,
                category: 'Investments',
                implementationDifficulty: 'MEDIUM',
                isApplied: false,
                dateGenerated: new Date(),
                applyRecommendation: function(): void { this.isApplied = true; },
                dismissRecommendation: function(): void { /* implement logic */ }
            });
        }
        
        // Tax-advantaged accounts recommendation
        recommendations.push({
            id: `invest-rec-${Date.now()}-taxadv`,
            title: 'Maximize Tax-Advantaged Accounts',
            description: 'Make sure you\'re fully utilizing retirement accounts like 401(k) and IRA before investing in taxable accounts.',
            priorityLevel: 2,
            category: 'Tax Planning',
            implementationDifficulty: 'MEDIUM',
            isApplied: false,
            dateGenerated: new Date(),
            applyRecommendation: function(): void { this.isApplied = true; },
            dismissRecommendation: function(): void { /* implement logic */ }
        });
        
        // Low-cost index funds recommendation
        recommendations.push({
            id: `invest-rec-${Date.now()}-index`,
            title: 'Consider Low-Cost Index Funds',
            description: 'For long-term growth, low-cost index funds often outperform actively managed funds.',
            priorityLevel: 2,
            category: 'Investments',
            implementationDifficulty: 'EASY',
            isApplied: false,
            dateGenerated: new Date(),
            applyRecommendation: function(): void { this.isApplied = true; },
            dismissRecommendation: function(): void { /* implement logic */ }
        });
        
        // Rebalancing recommendation
        recommendations.push({
            id: `invest-rec-${Date.now()}-rebalance`,
            title: 'Rebalance Your Portfolio',
            description: 'Consider rebalancing your portfolio annually to maintain your target asset allocation.',
            priorityLevel: 3,
            category: 'Investments',
            implementationDifficulty: 'MEDIUM',
            isApplied: false,
            dateGenerated: new Date(),
            applyRecommendation: function(): void { this.isApplied = true; },
            dismissRecommendation: function(): void { /* implement logic */ }
        });
        
        // Advanced recommendation based on risk profile
        if (this.riskProfile === 'HIGH' && this.totalInvested > 50000) {
            recommendations.push({
                id: `invest-rec-${Date.now()}-alternative`,
                title: 'Explore Alternative Investments',
                description: 'With your risk tolerance and investment base, you might consider adding alternative investments like REITs or commodities.',
                priorityLevel: 4,
                category: 'Advanced Investments',
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
        // Reports specific to investment-focused users
        return [
            {
                title: 'Investment Portfolio Allocation',
                description: 'Breakdown of your investment portfolio by asset class',
                data: Object.fromEntries(this.investmentsByType)
            },
            {
                title: 'Investment Performance',
                description: 'Performance of your investments over time',
                // In a real system, we'd track investment performance
                data: { 
                    performanceMetrics: "Would be calculated based on actual investment data",
                    totalReturn: `${(Math.random() * 15).toFixed(2)}%` // Mock data
                }
            },
            {
                title: 'Investment Fees Analysis',
                description: 'Analysis of fees paid on investment accounts',
                data: {
                    totalFees: 0,
                    feePercentage: 0,
                    potentialSavings: 0
                }
            },
            {
                title: 'Tax Efficiency Report',
                description: 'Analysis of the tax efficiency of your investment accounts',
                data: {
                    taxableAccounts: 0,
                    taxAdvantaged: 0,
                    potentialTaxSavings: 0
                }
            }
        ];
    }
}
