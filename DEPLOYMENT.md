# Vercel + Neon Setup Guide

## Quick Start: Deploy to Vercel with Neon

Follow these steps to get your app deployed with a Neon Postgres database:

### Step 1: Deploy to Vercel

You have two options:

#### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy your project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? youtube-channel (or your preferred name)
# - In which directory is your code located? ./
# - Want to override settings? No

# After deployment, note your project URL
```

#### Option B: Using GitHub + Vercel Dashboard

```bash
# 1. Create a GitHub repository
# Go to https://github.com/new

# 2. Push your code
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# 3. Import to Vercel
# Go to https://vercel.com/new
# Click "Import Git Repository"
# Select your repository
# Click "Deploy"
```

### Step 2: Add Neon Integration

1. **Go to your Vercel project dashboard**
   - Navigate to https://vercel.com/dashboard
   - Click on your newly deployed project

2. **Open the Integrations tab**
   - Click on "Integrations" in the top navigation

3. **Add Neon**
   - Search for "Neon" in the marketplace
   - Click "Add Integration"
   - Click "Continue" to authorize

4. **Configure Neon**
   - Choose "Create a new Neon database" (or select existing)
   - Select your Vercel project(s) to connect
   - Choose a database name (e.g., `youtube-channel-db`)
   - Select a region (choose closest to your users)
   - Click "Create Database"

5. **Verify Environment Variables**
   - Go to Settings → Environment Variables
   - You should see `DATABASE_URL` automatically added
   - This will be available in all environments (Production, Preview, Development)

### Step 3: Set Up Local Development

```bash
# Pull environment variables from Vercel to your local machine
vercel env pull .env.local

# Generate migration files from your schema
npm run db:generate

# Apply migrations to your database
npm run db:migrate

# Start development server
npm run dev
```

### Step 4: Test Your Database Connection

1. **Visit your test endpoint locally:**
   ```
   http://localhost:3000/api/test-db
   ```

2. **Or on production:**
   ```
   https://your-project.vercel.app/api/test-db
   ```

   You should see a JSON response like:
   ```json
   {
     "success": true,
     "message": "Database connection successful",
     "userCount": 0,
     "users": []
   }
   ```

### Step 5: Access Neon Dashboard

1. Go to https://console.neon.tech
2. Select your project
3. You can:
   - View connection details
   - Run SQL queries
   - Monitor database usage
   - Manage branches (Neon's unique feature!)

### Step 6: Deploy Updates

Every time you push to your main branch (if using GitHub) or run `vercel --prod`, your app will automatically redeploy.

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push

# Or with Vercel CLI:
vercel --prod
```

## Troubleshooting

### Database connection fails locally

Make sure you've pulled the environment variables:
```bash
vercel env pull .env.local
```

### Migrations not applying

Check that your `DATABASE_URL` is set correctly:
```bash
cat .env.local
```

### Need to reset database

In Neon dashboard:
1. Go to your project
2. Click "Branches"
3. Create a new branch or reset the main branch

## Next Steps

1. **Customize your schema** in `src/db/schema.ts`
2. **Generate new migrations** with `npm run db:generate`
3. **Apply migrations** with `npm run db:migrate`
4. **Build your API routes** in `src/app/api/`
5. **Create your pages** in `src/app/`

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:generate        # Generate migrations
npm run db:migrate         # Run migrations
npm run db:studio          # Open Drizzle Studio

# Deployment
vercel                     # Deploy to preview
vercel --prod              # Deploy to production
vercel env pull            # Pull environment variables
```

## Resources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
