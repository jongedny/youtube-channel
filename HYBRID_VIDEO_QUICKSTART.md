# 🎬 Hybrid Video Generation - Quick Start

## What's New?

Your PocketRot app now supports **two AI models** for video generation:

### 🟢 Google Veo 3.1 (Default)
- ✅ Already configured and working
- 📝 Text-to-video only
- ⚡ Fast and reliable

### 🟣 OpenAI Sora (Optional)
- ✨ **Supports reference images!**
- 🎨 Better visual consistency
- 🖼️ Uses scenario images as reference

## How to Use

1. **Navigate to Dashboard** - View your scenarios
2. **Select a Model** - Choose from the dropdown:
   - Google Veo 3.1 (Text-only)
   - OpenAI Sora (Text + Image)
3. **Generate Video** - Click the button to create your video

## Visual Guide

The new UI shows:
- 📋 **Dropdown selector** to choose your AI model
- ℹ️ **Info box** explaining model capabilities
- ✅ **Status indicator** if reference image is available
- 🎬 **Generate button** to create the video

![Model Selector UI](/.gemini/antigravity/brain/97fa8146-1a9e-4d7c-87d3-f69852f7c10f/model_selector_ui_1769188470126.png)

## Setup for Sora (Optional)

To enable OpenAI Sora:

1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY="sk-proj-your-key-here"
   ```
3. Restart your dev server

**Note**: Sora is currently in limited release. You may need waitlist approval.

## Documentation

- 📖 **Full Setup Guide**: See `SORA_SETUP.md`
- 🔧 **Implementation Details**: See `HYBRID_VIDEO_GENERATION.md`
- 🎥 **YouTube Integration**: See `YOUTUBE_API.md`

## Benefits

### With Reference Images (Sora)
- 🎯 **Better consistency** - Characters look the same across videos
- 🎨 **Style matching** - Maintains visual aesthetic from images
- 📍 **Setting accuracy** - Locations match your scenario images

### Without Reference Images (Veo)
- ⚡ **Faster** - No image processing needed
- 💰 **Cost-effective** - May be cheaper per generation
- ✅ **Always available** - No waitlist required

## Current Status

- ✅ UI implementation complete
- ✅ Gemini/Veo working and tested
- ⏳ Sora ready (requires API key)

## Questions?

Check the full documentation in:
- `SORA_SETUP.md` - Detailed setup and troubleshooting
- `HYBRID_VIDEO_GENERATION.md` - Technical implementation details

---

**Happy video generating! 🎬✨**
