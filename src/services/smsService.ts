export interface SMSRequest {
    to: string;
    body: string;
    type: "LMS" | "SMS"; // Allow for Long Message Service or Short Message Service
}

export interface SMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Sends an SMS message to a recipient.
 * This is currently a mock implementation that simulates an API call.
 * To integrate with a real provider (e.g., Twilio, CoolSMS), replace the internal logic with an API request.
 */
export async function sendSMS(request: SMSRequest): Promise<SMSResponse> {
    console.log(`[SMS Service] Sending ${request.type} to ${request.to}: ${request.body}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate success
    // In a real app, you would verify the API response here
    return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
}

/**
 * Sends a pre-formatted appointment reminder.
 */
export async function sendAppointmentReminder(to: string, clientName: string, date: string, time: string): Promise<SMSResponse> {
    const body = `[Hana Mindcare] ${clientName}님, 내일(${date}) ${time}에 상담 예약이 있습니다. 변동 사항이 있으시면 미리 연락 부탁드립니다.`;
    return sendSMS({
        to,
        body,
        type: "SMS",
    });
}
