import { IAccountComponent } from '../interfaces/IAccount';
import { Goal } from './Goal';
import { IFinancialState } from '../interfaces/IFinancialState';
import { ITransaction } from '../interfaces/ITransaction';

export class User {
    private id: string;
    private name: string;
    private email: string;
    private accounts: IAccountComponent[] = [];
    private goals: Goal[] = [];
    private financialState: IFinancialState;

    constructor(id: string, name: string, email: string, initialState: IFinancialState) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.financialState = initialState;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }

    public addAccount(account: IAccountComponent): void {
        this.accounts.push(account);
    }

    public removeAccount(accountId: string): void {
        this.accounts = this.accounts.filter(account => account.getName() !== accountId);
    }

    public getAccounts(): IAccountComponent[] {
        return this.accounts;
    }

    public addGoal(goal: Goal): void {
        this.goals.push(goal);
    }

    public removeGoal(goalId: string): void {
        this.goals = this.goals.filter(goal => goal.getId() !== goalId);
    }

    public getGoals(): Goal[] {
        return this.goals;
    }

    public getFinancialState(): IFinancialState {
        return this.financialState;
    }

    public setFinancialState(newState: IFinancialState): void {
        this.financialState = newState;
    }

    public handleTransaction(transaction: ITransaction): void {
        this.financialState.handleTransaction(transaction);
    }

    public getTotalBalance(): number {
        return this.accounts.reduce((total, account) => total + account.getBalance(), 0);
    }
}
