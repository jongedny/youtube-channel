# PocketRot Setup Guide 🎮

## Overview

PocketRot is an AI-powered content generation system for creating characters and scenarios in a glitchy, corrupted Windows 98-inspired universe. The system uses Google's Gemini AI to generate new content based on established lore.

## What's Been Built

### 📊 Database Schema
- **lore** - Stores the foundational PocketRot universe lore
- **characters** - Stores both original (4 seed characters) and AI-generated characters
- **scenarios** - Stores AI-generated scenarios/scenes
- **images** - For future AI-generated images
- **videos** - For future AI-generated videos

### 🤖 AI Generation
- **Gemini Integration** - Uses Google's Gemini Pro model
- **Character Generation** - Creates new glitched animals with pocket artifacts
- **Scenario Generation** - Creates scenes featuring existing characters

### 🎯 Features
- **Manual Generation** - Dashboard buttons to generate on-demand
- **Automated Generation** - Cron jobs for scheduled generation
  - Daily scenarios (9am daily)
  - Weekly characters (9am Mondays)
- **Password Protected** - Uses existing NextAuth system

## Setup Instructions

### 1. Update Database Connection

**IMPORTANT:** Your current DATABASE_URL appears to be outdated or has an invalid password.

1. Go to your [Neon Dashboard](https://console.neon.tech/)
2. Find your project
3. Get a fresh connection string
4. Update `.env.local` with the new DATABASE_URL

### 2. Run Database Migrations

Once you have a valid DATABASE_URL:

```bash
npm run pocketrot:migrate
```

This creates all the necessary tables.

### 3. Seed the Database

Populate with PocketRot lore and the 4 original characters:

```bash
npm run pocketrot:seed
```

This will insert:
- 8 lore entries (origin, physics, aesthetics)
- 4 original characters:
  - **Scraps Caps-Lock** (Raccoon) - The Foreman
  - **Gort Short-Sport** (Capybara) - The Pilot
  - **Bubbles Rubbles** (Axolotl) - The Wildcard
  - **Shelldon Swell-Don** (Turtle) - The Don

### 4. Add Cron Secret (Optional)

For automated generation via Vercel Cron, add to `.env.local`:

```bash
CRON_SECRET="your-random-secret-here"
```

Generate a random secret:
```bash
openssl rand -base64 32
```

### 5. Deploy to Vercel

The `vercel.json` file is already configured with cron jobs:
- Daily scenarios at 9am
- Weekly characters at 9am on Mondays

When deploying to Vercel:
1. Add all environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GEMINI_API_KEY`
   - `CRON_SECRET`

2. Vercel will automatically run the cron jobs

## Usage

### Dashboard

After logging in, you'll see:
- **Character count** - All characters (original + AI-generated)
- **Scenario count** - All generated scenarios
- **Generation buttons** - Manual triggers for AI generation

### Manual Generation

Click the buttons in the dashboard:
- **Generate Character** - Creates a new glitched animal
- **Generate Scenario** - Creates a new scene with existing characters

### Automated Generation

Once deployed to Vercel with cron configured:
- **Daily** - New scenario generated every day at 9am
- **Weekly** - New character generated every Monday at 9am

## API Endpoints

### Protected (Requires Authentication)
- `GET /api/characters` - List all characters
- `GET /api/scenarios` - List all scenarios
- `POST /api/generate/character` - Generate new character
- `POST /api/generate/scenario` - Generate new scenario

### Cron (Requires CRON_SECRET)
- `GET /api/cron/daily-scenario` - Daily scenario generation
- `GET /api/cron/weekly-character` - Weekly character generation

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── characters/route.ts          # List characters
│   │   ├── scenarios/route.ts           # List scenarios
│   │   ├── generate/
│   │   │   ├── character/route.ts       # Manual character generation
│   │   │   └── scenario/route.ts        # Manual scenario generation
│   │   └── cron/
│   │       ├── daily-scenario/route.ts  # Automated daily scenarios
│   │       └── weekly-character/route.ts # Automated weekly characters
│   └── dashboard/page.tsx               # Main dashboard UI
├── db/
│   └── schema.ts                        # Database schema
├── lib/
│   ├── auth.ts                          # NextAuth configuration
│   └── gemini.ts                        # Gemini AI service
└── scripts/
    ├── migrate-pocketrot.ts             # Database migration
    └── seed-pocketrot.ts                # Database seeding

```

## Troubleshooting

### Database Connection Fails

If you see "password authentication failed":
1. Get a fresh DATABASE_URL from Neon dashboard
2. Update `.env.local`
3. Try running migrations again

### Gemini API Errors

If character/scenario generation fails:
1. Check that GEMINI_API_KEY is set correctly
2. Verify the API key is active in [Google AI Studio](https://aistudio.google.com/apikey)
3. Check API quotas/limits

### Cron Jobs Not Running

On Vercel:
1. Ensure `vercel.json` is in the root directory
2. Check that CRON_SECRET is set in Vercel environment variables
3. View cron logs in Vercel dashboard

## Next Steps

1. **Fix Database Connection** - Get fresh DATABASE_URL from Neon
2. **Run Migrations** - `npm run pocketrot:migrate`
3. **Seed Data** - `npm run pocketrot:seed`
4. **Test Locally** - `npm run dev` and visit dashboard
5. **Deploy** - Push to Vercel with environment variables

## The PocketRot Universe

**Tagline:** Small Scale. Big Glitch. Pure Rot.

In 1998, four real animals were "zipped" into a digital-physical hybrid state at exactly 4.20 inches tall. They exist in the "Gaps" of our world—behind radiators, under car seats, along sidewalk cracks. To them, our discarded junk is sacred tech, and our suburban environments are high-stakes RPG levels.

Every character has a "Pocket Artifact" (human debris) and exhibits glitchy physics like respawning, clipping through objects, and render-skin clothing that repairs overnight.

🎬 Ready to generate some glitchy content!
