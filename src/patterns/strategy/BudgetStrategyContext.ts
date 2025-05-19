import { IBudgetStrategy } from '../../core/interfaces/IBudgetStrategy';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { CategoryType } from '../../core/enums/CategoryType';

// Context class for the Strategy pattern
export class BudgetStrategyContext {
    private strategy: IBudgetStrategy;
    
    constructor(strategy: IBudgetStrategy) {
        this.strategy = strategy;
    }
    
    public setStrategy(strategy: IBudgetStrategy): void {
        this.strategy = strategy;
    }
    
    public calculateBudget(income: number): Map<CategoryType, number> {
        return this.strategy.calculateBudget(income);
    }
    
    public getRecommendations(transactions: ITransaction[]): string[] {
        return this.strategy.getRecommendations(transactions);
    }
    
    public getStrategyName(): string {
        return this.strategy.name;
    }
    
    public getStrategyDescription(): string {
        return this.strategy.description;
    }
}
