export interface IRecommendation {
    id: string;
    title: string;
    description: string;
    priorityLevel: number;
    category: string;
    potentialSavings?: number;
    implementationDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    isApplied: boolean;
    dateGenerated: Date;
    applyRecommendation(): void;
    dismissRecommendation(): void;
}
