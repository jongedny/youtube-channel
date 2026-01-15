import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { scenarioId, url } = await request.json();

        const [updatedImage] = await db
            .update(images)
            .set({
                url,
                generatedBy: 'imagen-3',
            })
            .where(eq(images.scenarioId, scenarioId))
            .returning();

        return NextResponse.json({
            success: true,
            image: updatedImage,
        });
    } catch (error: any) {
        console.error('Error updating image:', error);
        return NextResponse.json(
            { error: 'Failed to update image', details: error.message },
            { status: 500 }
        );
    }
}
