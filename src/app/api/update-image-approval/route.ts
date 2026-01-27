import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { imageId, approved } = await request.json();

        if (imageId === undefined || approved === undefined) {
            return NextResponse.json(
                { error: 'Image ID and approval status are required' },
                { status: 400 }
            );
        }

        console.log(`📝 Updating approval status for image ${imageId} to ${approved}...`);

        // Update the image approval status
        const [updatedImage] = await db
            .update(images)
            .set({ approved })
            .where(eq(images.id, imageId))
            .returning();

        if (!updatedImage) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        console.log('✅ Image approval status updated');

        return NextResponse.json({
            success: true,
            image: updatedImage,
        });

    } catch (error: any) {
        console.error('❌ Error updating image approval:', error);
        return NextResponse.json(
            { error: 'Failed to update approval status', details: error.message },
            { status: 500 }
        );
    }
}
