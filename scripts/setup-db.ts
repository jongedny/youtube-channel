import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function setupDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    try {
        console.log('Creating users table...');

        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

        console.log('✓ Users table created successfully!');
        console.log('\nDatabase setup complete!');
        console.log('\nYou can now:');
        console.log('1. Run the development server: npm run dev');
        console.log('2. Visit http://localhost:3000');
        console.log('3. Click "Create one" to register a new account');

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
