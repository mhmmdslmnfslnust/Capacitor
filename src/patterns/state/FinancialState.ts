import { IFinancialState } from '../../core/interfaces/IFinancialState';
import { ITransaction } from '../../core/interfaces/ITransaction';
import { IRecommendation } from '../../core/interfaces/IRecommendation';
import { User } from '../../core/models/User';

// Abstract class for State pattern
export abstract class FinancialState implements IFinancialState {
    protected context: FinancialStateContext | null = null;
    protected name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    public setContext(context: FinancialStateContext): void {
        this.context = context;
    }
    
    public getName(): string {
        return this.name;
    }
    
    public abstract handleTransaction(transaction: ITransaction): void;
    public abstract generateRecommendations(user: User): IRecommendation[];
    public abstract getStateSpecificReports(): any[];
}

// Context class for the State pattern
export class FinancialStateContext {
    private user: User;
    // Fix: Add the non-null assertion operator (!) to tell TypeScript that state will be assigned
    private state!: FinancialState;
    
    constructor(user: User, initialState: FinancialState) {
        this.user = user;
        
        // Set initial state
        this.transitionTo(initialState);
    }
    
    public transitionTo(state: FinancialState): void {
        console.log(`Context: Transitioning to ${state.getName()}`);
        this.state = state;
        
        // Set the context in the state to allow for state transitions
        state.setContext(this);
        
        // Also update the user's financial state
        this.user.setFinancialState(state);
    }
    
    public getState(): FinancialState {
        return this.state;
    }
    
    public handleTransaction(transaction: ITransaction): void {
        this.state.handleTransaction(transaction);
    }
    
    public generateRecommendations(): IRecommendation[] {
        return this.state.generateRecommendations(this.user);
    }
    
    public getStateSpecificReports(): any[] {
        return this.state.getStateSpecificReports();
    }
}
