import { GoalStatus } from '../enums/GoalStatus';

export class Goal {
    private id: string;
    private name: string;
    private targetAmount: number;
    private currentAmount: number;
    private deadline?: Date;
    private status: GoalStatus;
    private description?: string;
    private category: string;
    private createdAt: Date;

    constructor(
        id: string,
        name: string,
        targetAmount: number,
        category: string,
        deadline?: Date,
        description?: string
    ) {
        this.id = id;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = 0;
        this.deadline = deadline;
        this.status = GoalStatus.NOT_STARTED;
        this.description = description;
        this.category = category;
        this.createdAt = new Date();
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getTargetAmount(): number {
        return this.targetAmount;
    }

    public getCurrentAmount(): number {
        return this.currentAmount;
    }

    public getDeadline(): Date | undefined {
        return this.deadline;
    }

    public getStatus(): GoalStatus {
        return this.status;
    }

    public getDescription(): string | undefined {
        return this.description;
    }

    public getCategory(): string {
        return this.category;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public addContribution(amount: number): void {
        this.currentAmount += amount;
        this.updateStatus();
    }

    public withdrawFunds(amount: number): boolean {
        if (amount <= this.currentAmount) {
            this.currentAmount -= amount;
            this.updateStatus();
            return true;
        }
        return false;
    }

    public getProgress(): number {
        return (this.currentAmount / this.targetAmount) * 100;
    }

    public updateStatus(): void {
        if (this.currentAmount === 0) {
            this.status = GoalStatus.NOT_STARTED;
        } else if (this.currentAmount >= this.targetAmount) {
            this.status = GoalStatus.ACHIEVED;
        } else {
            // Check if deadline has passed
            if (this.deadline && this.deadline < new Date()) {
                this.status = GoalStatus.FALLING_BEHIND;
            } else {
                this.status = GoalStatus.IN_PROGRESS;
                
                // Check if on track (simple heuristic)
                if (this.deadline) {
                    const totalDays = (this.deadline.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    const daysElapsed = (new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    
                    // If progress percentage is greater than or equal to time elapsed percentage
                    if (this.getProgress() >= (daysElapsed / totalDays) * 100) {
                        this.status = GoalStatus.ON_TRACK;
                    } else {
                        this.status = GoalStatus.FALLING_BEHIND;
                    }
                }
            }
        }
    }
}
