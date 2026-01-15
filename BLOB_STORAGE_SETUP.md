# Vercel Blob Storage Setup

## Why Vercel Blob?

This project uses **Vercel Blob Storage** to store AI-generated images. This is necessary because:

1. **Serverless functions are ephemeral** - Files saved to the local filesystem in production won't persist
2. **No persistent storage on Vercel** - The `public/` directory is built at deploy time and can't be written to at runtime
3. **CDN included** - Blob storage automatically serves images via Vercel's global CDN

## Setup for Production (Vercel)

When you deploy to Vercel, Blob storage is automatically configured:

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. The `BLOB_READ_WRITE_TOKEN` environment variable will be automatically added to your project

That's it! No manual configuration needed.

## Setup for Local Development (Optional)

For local development, you have two options:

### Option 1: Use Production Blob Storage (Recommended)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Find `BLOB_READ_WRITE_TOKEN` 
3. Copy the value
4. Add it to your `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_..."
   ```

### Option 2: Local Development Without Blob

If you don't set up the blob token locally, the image generation will fall back to placeholder images. This is fine for testing other features.

## How It Works

When an image is generated:

1. Gemini Imagen API generates the image as base64
2. The image is uploaded to Vercel Blob storage
3. Blob returns a permanent CDN URL (e.g., `https://xyz.public.blob.vercel-storage.com/...`)
4. This URL is saved to the database
5. The frontend displays the image from the CDN URL

## Costs

- **Free tier**: 500 MB storage, 5 GB bandwidth/month
- **Pro tier**: $0.15/GB storage, $0.30/GB bandwidth
- For this project with occasional image generation, you'll likely stay within the free tier

## Alternative Storage Options

If you prefer a different storage solution, you can modify `/src/app/api/generate/scenario-image/route.ts` to use:

- **Cloudinary** - Free tier, image optimization included
- **AWS S3** - Very cheap, highly scalable
- **Supabase Storage** - Free tier available
- **Uploadthing** - Simple API, free tier

The current implementation uses Vercel Blob because it's the simplest and most integrated with Vercel deployments.
