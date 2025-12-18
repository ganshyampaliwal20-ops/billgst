
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('Importing lib/db.ts...');
import pool from './lib/db.ts';
console.log('Import successful. Pool:', pool ? 'Defined' : 'Undefined');
