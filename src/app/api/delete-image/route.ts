import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
    try {
        const { imageId } = await request.json();

        if (!imageId) {
            return NextResponse.json(
                { error: 'Image ID is required' },
                { status: 400 }
            );
        }

        console.log(`🗑️ Deleting image ${imageId}...`);

        // Delete the image from the database
        const deletedImage = await db
            .delete(images)
            .where(eq(images.id, imageId))
            .returning();

        if (!deletedImage || deletedImage.length === 0) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        console.log('✅ Image deleted successfully');

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
        });

    } catch (error: any) {
        console.error('❌ Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image', details: error.message },
            { status: 500 }
        );
    }
}
