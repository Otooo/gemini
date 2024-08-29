import winston from 'winston';

// Config for API logger
export const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.colorize(), // Add color
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }), // Add timestamp formatted
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),  // Logs on console
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),  // Log error in file
    // new winston.transports.File({ filename: 'logs/combined.log' })  // All logs in file
  ],
});