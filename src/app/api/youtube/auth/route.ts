import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, getAuthUrl } from '@/services/youtube';

/**
 * GET /api/youtube/auth
 * Returns the OAuth authorization URL
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // If we have a code, exchange it for tokens
    if (code) {
        try {
            const tokens = await getTokensFromCode(code);

            return NextResponse.json({
                success: true,
                message: 'Authorization successful! Copy the refresh_token below to your .env.local file',
                tokens: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    scope: tokens.scope,
                    token_type: tokens.token_type,
                    expiry_date: tokens.expiry_date,
                },
                instructions: [
                    '1. Copy the refresh_token value',
                    '2. Add it to your .env.local file as YOUTUBE_REFRESH_TOKEN',
                    '3. Restart your development server',
                    '4. You can now upload videos to YouTube!',
                ],
            });
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                error: 'Failed to exchange code for tokens',
                details: error.message,
            }, { status: 500 });
        }
    }

    // Otherwise, return the auth URL
    try {
        const authUrl = getAuthUrl();

        return NextResponse.json({
            message: 'Visit this URL to authorize the application',
            authUrl,
            instructions: [
                '1. Click the authUrl link below',
                '2. Sign in with your YouTube account',
                '3. Grant the requested permissions',
                '4. You will be redirected back with a code',
                '5. The tokens will be displayed for you to save',
            ],
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Failed to generate auth URL',
            details: error.message,
        }, { status: 500 });
    }
}
