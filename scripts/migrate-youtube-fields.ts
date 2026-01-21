import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
    try {
        console.log('📊 Running YouTube fields migration...');

        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_id varchar(100)`;
        console.log('✅ Added youtube_id column');

        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_url varchar(500)`;
        console.log('✅ Added youtube_url column');

        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS upload_status varchar(50) DEFAULT 'pending'`;
        console.log('✅ Added upload_status column');

        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS uploaded_at timestamp`;
        console.log('✅ Added uploaded_at column');

        await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS upload_error text`;
        console.log('✅ Added upload_error column');

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
