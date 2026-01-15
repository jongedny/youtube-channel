import { NextResponse } from 'next/server';
import { db } from '@/db';
import { images } from '@/db/schema';

export async function GET() {
    try {
        const allImages = await db.select().from(images);

        return NextResponse.json({
            images: allImages,
            count: allImages.length
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}
