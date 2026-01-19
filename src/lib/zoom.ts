import axios from 'axios';

import { getSettings } from '@/app/actions/settings';

const ZOOM_API_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getZoomAccessToken() {
    // Fetch credentials from DB settings first, fallback to env (not recommended for dynamic)
    const settingsRes = await getSettings(['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET']);
    const settings = settingsRes.data || {};

    const accountId = settings['ZOOM_ACCOUNT_ID'] || process.env.ZOOM_ACCOUNT_ID;
    const clientId = settings['ZOOM_CLIENT_ID'] || process.env.ZOOM_CLIENT_ID;
    const clientSecret = settings['ZOOM_CLIENT_SECRET'] || process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        console.warn("Zoom credentials not found in Database or .env");
        return null;
    }

    // Check cache
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post(`${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`, null, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        cachedToken = response.data.access_token;
        // Set expiry to 55 minutes to be safe (token usually valid for 60)
        tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

        return cachedToken;
    } catch (error) {
        console.error("Failed to get Zoom access token:", error);
        return null;
    }
}

export async function createZoomMeeting(topic: string, startTime: Date, duration: number) {
    const token = await getZoomAccessToken();
    if (!token) {
        // Fallback: If no credentials, return a mock link for demo/dev purposes
        // In production, this should throw an error or handle gracefully
        if (process.env.NODE_ENV === 'development') {
            console.warn("Using Mock Zoom Link (Dev Mode)");
            return `https://zoom.us/j/mock-${Date.now()}`;
        }
        return null;
    }

    try {
        const response = await axios.post(`${ZOOM_API_URL}/users/me/meetings`, {
            topic: topic,
            type: 2, // Scheduled meeting
            start_time: startTime.toISOString(),
            duration: duration,
            timezone: 'Asia/Seoul',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                waiting_room: true
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.join_url;
    } catch (error: any) {
        console.error("Failed to create Zoom meeting:", error?.response?.data || error.message);
        return null;
    }
}
