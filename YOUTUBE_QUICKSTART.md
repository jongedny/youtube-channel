# YouTube Upload - Quick Start Guide

## ✅ What's Been Done

The YouTube upload integration is now fully implemented and deployed! Here's what was added:

1. **Database Schema** - YouTube fields added to videos table
2. **YouTube Service** - OAuth2 authentication and upload logic
3. **API Endpoints** - Upload and OAuth endpoints
4. **Documentation** - Complete setup and API reference guides
5. **Environment Config** - Template for YouTube credentials

## 🚀 Next Steps to Start Uploading

### Step 1: Set Up Google Cloud (15 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **YouTube Data API v3**
4. Create **OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3000/api/youtube/auth`
5. Copy your **Client ID** and **Client Secret**

📖 **Detailed instructions**: See `YOUTUBE_SETUP.md`

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
YOUTUBE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/youtube/auth"
YOUTUBE_REFRESH_TOKEN="" # We'll get this next
```

### Step 3: Get Your Refresh Token

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/youtube/auth`
3. Copy the `authUrl` from the response
4. Paste it in your browser and authorize with your YouTube account
5. After redirect, copy the `refresh_token` from the response
6. Add it to `.env.local` as `YOUTUBE_REFRESH_TOKEN`
7. Restart your dev server

### Step 4: Upload Your First Video

```bash
curl -X POST http://localhost:3000/api/upload/youtube \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": 1,
    "title": "My First PocketRot Video",
    "description": "AI-generated video from PocketRot",
    "tags": ["PocketRot", "AI", "Animation"],
    "privacyStatus": "private"
  }'
```

Or use the API in your code:

```javascript
const response = await fetch('/api/upload/youtube', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: 1,
    title: 'My Video',
    privacyStatus: 'private'
  })
});

const { youtubeUrl } = await response.json();
console.log('Uploaded:', youtubeUrl);
```

## 📚 Documentation

- **`YOUTUBE_SETUP.md`** - Complete setup guide with screenshots
- **`YOUTUBE_API.md`** - API reference and examples
- **`YOUTUBE_INTEGRATION_SUMMARY.md`** - Technical implementation details

## 🔧 Common Use Cases

### Auto-upload after video generation

Add this to your video generation endpoint:

```typescript
// After video is created...
fetch('/api/upload/youtube', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: newVideo.id,
    title: scenario.title,
    privacyStatus: 'private'
  })
}).catch(console.error);
```

### Check upload status

```typescript
const video = await db.query.videos.findFirst({
  where: eq(videos.id, videoId)
});

if (video.uploadStatus === 'completed') {
  console.log('YouTube URL:', video.youtubeUrl);
} else if (video.uploadStatus === 'failed') {
  console.log('Error:', video.uploadError);
}
```

### Retry failed uploads

```typescript
const failedVideos = await db.query.videos.findMany({
  where: eq(videos.uploadStatus, 'failed')
});

for (const video of failedVideos) {
  await fetch('/api/upload/youtube', {
    method: 'POST',
    body: JSON.stringify({ videoId: video.id })
  });
}
```

## ⚠️ Important Notes

- **Privacy**: Use `private` or `unlisted` for testing
- **Quotas**: Default limit is ~6 uploads per day
- **Security**: Never commit `.env.local` to git
- **Tokens**: Refresh tokens don't expire unless revoked

## 🎯 Production Deployment

When deploying to Vercel:

1. Add all YouTube env vars to Vercel project settings
2. Update `YOUTUBE_REDIRECT_URI` to production URL
3. Add production redirect URI to Google Cloud Console
4. Test the OAuth flow in production

## 🆘 Troubleshooting

**"Invalid grant" error**
→ Re-run OAuth flow to get new refresh token

**"Quota exceeded" error**
→ Wait 24 hours or request quota increase

**"Video not found" error**
→ Make sure video exists in database first

**"Failed to download video" error**
→ Check Vercel Blob storage configuration

## 📊 Monitoring

Check your upload status in the database:

```sql
SELECT id, upload_status, youtube_url, uploaded_at 
FROM videos 
WHERE upload_status = 'completed';
```

Monitor API quota usage in [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)

## 🎉 You're Ready!

Everything is set up and ready to go. Just follow the 4 steps above to start uploading videos to YouTube!

---

**Need help?** Check the detailed guides:
- Setup issues → `YOUTUBE_SETUP.md`
- API questions → `YOUTUBE_API.md`
- Technical details → `YOUTUBE_INTEGRATION_SUMMARY.md`
