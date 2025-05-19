export interface IAccount {
    id: string;
    name: string;
    balance: number;
    accountType: string;
    getBalance(): number;
    deposit(amount: number): void;
    withdraw(amount: number): boolean;
    getTransactionHistory(): ITransaction[];
}

export interface IAccountComponent {
    getName(): string;
    getBalance(): number;
    addAccount?(account: IAccountComponent): void;
    removeAccount?(account: IAccountComponent): void;
    getAccounts?(): IAccountComponent[];
}

import { ITransaction } from './ITransaction';
