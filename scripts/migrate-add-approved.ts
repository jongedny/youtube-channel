#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

async function runMigration() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log('🔄 Running migration to add approved column to images table...');

    try {
        await sql`ALTER TABLE "images" ADD COLUMN IF NOT EXISTS "approved" boolean DEFAULT false;`;
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
