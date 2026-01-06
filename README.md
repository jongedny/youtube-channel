# YouTube Channel App

A Next.js application with Neon Postgres database integration.

## Setup Instructions

### 1. Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   - Copy `.env.local` and add your database URL
   - You'll get this from Vercel after connecting Neon

### 2. Deploy to Vercel and Connect Neon

#### Option A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts to create a new project

#### Option B: Deploy via GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Configure your project settings

### 3. Add Neon Integration

1. In your Vercel project dashboard, go to **Integrations**
2. Search for **Neon** and click **Add Integration**
3. Follow the prompts to:
   - Create a new Neon database or connect an existing one
   - Authorize the integration
   - Select which Vercel projects should have access

4. Vercel will automatically add the `DATABASE_URL` environment variable to your project

### 4. Run Database Migrations

After connecting Neon, you need to create your database tables:

1. Pull the environment variables locally:
   ```bash
   vercel env pull .env.local
   ```

2. Generate migration files:
   ```bash
   npm run db:generate
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

### 5. Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/api/test-db` to test the database connection

### 6. Optional: Use Drizzle Studio

To visually explore your database:

```bash
npm run db:studio
```

This will open Drizzle Studio in your browser.

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   │   └── api/          # API routes
│   └── db/               # Database configuration
│       ├── index.ts      # Database connection
│       └── schema.ts     # Database schema
├── drizzle/              # Migration files (generated)
├── drizzle.config.ts     # Drizzle configuration
└── .env.local            # Environment variables (not in git)
```

## Database Schema

The starter schema includes:
- **users** table: id, name, email, timestamps
- **posts** table: id, title, content, authorId, timestamps

Modify `src/db/schema.ts` to customize your schema.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Environment Variables

- `DATABASE_URL` - Neon Postgres connection string (automatically added by Vercel)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Vercel Documentation](https://vercel.com/docs)
