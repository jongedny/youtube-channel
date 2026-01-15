import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { characters } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allCharacters = await db
            .select()
            .from(characters)
            .orderBy(desc(characters.isOriginal), desc(characters.createdAt));

        return NextResponse.json({ characters: allCharacters });

    } catch (error) {
        console.error('Error fetching characters:', error);
        return NextResponse.json(
            { error: 'Failed to fetch characters' },
            { status: 500 }
        );
    }
}
