# Environment Setup Guide

## Required Environment Variables

Before you can run the application, you need to add the following environment variables.

### Step 1: Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it in the next step.

### Step 2: Add to .env.local

Open (or create) the `.env.local` file in the root of your project and add:

```bash
# This should already exist from Vercel/Neon integration
DATABASE_URL="your-existing-database-url"

# Paste the secret you generated in Step 1
NEXTAUTH_SECRET="paste-your-generated-secret-here"

# For local development
NEXTAUTH_URL="http://localhost:3000"
```

### Step 3: Add to Vercel

For production deployment, add these to Vercel:

1. Go to: https://vercel.com/jon-gednys-projects/youtube-channel/settings/environment-variables

2. Add two new environment variables:
   - **Name**: `NEXTAUTH_SECRET`
     **Value**: (the same secret from Step 1)
     **Environments**: Production, Preview, Development

   - **Name**: `NEXTAUTH_URL`
     **Value**: `https://youtube-channel-omega.vercel.app`
     **Environments**: Production, Preview

### Step 4: Set up the Database

Run the database setup script:

```bash
npm run db:setup
```

This creates the `users` table in your Neon database.

### Step 5: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and you should see the login page!

### Step 6: Deploy

Push your changes to trigger a new Vercel deployment:

```bash
git push origin main
```

## Troubleshooting

**Error: "NEXTAUTH_SECRET is not set"**
- Make sure you added `NEXTAUTH_SECRET` to `.env.local` for local development
- For production, make sure it's added in Vercel's environment variables

**Error: "DATABASE_URL is not set"**
- Check that `.env.local` contains your Neon database URL
- This should have been set automatically when you connected Neon to Vercel

**Database setup fails**
- Make sure your DATABASE_URL is correct
- Check that you have internet connection to reach Neon
- Verify the Neon database is active in your Neon dashboard

## Next Steps

Once everything is set up:

1. Visit the login page
2. Click "Create one" to register a new account
3. Enter your email and password
4. Log in and access the dashboard
5. Start building your app features!
