import { ITransaction } from './ITransaction';
import { IRecommendation } from './IRecommendation';
import { User } from '../models/User';

export interface IFinancialState {
    getName(): string;
    handleTransaction(transaction: ITransaction): void;
    generateRecommendations(user: User): IRecommendation[];
    getStateSpecificReports(): any[];
}
