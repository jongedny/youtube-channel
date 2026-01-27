import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, images } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

// Version: 1.0 - Using Gemini 2.5 Flash Image for character portraits
const API_VERSION = '1.0-gemini-flash-image';

export async function POST(request: NextRequest) {
    try {
        const { characterId } = await request.json();

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID is required' },
                { status: 400 }
            );
        }

        console.log(`🎨 Generating image for character ${characterId}...`);
        console.log(`📌 API Version: ${API_VERSION}`);

        // Get the character
        const character = await db.query.characters.findFirst({
            where: eq(characters.id, characterId),
        });

        if (!character) {
            return NextResponse.json(
                { error: 'Character not found' },
                { status: 404 }
            );
        }

        // Build a detailed prompt for character image generation
        const imagePrompt = `Full body character portrait from PocketRot universe: ${character.name}

Species: ${character.species}
Size: Exactly 4.20 inches tall
Pocket Artifact: ${character.pocketArtifact}
Role & Vibe: ${character.roleAndVibe}
${character.backstory ? `\nBackstory: ${character.backstory}` : ''}

Art style: Cinematic character portrait with a slightly surreal, VHS-tape aesthetic. Vibrant, saturated colors with subtle glitch effects. Show this tiny ${character.species} character in full body view with their pocket artifact visible. The character should have a dramatic, epic presence despite being only 4.20 inches tall. Photorealistic but with intentional glitch artifacts and analog video distortion. Clean background that emphasizes the character. The character should look ready for adventure in the massive human world.`;

        console.log('📝 Character image prompt:', imagePrompt);

        // Generate image using Google's Gemini 2.5 Flash Image
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not found');
            }

            console.log('🎨 Calling Gemini Flash Image API...');

            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: imagePrompt
                            }]
                        }],
                        generationConfig: {
                            imageConfig: {
                                aspectRatio: '9:16'  // Portrait orientation for character
                            }
                        }
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API error:', errorText);
                throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Image generated successfully');

            // Extract the base64 image data
            let imageData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (!imageData) {
                console.error('❌ Response structure:', JSON.stringify(data, null, 2));
                throw new Error('No image data in response');
            }

            // Convert base64 to buffer
            const buffer = Buffer.from(imageData, 'base64');

            // Upload to Vercel Blob storage
            const filename = `character-${characterId}-${Date.now()}.png`;
            console.log('☁️ Uploading to Vercel Blob...');

            const blob = await put(filename, buffer, {
                access: 'public',
                contentType: 'image/png',
            });

            const imageUrl = blob.url;
            console.log('💾 Image uploaded to:', imageUrl);

            // Store the image in the database
            const [newImage] = await db.insert(images).values({
                characterId: characterId,
                url: imageUrl,
                prompt: imagePrompt,
                approved: false, // Default to not approved
                generatedBy: 'gemini-2.5-flash-image',
            }).returning();

            console.log('✅ Character image record created:', newImage.id);

            return NextResponse.json({
                success: true,
                image: newImage,
            });

        } catch (imageError: any) {
            console.error('❌ Image generation failed:', imageError);

            // Fallback to placeholder if image generation fails (9:16 portrait)
            const placeholderUrl = `https://placehold.co/720x1280/1a1a2e/e94560?text=${encodeURIComponent(character.name)}`;

            const [newImage] = await db.insert(images).values({
                characterId: characterId,
                url: placeholderUrl,
                prompt: imagePrompt,
                approved: false,
                generatedBy: 'placeholder',
            }).returning();

            return NextResponse.json({
                success: true,
                image: newImage,
                warning: 'Image generation failed, using placeholder',
                error: imageError.message,
            });
        }

    } catch (error: any) {
        console.error('❌ Error in character image generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate image', details: error.message },
            { status: 500 }
        );
    }
}
