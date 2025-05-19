/**
 * Capacitor Finance - Personal Finance Management System
 * Main entry point that allows choosing between CLI or Web interface
 */

import { Command } from 'commander';
import * as path from 'path';
import { spawn } from 'child_process';

const program = new Command();

program
  .version('1.0.0')
  .description('Capacitor Finance - Personal Finance Management System with AI Recommendations')
  .option('-w, --web', 'Start the web interface')
  .option('-c, --cli', 'Start the command-line interface')
  .option('-d, --demo', 'Run the demo with sample data')
  .parse(process.argv);

const options = program.opts();

if (options.web) {
  console.log('Starting web interface...');
  startWebInterface();
} else if (options.cli) {
  console.log('Starting command-line interface...');
  startCliInterface();
} else if (options.demo) {
  console.log('Running demo...');
  runDemo();
} else {
  console.log('Please specify an interface option: --web, --cli, or --demo');
  program.help();
}

function startWebInterface() {
  try {
    // Use direct require for more reliable behavior in compiled JavaScript
    require('./ui/web/server');
    console.log('Web server started. Access the application at http://localhost:3000');
  } catch (error) {
    console.error('Error starting web interface:', error);
  }
}

function startCliInterface() {
  try {
    // Use direct require for more reliable behavior in compiled JavaScript
    require('./ui/cli/index');
  } catch (error) {
    console.error('Error starting CLI interface:', error);
  }
}

function runDemo() {
  try {
    // Use direct require for more reliable behavior in compiled JavaScript
    const demo = require('./demo').default;
    if (typeof demo === 'function') {
      demo();
    } else {
      console.error('Demo module does not export a default function');
    }
  } catch (error) {
    console.error('Error running demo:', error);
  }
}
