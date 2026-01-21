# YouTube Upload API Reference

## Endpoints

### 1. Upload Video to YouTube

**Endpoint:** `POST /api/upload/youtube`

**Description:** Uploads a generated video to YouTube.

**Request Body:**
```json
{
  "videoId": 1,                    // Required: Database ID of the video to upload
  "title": "Video Title",          // Optional: YouTube video title (default: "PocketRot Video {id}")
  "description": "Description",    // Optional: Video description (default: video prompt)
  "tags": ["tag1", "tag2"],       // Optional: Array of tags (default: ["PocketRot", "AI Generated", "Short Film"])
  "privacyStatus": "private"       // Optional: "private", "public", or "unlisted" (default: "private")
}
```

**Success Response (200):**
```json
{
  "success": true,
  "youtubeId": "dQw4w9WgXcQ",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Error Response (400/404/500):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/upload/youtube', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    videoId: 1,
    title: 'PocketRot: The Great Crumb Heist',
    description: 'A cinematic adventure in the PocketRot universe',
    tags: ['PocketRot', 'Animation', 'AI Generated'],
    privacyStatus: 'unlisted'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Video uploaded:', data.youtubeUrl);
}
```

---

### 2. YouTube OAuth Authorization

**Endpoint:** `GET /api/youtube/auth`

**Description:** Handles YouTube OAuth flow for getting refresh tokens.

**Without code parameter:**
Returns the authorization URL to visit.

**Response:**
```json
{
  "message": "Visit this URL to authorize the application",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "instructions": [
    "1. Click the authUrl link below",
    "2. Sign in with your YouTube account",
    "3. Grant the requested permissions",
    "4. You will be redirected back with a code",
    "5. The tokens will be displayed for you to save"
  ]
}
```

**With code parameter (after OAuth redirect):**
Exchanges the authorization code for tokens.

**Response:**
```json
{
  "success": true,
  "message": "Authorization successful! Copy the refresh_token below to your .env.local file",
  "tokens": {
    "access_token": "ya29.a0...",
    "refresh_token": "1//0g...",
    "scope": "https://www.googleapis.com/auth/youtube.upload",
    "token_type": "Bearer",
    "expiry_date": 1234567890
  },
  "instructions": [
    "1. Copy the refresh_token value",
    "2. Add it to your .env.local file as YOUTUBE_REFRESH_TOKEN",
    "3. Restart your development server",
    "4. You can now upload videos to YouTube!"
  ]
}
```

**Example Usage:**
```bash
# Step 1: Get the auth URL
curl http://localhost:3000/api/youtube/auth

# Step 2: Visit the authUrl in your browser and authorize

# Step 3: After redirect, the tokens will be displayed
# Copy the refresh_token to your .env.local
```

---

## Database Schema

The `videos` table includes these YouTube-related fields:

| Field | Type | Description |
|-------|------|-------------|
| `youtubeId` | varchar(100) | YouTube video ID (e.g., "dQw4w9WgXcQ") |
| `youtubeUrl` | varchar(500) | Full YouTube URL |
| `uploadStatus` | varchar(50) | Status: 'pending', 'uploading', 'completed', 'failed' |
| `uploadedAt` | timestamp | When the video was uploaded to YouTube |
| `uploadError` | text | Error message if upload failed |

---

## Upload Status Flow

```
pending → uploading → completed
                   ↘ failed
```

1. **pending**: Video generated but not yet uploaded
2. **uploading**: Upload in progress
3. **completed**: Successfully uploaded to YouTube
4. **failed**: Upload failed (check `uploadError` field)

---

## Error Handling

Common errors and solutions:

### "Video not found"
- The `videoId` doesn't exist in the database
- Check that the video was successfully generated first

### "Failed to download video"
- The video URL in the database is invalid or inaccessible
- Check Vercel Blob storage configuration

### "Invalid grant"
- The refresh token has expired or is invalid
- Re-run the OAuth flow to get a new refresh token

### "Quota exceeded"
- YouTube API daily quota has been reached
- Wait 24 hours or request a quota increase from Google

### "Insufficient permissions"
- OAuth scopes are missing
- Re-configure OAuth consent screen with required scopes

---

## Rate Limits & Quotas

**YouTube Data API v3 Quotas:**
- Default daily quota: 10,000 units
- Video upload cost: ~1,600 units per video
- ~6 videos can be uploaded per day with default quota

**Recommendations:**
- Implement upload queuing for multiple videos
- Add retry logic with exponential backoff
- Monitor quota usage in Google Cloud Console
- Request quota increase if needed

---

## Security Best Practices

1. **Never expose credentials:**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production
   - Rotate tokens regularly

2. **Validate inputs:**
   - Sanitize video titles and descriptions
   - Limit tag count and length
   - Validate privacy status values

3. **Implement authentication:**
   - Protect upload endpoints with authentication
   - Use NextAuth or similar for user sessions
   - Add role-based access control

4. **Monitor uploads:**
   - Log all upload attempts
   - Track success/failure rates
   - Set up alerts for quota limits

---

## Integration Examples

### Automatic Upload After Generation

Modify the video generation endpoint to automatically upload:

```typescript
// In src/app/api/generate/scenario-video/route.ts

// After video is saved to database...
const [newVideo] = await db.insert(videos).values({
  scenarioId: scenarioId,
  url: videoUrl,
  prompt: videoPrompt,
  generatedBy: 'veo-3.1-preview',
}).returning();

// Trigger YouTube upload (non-blocking)
fetch(`${process.env.NEXTAUTH_URL}/api/upload/youtube`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: newVideo.id,
    title: scenario.title,
    description: scenario.description,
    privacyStatus: 'private'
  })
}).catch(console.error); // Don't block on upload errors

return NextResponse.json({
  success: true,
  video: newVideo,
});
```

### Check Upload Status

```typescript
import { db } from '@/db';
import { videos } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkUploadStatus(videoId: number) {
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, videoId)
  });
  
  return {
    status: video.uploadStatus,
    youtubeUrl: video.youtubeUrl,
    error: video.uploadError
  };
}
```

### Retry Failed Uploads

```typescript
async function retryFailedUploads() {
  const failedVideos = await db.query.videos.findMany({
    where: eq(videos.uploadStatus, 'failed')
  });
  
  for (const video of failedVideos) {
    await fetch('/api/upload/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: video.id })
    });
  }
}
```

---

## Testing

### Test Upload Locally

```bash
# 1. Start dev server
npm run dev

# 2. Generate a video first (or use existing video ID)

# 3. Upload to YouTube
curl -X POST http://localhost:3000/api/upload/youtube \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": 1,
    "title": "Test Upload",
    "privacyStatus": "private"
  }'
```

### Verify Upload

1. Check the API response for `youtubeUrl`
2. Visit the YouTube URL to verify the video
3. Check your YouTube Studio for the uploaded video
4. Verify database fields are updated correctly

---

## Troubleshooting Checklist

- [ ] YouTube Data API v3 is enabled in Google Cloud
- [ ] OAuth credentials are created and configured
- [ ] Redirect URI matches in both Google Cloud and .env
- [ ] All environment variables are set correctly
- [ ] Refresh token is valid and not expired
- [ ] Video exists in database and is accessible
- [ ] API quota is not exceeded
- [ ] OAuth scopes include youtube.upload
- [ ] Test user is added in OAuth consent screen (if in testing mode)

---

For detailed setup instructions, see [YOUTUBE_SETUP.md](./YOUTUBE_SETUP.md)
