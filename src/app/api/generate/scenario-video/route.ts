import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scenarios, characters, videos, images } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Version: 7.0 - Using Google Generative AI SDK for video generation
const API_VERSION = '7.0-veo-sdk';

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

        // Generate video using Google Generative AI SDK
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not found');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'veo-3.1-generate-preview' });

            console.log('🎬 Calling Veo API via SDK...');

            // Prepare request parts
            const parts: any[] = [{ text: videoPrompt }];

            // Add reference image if available
            if (scenarioImage) {
                console.log('🖼️ Fetching reference image from:', scenarioImage.url);
                try {
                    const imageResponse = await fetch(scenarioImage.url);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

                    console.log('📊 Base64 length:', imageBase64.length);

                    // Add inline data for reference image
                    parts.push({
                        inlineData: {
                            mimeType: 'image/png',
                            data: imageBase64
                        }
                    });
                    console.log('✅ Reference image included in SDK request');
                } catch (imageError) {
                    console.warn('⚠️ Could not fetch reference image, proceeding without it:', imageError);
                }
            }

            // Generate content (this should start the async operation)
            console.log('⏳ Starting video generation...');
            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
            });

            console.log('📦 SDK Response:', JSON.stringify(result, null, 2));

            // The SDK might return the operation differently
            // Let's see what we get and handle it
            const response = result.response;

            // Try to extract video data or operation info
            if (response.candidates && response.candidates[0]) {
                const candidate = response.candidates[0];
                console.log('📦 Candidate:', JSON.stringify(candidate, null, 2));

                // Check if there's inline video data
                if (candidate.content?.parts?.[0]?.inlineData) {
                    const videoData = candidate.content.parts[0].inlineData.data;
                    const mimeType = candidate.content.parts[0].inlineData.mimeType || 'video/mp4';

                    console.log('✅ Video data received inline');

                    // Convert base64 to buffer
                    const videoBuffer = Buffer.from(videoData, 'base64');

                    // Upload to Vercel Blob storage
                    const filename = `scenario-${scenarioId}-${Date.now()}.mp4`;
                    console.log('☁️ Uploading to Vercel Blob...');

                    const blob = await put(filename, videoBuffer, {
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
                        generatedBy: 'veo-3.1-preview-sdk',
                    }).returning();

                    console.log('✅ Video record created:', newVideo.id);

                    return NextResponse.json({
                        success: true,
                        video: newVideo,
                    });
                } else {
                    // If not inline, might need to poll or get operation
                    console.error('❌ No inline video data found in response');
                    console.error('Response structure:', JSON.stringify(response, null, 2));
                    throw new Error('SDK did not return video data in expected format');
                }
            } else {
                throw new Error('No candidates in SDK response');
            }

        } catch (videoError: any) {
            console.error('❌ Video generation failed:', videoError);
            console.error('Error details:', videoError.message);
            if (videoError.response) {
                console.error('Error response:', JSON.stringify(videoError.response, null, 2));
            }

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
