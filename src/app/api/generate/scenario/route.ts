import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateScenario } from '@/lib/gemini';
import { db } from '@/db';
import { scenarios } from '@/db/schema';

export async function POST() {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🎬 Generating new scenario with Gemini...');

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

        console.log(`✅ Created scenario: ${newScenario.title}`);

        return NextResponse.json({
            success: true,
            scenario: newScenario
        });

    } catch (error) {
        console.error('❌ Error generating scenario:', error);
        return NextResponse.json(
            { error: 'Failed to generate scenario' },
            { status: 500 }
        );
    }
}
