# YouTube Upload Integration Setup Guide

This guide will help you set up YouTube video uploads for your PocketRot application.

## Overview

The YouTube integration allows you to automatically upload generated videos to your YouTube channel using the YouTube Data API v3.

## Prerequisites

- A Google account with a YouTube channel
- Access to Google Cloud Console
- Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable YouTube Data API v3

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add the scope: `https://www.googleapis.com/auth/youtube.upload`
   - Add yourself as a test user
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "PocketRot YouTube Upload"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/youtube/auth` (for local development)
     - `https://your-domain.vercel.app/api/youtube/auth` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# YouTube API OAuth Credentials
YOUTUBE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/youtube/auth"
YOUTUBE_REFRESH_TOKEN="" # We'll get this in the next step
```

## Step 5: Get Your Refresh Token

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/api/youtube/auth`

3. You'll see a JSON response with an `authUrl`. Copy this URL and paste it in your browser.

4. Sign in with your Google account and grant the requested permissions.

5. After authorization, you'll be redirected back to the auth endpoint with a code.

6. The page will display your tokens, including the `refresh_token`.

7. Copy the `refresh_token` value and add it to your `.env.local`:
   ```bash
   YOUTUBE_REFRESH_TOKEN="your-refresh-token-here"
   ```

8. Restart your development server.

## Step 6: Test the Integration

You can now upload videos to YouTube using the API endpoint:

```bash
POST /api/upload/youtube
Content-Type: application/json

{
  "videoId": 1,
  "title": "My PocketRot Video",
  "description": "An AI-generated video from the PocketRot universe",
  "tags": ["PocketRot", "AI", "Short Film"],
  "privacyStatus": "private"
}
```

### Privacy Status Options:
- `private` - Only you can see the video
- `unlisted` - Anyone with the link can see the video
- `public` - Everyone can see the video

## Database Schema

The `videos` table now includes these YouTube-related fields:

- `youtubeId` - The YouTube video ID
- `youtubeUrl` - Full YouTube URL (https://www.youtube.com/watch?v=...)
- `uploadStatus` - Status: 'pending', 'uploading', 'completed', 'failed'
- `uploadedAt` - Timestamp when uploaded
- `uploadError` - Error message if upload failed

## Usage in Your Application

### Upload a Video

```typescript
const response = await fetch('/api/upload/youtube', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: 1,
    title: 'My Video Title',
    description: 'Video description',
    tags: ['tag1', 'tag2'],
    privacyStatus: 'private'
  })
});

const result = await response.json();
console.log(result.youtubeUrl); // https://www.youtube.com/watch?v=...
```

### Check Upload Status

Query the database to check the upload status:

```typescript
const video = await db.query.videos.findFirst({
  where: eq(videos.id, videoId)
});

console.log(video.uploadStatus); // 'pending', 'uploading', 'completed', or 'failed'
console.log(video.youtubeUrl); // YouTube URL if completed
```

## Production Deployment

For production on Vercel:

1. Add all YouTube environment variables to your Vercel project:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, `YOUTUBE_REFRESH_TOKEN`

2. Update `YOUTUBE_REDIRECT_URI` to use your production domain:
   ```
   https://your-domain.vercel.app/api/youtube/auth
   ```

3. Add this redirect URI to your Google Cloud OAuth credentials

4. Redeploy your application

## Troubleshooting

### "Invalid grant" error
- Your refresh token may have expired
- Re-run the OAuth flow to get a new refresh token

### "Quota exceeded" error
- YouTube API has daily quotas
- Check your quota usage in Google Cloud Console
- Consider requesting a quota increase if needed

### "Insufficient permissions" error
- Make sure you've added the correct scopes in the OAuth consent screen
- Re-run the OAuth flow with `prompt: 'consent'`

## API Quotas

YouTube Data API v3 has the following default quotas:
- **Queries per day**: 10,000 units
- **Video upload**: 1,600 units per upload

Monitor your usage in the Google Cloud Console under **APIs & Services** → **Quotas**.

## Security Notes

- **Never commit** your `.env.local` file to version control
- Keep your `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_REFRESH_TOKEN` secure
- Use `private` or `unlisted` privacy status for testing
- Consider implementing rate limiting for the upload endpoint

## Next Steps

- Add a UI button to trigger uploads from your frontend
- Implement automatic upload after video generation
- Add upload progress tracking
- Create a dashboard to view uploaded videos
- Add video metadata editing capabilities

## Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
