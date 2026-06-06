import { spawn } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production.local' });

const env = { ...process.env };
const child = spawn('node', ['setup_twilio_webhook.mjs'], { env, stdio: 'inherit' });
