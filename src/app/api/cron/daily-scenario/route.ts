import { NextResponse } from 'next/server';
import { generateScenario } from '@/lib/gemini';
import { db } from '@/db';
import { scenarios } from '@/db/schema';

// This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
// For Vercel: Configure in vercel.json
export async function GET(request: Request) {
    try {
        // Verify the request is from a cron service
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🕐 Daily scenario cron triggered');

        // Generate scenario using Gemini
        const scenarioData = await generateScenario();

        // Insert into database
        const [newScenario] = await db.insert(scenarios).values({
            title: scenarioData.title,
            description: scenarioData.description,
            characterIds: scenarioData.characterIds,
            location: scenarioData.location,
            mission: scenarioData.mission,
            generatedBy: 'gemini'
        }).returning();

        console.log(`✅ Daily scenario created: ${newScenario.title}`);

        return NextResponse.json({
            success: true,
            message: 'Daily scenario generated',
            scenario: newScenario
        });

    } catch (error) {
        console.error('❌ Error in daily scenario cron:', error);
        return NextResponse.json(
            { error: 'Failed to generate daily scenario' },
            { status: 500 }
        );
    }
}
