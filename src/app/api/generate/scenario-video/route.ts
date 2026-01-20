import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scenarios, characters, videos, images } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';

// Version: 2.0 - Using Veo 3.1 Fast with image reference
const API_VERSION = '2.0-veo-3.1-fast-with-image';

export async function POST(request: NextRequest) {
    try {
        const { scenarioId } = await request.json();

        if (!scenarioId) {
            return NextResponse.json(
                { error: 'Scenario ID is required' },
                { status: 400 }
            );
        }

        console.log(`🎬 Generating video for scenario ${scenarioId}...`);
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

        // Get the scenario image for reference
        const scenarioImage = await db.query.images.findFirst({
            where: eq(images.scenarioId, scenarioId),
        });

        // Get the characters involved in this scenario
        const characterIds = JSON.parse(scenario.characterIds);
        const scenarioCharacters = await db.query.characters.findMany({
            where: inArray(characters.id, characterIds),
        });

        // Build a detailed prompt for video generation
        const characterDescriptions = scenarioCharacters
            .map(char => `${char.name} (${char.species}) - ${char.roleAndVibe}`)
            .join(', ');

        const videoPrompt = `Cinematic 8-second video scene from PocketRot universe: ${scenario.title}

Setting: ${scenario.location}
Mission: ${scenario.mission}

Characters (all exactly 4.20 inches tall): ${characterDescriptions}

${scenario.description}

Visual style: Dramatic cinematic shot with VHS-tape aesthetic. Vibrant, saturated colors with subtle glitch effects. Show the extreme scale difference - these tiny characters in a massive human world. The scene should feel epic and dramatic despite the mundane mission. Camera movement should be smooth and cinematic. Include ambient sound effects that match the environment.`;

        console.log('📝 Video prompt:', videoPrompt);

        // Generate video using Veo 3.1 Fast
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not found');
            }

            // Prepare the request parts
            const requestParts: any[] = [{
                text: videoPrompt
            }];

            // If there's an image, fetch it and include as reference
            if (scenarioImage) {
                console.log('🖼️ Fetching reference image from:', scenarioImage.url);
                try {
                    const imageResponse = await fetch(scenarioImage.url);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

                    // Add image as inline data
                    requestParts.push({
                        inlineData: {
                            mimeType: 'image/png',
                            data: imageBase64
                        }
                    });
                    console.log('✅ Reference image included in request');
                } catch (imageError) {
                    console.warn('⚠️ Could not fetch reference image, proceeding without it:', imageError);
                }
            } else {
                console.log('ℹ️ No reference image found for this scenario');
            }

            console.log('🎬 Calling Veo API...');

            // Call Veo 3.1 Fast API
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-001:generateContent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: requestParts
                        }]
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Veo API error:', errorText);
                throw new Error(`Veo API failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Video generated successfully');
            console.log('📦 Response data:', JSON.stringify(data, null, 2));

            // Extract the video data from generateContent response
            // Response format: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
            let videoData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            let mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'video/mp4';

            if (!videoData) {
                console.error('❌ Response structure:', JSON.stringify(data, null, 2));
                throw new Error('No video data in response');
            }

            // Convert base64 to buffer
            const buffer = Buffer.from(videoData, 'base64');

            // Upload to Vercel Blob storage
            const filename = `scenario-${scenarioId}-${Date.now()}.mp4`;
            console.log('☁️ Uploading to Vercel Blob...');

            const blob = await put(filename, buffer, {
                access: 'public',
                contentType: mimeType,
            });

            const videoUrl = blob.url;
            console.log('💾 Video uploaded to:', videoUrl);

            // Store the video in the database
            const [newVideo] = await db.insert(videos).values({
                scenarioId: scenarioId,
                url: videoUrl,
                prompt: videoPrompt,
                generatedBy: 'veo-3.1-fast',
            }).returning();

            console.log('✅ Video record created:', newVideo.id);

            return NextResponse.json({
                success: true,
                video: newVideo,
            });

        } catch (videoError: any) {
            console.error('❌ Video generation failed:', videoError);

            // Return error without creating placeholder
            return NextResponse.json({
                success: false,
                error: videoError.message,
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('❌ Error in scenario video generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate video', details: error.message },
            { status: 500 }
        );
    }
}
