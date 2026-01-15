import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { scenarios } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allScenarios = await db
            .select()
            .from(scenarios)
            .orderBy(desc(scenarios.createdAt));

        return NextResponse.json({ scenarios: allScenarios });

    } catch (error) {
        console.error('Error fetching scenarios:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scenarios' },
            { status: 500 }
        );
    }
}
