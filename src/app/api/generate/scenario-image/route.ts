import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scenarios, characters, images } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';

// Version: 3.0 - Using Gemini 2.5 Flash Image
const API_VERSION = '3.0-gemini-flash-image';

export async function POST(request: NextRequest) {
    try {
        const { scenarioId } = await request.json();

        if (!scenarioId) {
            return NextResponse.json(
                { error: 'Scenario ID is required' },
                { status: 400 }
            );
        }

        console.log(`🎨 Generating image for scenario ${scenarioId}...`);
        console.log(`📌 API Version: ${API_VERSION}`);

        // Get the scenario
        const scenario = await db.query.scenarios.findFirst({
            where: eq(scenarios.id, scenarioId),
        });

        if (!scenario) {
            return NextResponse.json(
                { error: 'Scenario not found' },
                { status: 404 }
            );
        }

        // Get the characters involved in this scenario
        const characterIds = JSON.parse(scenario.characterIds);
        const scenarioCharacters = await db.query.characters.findMany({
            where: inArray(characters.id, characterIds),
        });

        // Build a detailed prompt for image generation
        const characterDescriptions = scenarioCharacters
            .map(char => `${char.name} (${char.species}) - ${char.roleAndVibe}`)
            .join(', ');

        const imagePrompt = `Cinematic scene from PocketRot universe: ${scenario.title}

Setting: ${scenario.location}
Mission: ${scenario.mission}

Characters (all exactly 4.20 inches tall): ${characterDescriptions}

${scenario.description}

Art style: Dramatic cinematic composition with a slightly surreal, VHS-tape aesthetic. Vibrant, saturated colors with subtle glitch effects. Show the extreme scale difference - these tiny characters in a massive human world. The scene should feel epic and dramatic despite the mundane mission. Photorealistic but with intentional glitch artifacts and analog video distortion.`;

        console.log('📝 Image prompt:', imagePrompt);

        // Generate image using Google's Imagen API
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not found');
            }

            console.log('🎨 Calling Imagen API...');

            // Use Gemini 2.5 Flash Image (Imagen models not available via Gemini API)
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
                        }]
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Imagen API error:', errorText);
                throw new Error(`Imagen API failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Image generated successfully');
            console.log('📦 Response data:', JSON.stringify(data, null, 2));

            // Extract the base64 image data from generateContent response
            // Response format: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
            let imageData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (!imageData) {
                console.error('❌ Response structure:', JSON.stringify(data, null, 2));
                throw new Error('No image data in response');
            }

            // Convert base64 to buffer
            const buffer = Buffer.from(imageData, 'base64');

            // Upload to Vercel Blob storage
            const filename = `scenario-${scenarioId}-${Date.now()}.png`;
            console.log('☁️ Uploading to Vercel Blob...');

            const blob = await put(filename, buffer, {
                access: 'public',
                contentType: 'image/png',
            });

            const imageUrl = blob.url;
            console.log('💾 Image uploaded to:', imageUrl);

            // Store the image in the database
            const [newImage] = await db.insert(images).values({
                scenarioId: scenarioId,
                url: imageUrl,
                prompt: imagePrompt,
                generatedBy: 'gemini-2.5-flash-image',
            }).returning();

            console.log('✅ Image record created:', newImage.id);

            return NextResponse.json({
                success: true,
                image: newImage,
            });

        } catch (imageError: any) {
            console.error('❌ Image generation failed:', imageError);

            // Fallback to placeholder if image generation fails
            const placeholderUrl = `https://placehold.co/1024x576/1a1a2e/e94560?text=Scenario+${scenarioId}`;

            const [newImage] = await db.insert(images).values({
                scenarioId: scenarioId,
                url: placeholderUrl,
                prompt: imagePrompt,
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
        console.error('❌ Error in scenario image generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate image', details: error.message },
            { status: 500 }
        );
    }
}
