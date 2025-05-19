import { CategoryType } from '../enums/CategoryType';

export interface IBudgetStrategy {
    name: string;
    description: string;
    calculateBudget(income: number): Map<CategoryType, number>;
    getRecommendations(transactions: ITransaction[]): string[];
}

import { ITransaction } from './ITransaction';
