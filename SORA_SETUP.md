# OpenAI Sora Integration

This document explains how to use OpenAI Sora for video generation with reference image support.

## Overview

The application now supports **two AI models** for video generation:

1. **Google Veo 3.1** (via Gemini API) - Text-to-video only
2. **OpenAI Sora** - Text-to-video with optional reference images ✨

## Key Differences

| Feature | Google Veo 3.1 | OpenAI Sora |
|---------|---------------|-------------|
| Text prompts | ✅ | ✅ |
| Reference images | ❌ | ✅ |
| Image + text combined | ❌ | ✅ |
| Video duration | 8 seconds | Up to 20 seconds |
| Aspect ratios | 16:9 | Multiple options |

## Setup Instructions

### 1. Get OpenAI API Access

1. Sign up for OpenAI API access at [platform.openai.com](https://platform.openai.com)
2. Request access to Sora (currently in limited release)
3. Generate an API key from your OpenAI dashboard

### 2. Add API Key to Environment

Add your OpenAI API key to `.env.local`:

```bash
# OpenAI Sora API
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3. Using the Model Selector

In the dashboard, when generating a video:

1. **Select AI Model** from the dropdown:
   - **Google Veo 3.1 (Text-only)** - Uses only the text prompt
   - **OpenAI Sora (Text + Image)** - Uses text prompt + reference image (if available)

2. Click **Generate Video (8s)** to start generation

3. The system will automatically:
   - Use the scenario image as a reference (if Sora is selected and image exists)
   - Generate the video with the selected model
   - Upload to Vercel Blob storage
   - Save to database with model attribution

## How Reference Images Work

When using **OpenAI Sora** with a reference image:

- The scenario image is passed to Sora as a visual reference
- Sora uses it to maintain visual consistency (characters, style, setting)
- The text prompt guides the action and narrative
- Result: More consistent videos that match your scenario images

## API Endpoint

The video generation endpoint accepts a `model` parameter:

```typescript
POST /api/generate/scenario-video

Body:
{
  "scenarioId": 123,
  "model": "sora" | "gemini"  // defaults to "gemini"
}
```

## Important Notes

### Sora Availability
- ⚠️ OpenAI Sora is currently in **limited release**
- You may need to join a waitlist or have specific API tier access
- Check [OpenAI's documentation](https://platform.openai.com/docs) for current availability

### API Response Structure
The Sora implementation uses the expected API structure based on OpenAI's patterns. If the actual API differs, you may need to adjust the response parsing in:

`/src/app/api/generate/scenario-video/route.ts` → `generateVideoWithSora()` function

### Cost Considerations
- Sora video generation may have different pricing than Veo
- Check OpenAI's pricing page for current rates
- Monitor your usage in the OpenAI dashboard

## Troubleshooting

### "OPENAI_API_KEY not found"
- Ensure you've added the key to `.env.local`
- Restart your development server after adding the key

### "Sora API failed: 403"
- Your API key may not have Sora access yet
- Check your OpenAI account tier and permissions
- Contact OpenAI support for access

### "No video URL returned from Sora API"
- The API response structure may have changed
- Check the console logs for the actual response
- Adjust the parsing logic in `generateVideoWithSora()`

## Future Enhancements

Potential improvements:
- Support for longer video durations (Sora can do 20+ seconds)
- Multiple aspect ratio options
- Video-to-video editing (extending existing videos)
- Batch processing with multiple reference images

## Related Files

- `/src/app/dashboard/page.tsx` - UI with model selector
- `/src/app/api/generate/scenario-video/route.ts` - Video generation logic
- `.env.local` - Environment variables (not in git)
