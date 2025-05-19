import { Goal } from '../../core/models/Goal';
import { GoalStatus } from '../../core/enums/GoalStatus';
import { User } from '../../core/models/User';

export class GoalTrackingService {
    public createGoal(
        user: User, 
        name: string, 
        targetAmount: number, 
        category: string, 
        deadline?: Date, 
        description?: string
    ): Goal {
        const id = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const goal = new Goal(id, name, targetAmount, category, deadline, description);
        user.addGoal(goal);
        return goal;
    }
    
    public updateGoalProgress(goal: Goal, contributionAmount: number): void {
        goal.addContribution(contributionAmount);
    }
    
    public withdrawFromGoal(goal: Goal, withdrawalAmount: number): boolean {
        return goal.withdrawFunds(withdrawalAmount);
    }
    
    public getGoalProgress(goal: Goal): number {
        return goal.getProgress();
    }
    
    public getAllGoals(user: User): Goal[] {
        return user.getGoals();
    }
    
    public getGoalsByStatus(user: User, status: GoalStatus): Goal[] {
        return user.getGoals().filter(goal => goal.getStatus() === status);
    }
    
    public getGoalById(user: User, goalId: string): Goal | undefined {
        return user.getGoals().find(goal => goal.getId() === goalId);
    }
    
    public calculateEstimatedCompletionDate(goal: Goal, monthlyContribution: number): Date | null {
        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            // Goal is already complete
            return new Date();
        }
        
        if (monthlyContribution <= 0) {
            return null; // Cannot calculate with zero or negative contribution
        }
        
        const remainingAmount = goal.getTargetAmount() - goal.getCurrentAmount();
        const monthsToCompletion = remainingAmount / monthlyContribution;
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + Math.ceil(monthsToCompletion));
        
        return completionDate;
    }
}
