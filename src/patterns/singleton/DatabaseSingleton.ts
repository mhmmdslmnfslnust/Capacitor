export class DatabaseSingleton {
    private static instance: DatabaseSingleton;
    private connection: any;
    private isConnected: boolean = false;

    private constructor() {
        // Private constructor to prevent instantiation
    }

    public static getInstance(): DatabaseSingleton {
        if (!DatabaseSingleton.instance) {
            DatabaseSingleton.instance = new DatabaseSingleton();
        }
        return DatabaseSingleton.instance;
    }

    public connect(connectionString: string): void {
        if (!this.isConnected) {
            console.log(`Connecting to database with connection string: ${connectionString}`);
            // In a real system, this would establish a database connection
            this.connection = {
                query: (sql: string, params: any[] = []) => {
                    console.log(`Executing query: ${sql} with params: ${params}`);
                    return Promise.resolve([]);
                },
                close: () => {
                    console.log('Closing database connection');
                    this.isConnected = false;
                    return Promise.resolve();
                }
            };
            this.isConnected = true;
            console.log('Database connection established');
        }
    }

    public getConnection(): any {
        if (!this.isConnected) {
            throw new Error('Database is not connected. Call connect() first.');
        }
        return this.connection;
    }

    public closeConnection(): void {
        if (this.isConnected && this.connection) {
            this.connection.close();
            this.isConnected = false;
        }
    }
}
