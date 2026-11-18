/**
 * Re-export all centralized email functions from services/emailService.js
 * to maintain complete backward compatibility across all modules and tests.
 */
export * from '../services/emailService.js';
export { default } from '../services/emailService.js';
