import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function GET() {
    try {
        // Test database connection by querying users
        const allUsers = await db.select().from(users);

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            userCount: allUsers.length,
            users: allUsers,
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
