# Sora Image Resolution Fix

## Problem
When attempting to generate videos with Sora using reference images, we encountered an error:
```
The image must match the target video's resolution
```

## Root Cause
- **Sora's video resolution**: 720p (1280x720 pixels, 16:9 aspect ratio)
- **Previous image generation**: Default 1:1 square aspect ratio
- **Mismatch**: Reference images didn't match the video dimensions

## Solution
Updated the image generation API to produce images in **16:9 aspect ratio** (1280x720 resolution) to match Sora's video output.

### Changes Made

#### 1. Updated Image Generation API
**File**: `/src/app/api/generate/scenario-image/route.ts`

Added `generationConfig` to the Gemini API request:
```typescript
generationConfig: {
    imageConfig: {
        aspectRatio: '16:9'  // 1280x720 to match Sora video resolution
    }
}
```

#### 2. Updated Placeholder Fallback
Changed placeholder dimensions from `1024x576` to `1280x720`:
```typescript
const placeholderUrl = `https://placehold.co/1280x720/1a1a2e/e94560?text=Scenario+${scenarioId}`;
```

## Sora Video Resolutions
According to OpenAI documentation, Sora supports:
- **720p (Standard)**: 1280x720 - 16:9 aspect ratio ✅ (what we're using)
- **1080p (Pro)**: 1920x1080 - 16:9 aspect ratio
- **Square**: 720x720, 1080x1080 - 1:1 aspect ratio
- **Vertical**: 720x1280, 1080x1920 - 9:16 aspect ratio

## Testing
After deployment:
1. Generate a new scenario image (it will be 16:9)
2. Use that image as a reference for Sora video generation
3. The dimensions should now match and video generation should succeed

## References
- [Gemini Image Generation Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Sora Video Resolutions](https://openai.com/sora)

## Next Steps
If you need to support different video resolutions in the future:
- Add a resolution selector in the UI
- Pass the selected resolution to both image and video generation
- Update the `aspectRatio` config accordingly
