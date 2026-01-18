"use server";

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AIProvider = "openai" | "gemini";

interface GenerateLogResponse {
    success: boolean;
    data?: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    error?: string;
}

const SYSTEM_PROMPT = `
You are an expert clinical psychologist assistant. Your task is to analyze a counseling session transcript and generate a structured SOAP note (Subjective, Objective, Assessment, Plan).

Output must be a valid JSON object with the following keys:
- subjective: The client's subjective report (feelings, concerns).
- objective: Objective observations (behavior, appearance, facts).
- assessment: Clinical assessment and analysis.
- plan: Treatment plan and next steps.

Ensure the tone is professional, clinical, and objective. Use Korean for the content.
If the transcript is empty or too short, interpret as best as possible or state that information is insufficient.
`;

export async function generateCounselingLog(
    transcript: string,
    apiKey: string,
    provider: AIProvider
): Promise<GenerateLogResponse> {
    if (!transcript.trim()) {
        return { success: false, error: "축어록 내용이 없습니다." };
    }
    if (!apiKey.trim()) {
        return { success: false, error: "API 키가 설정되지 않았습니다." };
    }

    try {
        if (provider === "openai") {
            return await generateWithOpenAI(transcript, apiKey);
        } else {
            return await generateWithGemini(transcript, apiKey);
        }
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return { success: false, error: error.message || "AI 생성 중 오류가 발생했습니다." };
    }
}

async function generateWithOpenAI(transcript: string, apiKey: string): Promise<GenerateLogResponse> {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Transcript:\n${transcript}` }
        ],
        model: "gpt-4o", // Or gpt-3.5-turbo if prefers cheaper
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) return { success: false, error: "OpenAI 응답이 비어있습니다." };

    try {
        const parsed = JSON.parse(content);
        return { success: true, data: parsed };
    } catch (e) {
        return { success: false, error: "OpenAI 응답을 파싱할 수 없습니다." };
    }
}

async function generateWithGemini(transcript: string, apiKey: string): Promise<GenerateLogResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `${SYSTEM_PROMPT}\n\nTranscript:\n${transcript}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        const parsed = JSON.parse(text);
        return { success: true, data: parsed };
    } catch (e) {
        return { success: false, error: "Gemini 응답을 파싱할 수 없습니다." };
    }
}
