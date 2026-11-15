import backendApp from '../AgroVision_backend-main/src/app.js';
import { connectDatabase } from '../AgroVision_backend-main/src/config/database.js';

let dbInitialized = false;

export default async function handler(req, res) {
  if (!dbInitialized) {
    dbInitialized = true;
    try {
      await connectDatabase();
    } catch (err) {
      console.warn('[AgroVision Vercel Serverless] Running in deterministic seed mode:', err.message);
    }
  }
  return backendApp(req, res);
}
