import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scenarios, characters, videos, images } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { GoogleAuth } from 'google-auth-library';

// Version: 8.0 - Using Vertex AI REST API for video generation with reference images
const API_VERSION = '8.0-vertex-ai-rest';

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

        // Generate video using Vertex AI REST API
        try {
            const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

            if (!projectId || !credentialsJson) {
                throw new Error('Missing required Vertex AI credentials');
            }

            // Parse credentials
            const credentials = JSON.parse(credentialsJson);

            // Get access token using GoogleAuth
            const auth = new GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });

            const client = await auth.getClient();
            const accessToken = await client.getAccessToken();

            if (!accessToken.token) {
                throw new Error('Failed to get access token');
            }

            console.log('✅ Got access token');

            // Prepare the instance
            const instance: any = {
                prompt: videoPrompt,
            };

            // Add reference image if available
            if (scenarioImage) {
                console.log('🖼️ Fetching reference image from:', scenarioImage.url);
                try {
                    const imageResponse = await fetch(scenarioImage.url);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

                    console.log('📊 Base64 length:', imageBase64.length);

                    // Add reference image
                    instance.referenceImages = [{
                        referenceType: 'asset',
                        image: {
                            bytesBase64Encoded: imageBase64,
                            mimeType: 'image/png'
                        }
                    }];
                    console.log('✅ Reference image included in Vertex AI request');
                } catch (imageError) {
                    console.warn('⚠️ Could not fetch reference image, proceeding without it:', imageError);
                }
            }

            // Parameters for video generation
            const parameters = {
                aspectRatio: '16:9',
                sampleCount: 1,
            };

            const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo-3.1-generate-preview:predict`;

            console.log('🎬 Calling Vertex AI REST API...');
            console.log('📍 Endpoint:', endpoint);

            // Make the prediction request
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [instance],
                    parameters,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Vertex AI error:', errorText);
                throw new Error(`Vertex AI failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Vertex AI Response:', JSON.stringify(data, null, 2));

            // Extract video data from response
            if (data.predictions && data.predictions.length > 0) {
                const prediction = data.predictions[0];

                console.log('📦 Prediction:', JSON.stringify(prediction, null, 2));

                // Try to extract video data
                const videoData = prediction.video?.bytesBase64Encoded ||
                    prediction.bytesBase64Encoded;

                if (videoData) {
                    console.log('✅ Video data received from Vertex AI');

                    // Convert base64 to buffer
                    const videoBuffer = Buffer.from(videoData, 'base64');

                    // Upload to Vercel Blob storage
                    const filename = `scenario-${scenarioId}-${Date.now()}.mp4`;
                    console.log('☁️ Uploading to Vercel Blob...');

                    const blob = await put(filename, videoBuffer, {
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
                        generatedBy: 'veo-3.1-vertex-ai',
                    }).returning();

                    console.log('✅ Video record created:', newVideo.id);

                    return NextResponse.json({
                        success: true,
                        video: newVideo,
                    });
                } else {
                    console.error('❌ No video data in Vertex AI response');
                    console.error('Response structure:', JSON.stringify(data, null, 2));
                    throw new Error('Vertex AI did not return video data');
                }
            } else {
                throw new Error('No predictions in Vertex AI response');
            }

        } catch (videoError: any) {
            console.error('❌ Video generation failed:', videoError);
            console.error('Error details:', videoError.message);

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
