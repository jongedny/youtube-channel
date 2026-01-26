# Sora Async Video Generation Implementation

## The Discovery
When we first called the Sora API successfully, we got this response:
```json
{
  "id": "video_697796e0fa108198b9054f2451cb06170e029b6664b90c25",
  "object": "video",
  "created_at": 1769445089,
  "status": "queued",  // ← Key insight!
  "completed_at": null,
  "error": null,
  "model": "sora-2",
  "progress": 0,
  "prompt": "...",
  "seconds": "4",
  "size": "1280x720"
}
```

**Key Insight**: `status: "queued"` means the video isn't ready yet!

## The Problem
We were trying to extract a video URL immediately, but Sora uses **asynchronous processing**:
1. Submit video generation request → Get job ID
2. Video is queued/processing
3. Poll for status updates
4. When complete, get video URL

## The Solution
Implemented a polling mechanism to wait for video completion.

### Implementation Details

#### 1. Check Initial Status
```typescript
if (soraData.status === 'queued' || soraData.status === 'processing') {
    // Need to poll for completion
}
```

#### 2. Poll Every 5 Seconds
```typescript
const videoId = soraData.id;
const maxAttempts = 60; // 5 minutes max
let attempts = 0;

while (attempts < maxAttempts) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Check status
    const statusResponse = await fetch(`${endpoint}/${videoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    const statusData = await statusResponse.json();
    // ... check if completed
}
```

#### 3. Handle Completion
```typescript
if (statusData.status === 'completed') {
    videoUrl = statusData.url || statusData.video_url || ...;
    break; // Exit polling loop
}
```

#### 4. Handle Failures
```typescript
if (statusData.status === 'failed' || statusData.error) {
    throw new Error(`Video generation failed: ${statusData.error}`);
}
```

#### 5. Handle Timeout
```typescript
if (!videoUrl) {
    throw new Error('Video generation timed out after 5 minutes');
}
```

## API Endpoints

### Create Video (POST)
```
POST https://api.openai.com/v1/videos
```
**Returns**: Job with `status: "queued"`

### Check Status (GET)
```
GET https://api.openai.com/v1/videos/{video_id}
```
**Returns**: Updated status (no video URL in response)

### Download Video (GET)
```
GET https://api.openai.com/v1/videos/{video_id}/content
```
**Returns**: Binary MP4 video data
**Requires**: Authorization header with API key
**Note**: URLs valid for 1 hour after generation

## Status Flow

```
queued → processing → completed
   ↓          ↓           ↓
  0%    →   50%    →   100%
                         ↓
                    video URL available
```

## Timing Expectations
- **Polling interval**: 5 seconds
- **Max wait time**: 5 minutes (60 attempts)
- **Typical generation time**: 30-120 seconds (varies by video length/complexity)

## Error Handling

| Status | Action |
|--------|--------|
| `queued` | Continue polling |
| `processing` | Continue polling |
| `completed` | Extract video URL |
| `failed` | Throw error with details |
| Timeout (5 min) | Throw timeout error |

## Complete Request Flow

```
1. POST /v1/videos with:
   - model: sora-2
   - prompt: video description
   - size: 1280x720
   - input_reference: image file (resized to 1280x720)

2. Receive response:
   {
     "id": "video_xxx",
     "status": "queued",
     "progress": 0
   }

3. Poll GET /v1/videos/{id} every 5 seconds

4. When status === "completed":
   {
     "id": "video_xxx",
     "status": "completed",
     "progress": 100
     // Note: No video URL in this response!
   }

5. Download video from GET /v1/videos/{id}/content
   (with Authorization header)

6. Upload to Vercel Blob

7. Save to database
```

## Testing
After deployment:
1. Generate a video with Sora
2. Watch the logs for polling progress
3. Video should complete in 30-120 seconds
4. Final video will be downloaded and saved

## Next Steps
If videos take longer than 5 minutes:
- Increase `maxAttempts` (currently 60)
- Or increase polling interval (currently 5 seconds)
- Consider implementing webhook callbacks if available
