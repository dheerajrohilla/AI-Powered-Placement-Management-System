import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('Testing SMTP connection with:');
console.log('Service:', process.env.SMTP_SERVICE);
console.log('User:', process.env.SMTP_USER);
console.log('Pass configured:', Boolean(process.env.SMTP_PASS));

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

try {
  console.log('Initiating SMTP handshake verification with Gmail...');
  const success = await transporter.verify();
  console.log('✅ SMTP Handshake Successful! Transporter is ready to send messages.');
  process.exit(0);
} catch (error) {
  console.error('❌ SMTP Verification failed:');
  console.error('Error Code:', error.code);
  console.error('Error Message:', error.message);
  process.exit(1);
}
