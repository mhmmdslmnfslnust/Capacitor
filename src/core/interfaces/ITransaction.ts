import { TransactionType } from '../enums/TransactionType';
import { CategoryType } from '../enums/CategoryType';

export interface ITransaction {
    id: string;
    amount: number;
    description: string;
    date: Date;
    type: TransactionType;
    category: CategoryType;
    accountId: string;
    getTags(): string[];
    addTag(tag: string): void;
}
