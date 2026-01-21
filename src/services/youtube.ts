import { google } from 'googleapis';
import { Readable } from 'stream';

const youtube = google.youtube('v3');

export interface YouTubeUploadOptions {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string; // '22' for People & Blogs, '24' for Entertainment
    privacyStatus?: 'private' | 'public' | 'unlisted';
}

export interface YouTubeUploadResult {
    success: boolean;
    videoId?: string;
    videoUrl?: string;
    error?: string;
}

/**
 * Upload a video to YouTube
 * @param videoBuffer - The video file as a Buffer
 * @param options - Upload options (title, description, etc.)
 * @returns Upload result with video ID and URL
 */
export async function uploadToYouTube(
    videoBuffer: Buffer,
    options: YouTubeUploadOptions
): Promise<YouTubeUploadResult> {
    try {
        // Initialize OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            process.env.YOUTUBE_REDIRECT_URI
        );

        // Set credentials using refresh token
        oauth2Client.setCredentials({
            refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
        });

        // Convert buffer to readable stream
        const videoStream = Readable.from(videoBuffer);

        // Upload video
        const response = await youtube.videos.insert({
            auth: oauth2Client,
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: options.title,
                    description: options.description,
                    tags: options.tags || [],
                    categoryId: options.categoryId || '24', // Entertainment by default
                },
                status: {
                    privacyStatus: options.privacyStatus || 'private',
                },
            },
            media: {
                body: videoStream,
            },
        });

        const videoId = response.data.id;
        if (!videoId) {
            throw new Error('No video ID returned from YouTube');
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        console.log('✅ Video uploaded to YouTube:', videoUrl);

        return {
            success: true,
            videoId,
            videoUrl,
        };
    } catch (error: any) {
        console.error('❌ YouTube upload failed:', error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred',
        };
    }
}

/**
 * Get the authorization URL for OAuth2 flow
 * This is used to get the initial authorization code
 */
export function getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
    );

    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent', // Force consent to get refresh token
    });
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from OAuth2 callback
 * @returns Tokens including refresh_token
 */
export async function getTokensFromCode(code: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}
