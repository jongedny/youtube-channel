import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
    console.log('🔄 Running PocketRot database migrations...\n');

    try {
        // Create lore table
        console.log('Creating lore table...');
        await sql`
      CREATE TABLE IF NOT EXISTS lore (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        // Create characters table
        console.log('Creating characters table...');
        await sql`
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        species VARCHAR(100) NOT NULL,
        pocket_artifact VARCHAR(255) NOT NULL,
        role_and_vibe TEXT NOT NULL,
        backstory TEXT,
        is_original BOOLEAN DEFAULT false NOT NULL,
        generated_by VARCHAR(50) DEFAULT 'manual' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        // Create scenarios table
        console.log('Creating scenarios table...');
        await sql`
      CREATE TABLE IF NOT EXISTS scenarios (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        character_ids TEXT NOT NULL,
        location VARCHAR(255),
        mission TEXT,
        generated_by VARCHAR(50) DEFAULT 'gemini' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        // Create images table
        console.log('Creating images table...');
        await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        scenario_id INTEGER REFERENCES scenarios(id),
        character_id INTEGER REFERENCES characters(id),
        url VARCHAR(500) NOT NULL,
        prompt TEXT,
        generated_by VARCHAR(50) DEFAULT 'gemini' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        // Create videos table
        console.log('Creating videos table...');
        await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        scenario_id INTEGER REFERENCES scenarios(id),
        url VARCHAR(500) NOT NULL,
        prompt TEXT,
        duration INTEGER,
        generated_by VARCHAR(50) DEFAULT 'gemini' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        console.log('\n✅ All tables created successfully!');
        console.log('\n📊 Database schema:');
        console.log('   - lore');
        console.log('   - characters');
        console.log('   - scenarios');
        console.log('   - images');
        console.log('   - videos');
        console.log('\n🎉 Migration complete!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

migrate();
