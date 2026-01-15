import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCharacter } from '@/lib/gemini';
import { db } from '@/db';
import { characters } from '@/db/schema';

export async function POST() {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🎨 Generating new character with Gemini...');

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

        console.log(`✅ Created character: ${newCharacter.name}`);

        return NextResponse.json({
            success: true,
            character: newCharacter
        });

    } catch (error) {
        console.error('❌ Error generating character:', error);
        return NextResponse.json(
            { error: 'Failed to generate character' },
            { status: 500 }
        );
    }
}
