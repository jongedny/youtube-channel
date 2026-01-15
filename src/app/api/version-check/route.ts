import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Code version check',
        modelName: 'imagen-4.0-generate-001',
        endpoint: 'generateContent',
        timestamp: new Date().toISOString(),
        commitHash: '932ecc2',
    });
}
