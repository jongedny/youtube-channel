import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scenarios, characters, videos, images } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';

// Version: 9.0 - Back to working Gemini API (text-to-video only, no reference images)
const API_VERSION = '9.0-gemini-api-text-only';

export async function POST(request: NextRequest) {
    try {
        const { scenarioId, model = 'gemini' } = await request.json();

        if (!scenarioId) {
            return NextResponse.json(
                { error: 'Scenario ID is required' },
                { status: 400 }
            );
        }

        // Validate model parameter
        if (model !== 'gemini' && model !== 'sora') {
            return NextResponse.json(
                { error: 'Invalid model. Must be "gemini" or "sora"' },
                { status: 400 }
            );
        }

        console.log(`🎬 Generating video for scenario ${scenarioId} using ${model}...`);
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

        // Get the scenario image for reference (informational only)
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

        if (scenarioImage) {
            console.log('🖼️ Reference image available:', scenarioImage.url);
            if (model === 'gemini') {
                console.log('ℹ️ Note: Gemini does not support reference images');
            } else {
                console.log('✅ Sora will use this reference image');
            }
        }

        // Route to appropriate video generation service
        if (model === 'sora') {
            return await generateVideoWithSora(scenarioId, videoPrompt, scenarioImage?.url);
        } else {
            return await generateVideoWithGemini(scenarioId, videoPrompt);
        }

    } catch (error: any) {
        console.error('❌ Error in scenario video generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate video', details: error.message },
            { status: 500 }
        );
    }
}

// Gemini/Veo video generation (existing implementation)
async function generateVideoWithGemini(scenarioId: number, videoPrompt: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found');
        }

        // Prepare the request body for Veo (text-only)
        const requestBody = {
            instances: [{
                prompt: videoPrompt
            }],
            parameters: {
                aspectRatio: '16:9',
                sampleCount: 1
            }
        };

        console.log('🎬 Calling Veo API...');

        // Call Veo 3.1 Preview API
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Veo API error:', errorText);
            throw new Error(`Veo API failed: ${response.status} - ${errorText}`);
        }

        const operationData = await response.json();
        const operationName = operationData.name;

        if (!operationName) {
            throw new Error('No operation name returned from Veo API');
        }

        console.log('⏳ Video generation started, operation:', operationName);
        console.log('⏱️ Polling for completion (this may take 30-60 seconds)...');

        // Poll for completion
        let videoUri: string | null = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max (5 second intervals)

        while (!videoUri && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const statusResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
                {
                    headers: {
                        'x-goog-api-key': apiKey,
                    },
                }
            );

            const statusData = await statusResponse.json();

            if (statusData.done) {
                videoUri = statusData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
                if (videoUri) {
                    console.log('✅ Video generation complete!');
                    console.log('📥 Video URI:', videoUri);
                } else {
                    console.error('❌ Operation completed but no video URI found:', JSON.stringify(statusData, null, 2));
                    throw new Error('Video generation completed but no URI returned');
                }
            } else {
                console.log(`⏳ Still generating... (attempt ${attempts}/${maxAttempts})`);
            }
        }

        if (!videoUri) {
            throw new Error('Video generation timed out after 5 minutes');
        }

        // Download the video from the URI
        console.log('📥 Downloading video...');
        const videoResponse = await fetch(videoUri, {
            headers: {
                'x-goog-api-key': apiKey,
            },
        });

        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.status}`);
        }

        const videoBuffer = await videoResponse.arrayBuffer();

        // Upload to Vercel Blob storage
        const filename = `scenario-${scenarioId}-${Date.now()}.mp4`;
        console.log('☁️ Uploading to Vercel Blob...');

        const blob = await put(filename, Buffer.from(videoBuffer), {
            access: 'public',
            contentType: 'video/mp4',
        });

        const videoUrl = blob.url;
        console.log('💾 Video uploaded to:', videoUrl);

        // Store the video in the database
        const [newVideo] = await db.insert(videos).values({
            scenarioId: scenarioId,
            url: videoUrl,
            prompt: videoPrompt,
            generatedBy: 'veo-3.1-preview',
        }).returning();

        console.log('✅ Video record created:', newVideo.id);

        return NextResponse.json({
            success: true,
            video: newVideo,
        });

    } catch (videoError: any) {
        console.error('❌ Gemini video generation failed:', videoError);

        return NextResponse.json({
            success: false,
            error: videoError.message,
        }, { status: 500 });
    }
}

// OpenAI Sora video generation (with reference image support)
async function generateVideoWithSora(scenarioId: number, videoPrompt: string, referenceImageUrl?: string) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not found in environment variables. Please add it to .env.local');
        }

        console.log('🎬 Calling OpenAI Sora API...');

        // Prepare the request body
        const requestBody: any = {
            model: 'sora-1.0-turbo',
            prompt: videoPrompt,
            size: '1920x1080', // 16:9 aspect ratio
        };

        // Add reference image if available
        if (referenceImageUrl) {
            console.log('🖼️ Including reference image:', referenceImageUrl);
            requestBody.image = referenceImageUrl;
        }

        // Call OpenAI Sora API
        const response = await fetch('https://api.openai.com/v1/video/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Sora API error:', errorText);
            throw new Error(`Sora API failed: ${response.status} - ${errorText}`);
        }

        const soraData = await response.json();
        console.log('✅ Sora API response received');

        // Extract video URL from response
        // Note: The actual response structure may vary - adjust based on OpenAI's documentation
        const videoUrl = soraData.data?.[0]?.url || soraData.url;

        if (!videoUrl) {
            throw new Error('No video URL returned from Sora API');
        }

        console.log('📥 Video URL from Sora:', videoUrl);

        // Download and re-upload to Vercel Blob for consistency
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video from Sora: ${videoResponse.status}`);
        }

        const videoBuffer = await videoResponse.arrayBuffer();
        const filename = `scenario-${scenarioId}-sora-${Date.now()}.mp4`;

        console.log('☁️ Uploading to Vercel Blob...');
        const blob = await put(filename, Buffer.from(videoBuffer), {
            access: 'public',
            contentType: 'video/mp4',
        });

        const finalVideoUrl = blob.url;
        console.log('💾 Video uploaded to:', finalVideoUrl);

        // Store the video in the database
        const [newVideo] = await db.insert(videos).values({
            scenarioId: scenarioId,
            url: finalVideoUrl,
            prompt: videoPrompt,
            generatedBy: 'sora-1.0-turbo',
        }).returning();

        console.log('✅ Video record created:', newVideo.id);

        return NextResponse.json({
            success: true,
            video: newVideo,
        });

    } catch (soraError: any) {
        console.error('❌ Sora video generation failed:', soraError);

        return NextResponse.json({
            success: false,
            error: soraError.message,
        }, { status: 500 });
    }
}
