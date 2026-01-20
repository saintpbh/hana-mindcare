import { createZoomMeeting } from './zoom';
import { getSettings } from '@/app/actions/settings';

export type MeetingProvider = 'zoom' | 'jitsi' | 'personal';

export async function generateMeetingLink(topic: string, startTime: Date, duration: number) {
    // 1. Fetch meeting settings
    const settingsRes = await getSettings(['MEETING_PROVIDER', 'PERSONAL_MEETING_LINK']);
    const settings = settingsRes.data || {};

    const provider = (settings['MEETING_PROVIDER'] || 'jitsi') as MeetingProvider;
    const personalLink = settings['PERSONAL_MEETING_LINK'];

    console.log(`Generating meeting link using provider: ${provider}`);

    switch (provider) {
        case 'zoom':
            // Existing Zoom API logic (requires Pro usually for API)
            return await createZoomMeeting(topic, startTime, duration);

        case 'personal':
            // Use a fixed personal link if provided, otherwise fallback
            if (personalLink) return personalLink;
            console.warn("Personal link selected but no URL found in settings. Falling back to Jitsi.");
        // Fallthrough to Jitsi

        case 'jitsi':
        default:
            // Jitsi Meet: Completely free, no account needed, no time limit
            // We create a unique room name based on the topic and timestamp to avoid collisions
            const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '-');
            const uniqueId = Math.random().toString(36).substring(2, 7);
            const roomName = `HanaMindcare-${safeTopic}-${uniqueId}`;
            return `https://meet.jit.si/${encodeURIComponent(roomName)}`;
    }
}
