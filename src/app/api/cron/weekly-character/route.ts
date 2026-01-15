import { NextResponse } from 'next/server';
import { generateCharacter } from '@/lib/gemini';
import { db } from '@/db';
import { characters } from '@/db/schema';

// This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
// For Vercel: Configure in vercel.json
export async function GET(request: Request) {
    try {
        // Verify the request is from a cron service
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🕐 Weekly character cron triggered');

        // Generate character using Gemini
        const characterData = await generateCharacter();

        // Insert into database
        const [newCharacter] = await db.insert(characters).values({
            name: characterData.name,
            species: characterData.species,
            pocketArtifact: characterData.pocketArtifact,
            roleAndVibe: characterData.roleAndVibe,
            backstory: characterData.backstory,
            isOriginal: false,
            generatedBy: 'gemini'
        }).returning();

        console.log(`✅ Weekly character created: ${newCharacter.name}`);

        return NextResponse.json({
            success: true,
            message: 'Weekly character generated',
            character: newCharacter
        });

    } catch (error) {
        console.error('❌ Error in weekly character cron:', error);
        return NextResponse.json(
            { error: 'Failed to generate weekly character' },
            { status: 500 }
        );
    }
}
