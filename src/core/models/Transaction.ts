import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../enums/TransactionType';
import { CategoryType } from '../enums/CategoryType';

export class Transaction implements ITransaction {
    id: string;
    amount: number;
    description: string;
    date: Date;
    type: TransactionType;
    category: CategoryType;
    accountId: string;
    private tags: string[] = [];

    constructor(
        id: string,
        amount: number,
        description: string,
        date: Date,
        type: TransactionType,
        category: CategoryType,
        accountId: string
    ) {
        this.id = id;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.type = type;
        this.category = category;
        this.accountId = accountId;
    }

    getTags(): string[] {
        return [...this.tags];
    }

    addTag(tag: string): void {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
}
