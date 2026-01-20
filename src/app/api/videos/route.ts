import { NextResponse } from 'next/server';
import { db } from '@/db';
import { videos } from '@/db/schema';

export async function GET() {
    try {
        const allVideos = await db.select().from(videos);

        return NextResponse.json({
            videos: allVideos,
            count: allVideos.length
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
