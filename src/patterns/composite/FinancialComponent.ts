import { IAccountComponent } from '../../core/interfaces/IAccount';

// This is the base Component class for the Composite pattern
export abstract class FinancialComponent implements IAccountComponent {
    protected name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public abstract getBalance(): number;
}

// Leaf in the Composite pattern
export class IndividualAccount extends FinancialComponent {
    protected balance: number;
    protected accountType: string;
    
    constructor(name: string, initialBalance: number, accountType: string) {
        super(name);
        this.balance = initialBalance;
        this.accountType = accountType;
    }
    
    public getBalance(): number {
        return this.balance;
    }
    
    public deposit(amount: number): void {
        this.balance += amount;
    }
    
    public withdraw(amount: number): boolean {
        if (amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
    
    public getAccountType(): string {
        return this.accountType;
    }
}

// Composite in the Composite pattern
export class AccountGroup extends FinancialComponent {
    private accounts: IAccountComponent[] = [];
    
    constructor(name: string) {
        super(name);
    }
    
    public addAccount(account: IAccountComponent): void {
        this.accounts.push(account);
    }
    
    public removeAccount(account: IAccountComponent): void {
        const index = this.accounts.indexOf(account);
        if (index !== -1) {
            this.accounts.splice(index, 1);
        }
    }
    
    public getAccounts(): IAccountComponent[] {
        return [...this.accounts];
    }
    
    public getBalance(): number {
        return this.accounts.reduce((total, account) => {
            return total + account.getBalance();
        }, 0);
    }
}
