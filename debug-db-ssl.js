
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Manually load .env.local because dotenv.config() might not find it if cwd is different or if not passed explicitly?
// But typically it works.
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const url = process.env.DATABASE_URL;

if (!url) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
}

console.log('Original URL:', url.replace(/:[^:]+@/, ':****@'));

// 1. Test with rejectUnauthorized: false (Standard fix)
async function test1() {
    console.log('\n--- Test 1: Standard rejectUnauthorized: false ---');
    if (url.includes('sslmode=require')) {
        console.log('(URL contains sslmode=require)');
    }

    const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        console.log('✅ Test 1 Passed');
        client.release();
        await pool.end();
        return true;
    } catch (e) {
        console.log('❌ Test 1 Failed:', e.message);
        // await pool.end(); // Pool might be messed up
        return false;
    }
}

// 2. Test with no SSL object (Rely solely on sslmode=require in URL)
async function test2() {
    console.log('\n--- Test 2: No SSL object (rely on URL) ---');
    const pool = new Pool({
        connectionString: url,
    });
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        console.log('✅ Test 2 Passed');
        client.release();
        await pool.end();
        return true;
    } catch (e) {
        console.log('❌ Test 2 Failed:', e.message);
        // await pool.end();
        return false;
    }
}

// 3. Test with Explicit SSL + Stripped URL
async function test3() {
    console.log('\n--- Test 3: Explicit SSL + Stripped URL ---');
    // Remove query params from URL
    const cleanUrl = url.split('?')[0];
    const pool = new Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        console.log('✅ Test 3 Passed');
        client.release();
        await pool.end();
        return true;
    } catch (e) {
        console.log('❌ Test 3 Failed:', e.message);
        // await pool.end();
        return false;
    }
}

async function run() {
    let t1 = await test1();
    if (t1) return;

    let t2 = await test2();
    if (t2) return;

    let t3 = await test3();
}

run();
