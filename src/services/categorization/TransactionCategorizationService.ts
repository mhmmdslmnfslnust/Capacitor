import { ITransaction } from '../../core/interfaces/ITransaction';
import { CategoryType } from '../../core/enums/CategoryType';
import { TransactionType } from '../../core/enums/TransactionType';

export class TransactionCategorizationService {
    // List of keyword mappings for auto-categorization
    private categoryKeywords: Map<CategoryType, string[]> = new Map([
        [CategoryType.SALARY, ['salary', 'paycheck', 'wages', 'income', 'direct deposit']],
        [CategoryType.BUSINESS, ['client', 'invoice', 'consulting', 'freelance']],
        [CategoryType.GIFTS, ['gift', 'present', 'donation']],
        [CategoryType.HOUSING, ['rent', 'mortgage', 'property', 'lease', 'apartment']],
        [CategoryType.TRANSPORTATION, ['gas', 'fuel', 'car', 'auto', 'vehicle', 'uber', 'lyft', 'taxi', 'bus', 'transit']],
        [CategoryType.FOOD, ['grocery', 'supermarket', 'food', 'market', 'walmart', 'target']],
        [CategoryType.UTILITIES, ['electric', 'water', 'gas', 'internet', 'phone', 'bill', 'utility']],
        [CategoryType.HEALTHCARE, ['doctor', 'hospital', 'medical', 'pharmacy', 'prescription', 'health']],
        [CategoryType.ENTERTAINMENT, ['movie', 'theatre', 'netflix', 'spotify', 'hulu', 'disney', 'concert', 'ticket', 'entertainment']],
        [CategoryType.SHOPPING, ['amazon', 'store', 'mall', 'retail', 'clothing', 'shoes', 'shop']],
        [CategoryType.EDUCATION, ['tuition', 'school', 'college', 'university', 'course', 'books', 'education', 'student']],
        [CategoryType.DINING_OUT, ['restaurant', 'cafe', 'coffee', 'bar', 'diner', 'starbucks', 'mcdonalds', 'grubhub', 'doordash']],
        [CategoryType.SUBSCRIPTIONS, ['subscription', 'membership', 'monthly', 'annual']],
    ]);
    
    // User-trained categories for personalization
    private userTrainedCategories: Map<string, CategoryType> = new Map();
    
    constructor() {}
    
    public categorizeTransaction(transaction: ITransaction): CategoryType {
        // If the transaction already has a category assigned, return it
        if (transaction.category !== CategoryType.OTHER) {
            return transaction.category;
        }
        
        const description = transaction.description.toLowerCase();
        
        // Check if this is a transaction description the user has manually categorized before
        if (this.userTrainedCategories.has(description)) {
            return this.userTrainedCategories.get(description)!;
        }
        
        // Auto-categorize based on keywords in the description
        for (const [category, keywords] of this.categoryKeywords.entries()) {
            for (const keyword of keywords) {
                if (description.includes(keyword.toLowerCase())) {
                    return category;
                }
            }
        }
        
        // For income transactions with no matching keywords, default to INCOME
        if (transaction.type === TransactionType.INCOME) {
            return CategoryType.SALARY;
        }
        
        // If we couldn't categorize, return OTHER
        return CategoryType.OTHER;
    }
    
    public trainCategory(transactionDescription: string, category: CategoryType): void {
        this.userTrainedCategories.set(transactionDescription.toLowerCase(), category);
    }
    
    public bulkCategorize(transactions: ITransaction[]): ITransaction[] {
        return transactions.map(transaction => {
            if (transaction.category === CategoryType.OTHER) {
                transaction.category = this.categorizeTransaction(transaction);
            }
            return transaction;
        });
    }
    
    public getSimilarTransactions(transaction: ITransaction, allTransactions: ITransaction[]): ITransaction[] {
        const description = transaction.description.toLowerCase();
        
        return allTransactions.filter(t => 
            t.description.toLowerCase().includes(description) ||
            description.includes(t.description.toLowerCase())
        );
    }
}
