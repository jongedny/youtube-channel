# Character Image Generation Feature

## Overview
Added the ability to generate still images for each character with approval tracking functionality.

## Changes Made

### 1. Database Schema Updates
- **File**: `src/db/schema.ts`
- Added `approved` boolean field to the `images` table (defaults to `false`)
- This field tracks whether the user has approved the character design

### 2. Database Migration
- **File**: `scripts/migrate-add-approved.ts`
- Created migration script to add the `approved` column to existing images table
- Migration successfully applied to database

### 3. New API Endpoints

#### Character Image Generation
- **File**: `src/app/api/generate/character-image/route.ts`
- Generates character portrait images using Gemini 2.5 Flash Image
- Uses 9:16 portrait aspect ratio for character portraits
- Stores images in Vercel Blob storage
- Creates detailed prompts based on character attributes (name, species, pocket artifact, role, backstory)
- Includes fallback to placeholder images if generation fails

#### Image Approval Update
- **File**: `src/app/api/update-image-approval/route.ts`
- Allows updating the approval status of character images
- Simple POST endpoint that toggles the `approved` field

### 4. Dashboard UI Updates
- **File**: `src/app/dashboard/page.tsx`

#### New State Management
- Added `characterImages` state to track character images
- Added `generatingCharacterImage` state to track generation progress
- Updated image fetching to separate scenario and character images

#### New Functions
- `generateCharacterImage()`: Triggers character image generation
- `updateImageApproval()`: Updates approval status when checkbox is toggled

#### UI Components
Each character card now includes:
- **Generate Button**: "Generate Character Image" button (purple themed)
- **Image Display**: Shows generated character portrait
- **Approval Checkbox**: Interactive checkbox with dynamic label
  - Unchecked: "Approve design" (gray text)
  - Checked: "✅ Approved" (green text)

## User Flow

1. User views character cards on the dashboard
2. User clicks "Generate Character Image" button below a character
3. System generates a portrait image using AI (Gemini 2.5 Flash Image)
4. Image is displayed on the character card
5. User can approve/disapprove the design using the checkbox
6. Approval status is saved to the database and persists across sessions

## Technical Details

### Image Generation
- **Model**: Gemini 2.5 Flash Image
- **Aspect Ratio**: 9:16 (portrait orientation)
- **Storage**: Vercel Blob (public access)
- **Prompt**: Includes character details, PocketRot universe aesthetic, VHS-tape style with glitch effects

### Approval System
- Stored as boolean in database
- Updates immediately via API call
- UI reflects approval state with visual feedback (color change, emoji)

## Testing
Feature successfully tested via browser automation:
- ✅ Image generation works
- ✅ Images display correctly
- ✅ Approval checkbox functions properly
- ✅ UI updates reflect approval state changes
- ✅ State persists across page refreshes

## Files Modified
1. `src/db/schema.ts` - Added approval field
2. `src/app/dashboard/page.tsx` - Added UI and functionality
3. `scripts/migrate-add-approved.ts` - Database migration
4. `src/app/api/generate/character-image/route.ts` - New endpoint
5. `src/app/api/update-image-approval/route.ts` - New endpoint

## Migration Applied
```sql
ALTER TABLE "images" ADD COLUMN "approved" boolean DEFAULT false;
```

Status: ✅ Successfully deployed and tested
