# Capacitor Finance Management System

A comprehensive Personal Finance Management System with AI-powered recommendations that helps users track income, expenses, investments, and savings goals.

## Features

- **Transaction tracking**: Log and categorize financial transactions
- **Budget planning**: Use different budgeting strategies (50/30/20 rule, Zero-based budgeting)
- **AI-powered recommendations**: Get personalized financial advice based on your spending patterns
- **Goal tracking**: Set and track financial goals
- **Financial reports**: Generate visual reports of your financial health
- **Multi-account management**: Group and manage different financial accounts

## Design Patterns Implemented

This project demonstrates several design patterns:

1. **Singleton Pattern**: Used for database connection management
2. **Strategy Pattern**: Implemented for different budgeting strategies
3. **State Pattern**: Manages different financial states (Budgeting, Savings, Investment)
4. **Composite Pattern**: Organizes financial accounts hierarchically

## Project Structure

## Setup Instructions

Before running the application, you need to install the required dependencies:

```bash
npm install
```

This will install all the necessary packages including:
- express and @types/express - For the web server
- cors and @types/cors - For handling CORS
- uuid and @types/uuid - For generating unique IDs
- @types/node - For Node.js type definitions

## Running the Application

After installing dependencies, you can run the application using one of these commands:

- Run the demo:
```bash
npm run demo
```

- Start the web interface:
```bash
npm run web
```

- Start the CLI interface:
```bash
npm run cli
```

## Development

To compile the TypeScript files:
```bash
npm run build
```

The compiled JavaScript files will be in the `dist` directory.

