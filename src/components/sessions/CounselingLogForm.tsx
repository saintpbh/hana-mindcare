"use strict";
import { useState, useRef, useEffect } from "react";
import { Save, AlertCircle, CheckCircle, Printer, Sparkles } from "lucide-react";
import { CounselingLogData, upsertCounselingLog, getSessionDetails } from "@/app/actions/sessions";
import { generateCounselingLog } from "@/app/actions/ai";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/contexts/ConfirmContext";

interface CounselingLogFormProps {
    sessionId: string;
    initialData?: CounselingLogData;
}

// Auto-resizing textarea component
const AutoResizeTextarea = ({ value, onChange, disabled, placeholder, className }: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("w-full resize-none overflow-hidden bg-transparent focus:outline-none", className)}
            placeholder={placeholder}
            rows={3}
        />
    );
};

export function CounselingLogForm({ sessionId, initialData }: CounselingLogFormProps) {
    const { confirm } = useConfirm();
    const [formData, setFormData] = useState<CounselingLogData>(initialData || {
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        status: "DRAFT",
        writerName: ""
    });
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "generating">("idle");

    const handleChange = (field: keyof CounselingLogData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setStatus("idle");
    };

    const handleSave = async (targetStatus: "DRAFT" | "FINAL") => {
        if (targetStatus === "FINAL") {
            if (!await confirm("상담일지를 제출하시겠습니까? 제출 후에는 수정이 어려울 수 있습니다.", {
                title: "상담일지 제출",
                confirmText: "제출하기",
                variant: "info"
            })) return;
        }

        setStatus("saving");
        const dataToSave = { ...formData, status: targetStatus };

        const result = await upsertCounselingLog(sessionId, dataToSave as CounselingLogData);

        if (result.success) {
            setFormData(prev => ({ ...prev, status: targetStatus }));
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 3000);
        } else {
            setStatus("error");
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleAutoGenerate = async () => {
        const openaiKey = localStorage.getItem("openai_api_key");
        const geminiKey = localStorage.getItem("gemini_api_key");
        const provider = (localStorage.getItem("ai_provider") as "openai" | "gemini") || "openai";
        const apiKey = provider === "openai" ? openaiKey : geminiKey;

        if (!apiKey) {
            alert("AI 설정이 되어있지 않습니다. 설정 페이지에서 API 키를 입력해주세요.");
            return;
        }

        if (!await confirm("현재 작성된 내용이 AI 생성 내용으로 덮어씌워질 수 있습니다. 계속하시겠습니까?", {
            title: "AI 내용 적용",
            confirmText: "적용하기",
            variant: "default"
        })) return;

        setStatus("generating");

        // Fetch latest transcript
        const sessionRes = await getSessionDetails(sessionId);
        if (!sessionRes.success || !sessionRes.data?.transcript) {
            setStatus("idle");
            alert("축어록(Transcript)이 비어있습니다. 먼저 축어록을 작성해주세요.");
            return;
        }

        const result = await generateCounselingLog(sessionRes.data.transcript, apiKey, provider);

        if (result.success && result.data) {
            setFormData(prev => ({
                ...prev,
                subjective: result.data!.subjective,
                objective: result.data!.objective,
                assessment: result.data!.assessment,
                plan: result.data!.plan,
            }));
            setStatus("idle");
            alert("AI가 상담일지를 자동으로 생성했습니다! 내용을 확인하고 수정해주세요.");
        } else {
            setStatus("idle");
            alert(`생성 실패: ${result.error}`);
        }
    };

    const isFinalized = formData.status === "FINAL";

    return (
        <div className="flex flex-col items-center">
            {/* Toolbar */}
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 px-4">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider",
                        isFinalized ? "bg-[var(--color-midnight-navy)] text-white" : "bg-gray-200 text-gray-600"
                    )}>
                        {formData.status === "FINAL" ? "FINAL DOC" : "DRAFT"}
                    </span>
                    {status === "saved" && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 저장됨</span>}
                    {status === "error" && <span className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> 저장 실패</span>}
                    {status === "generating" && <span className="text-sm text-purple-600 flex items-center gap-1"><Sparkles className="w-4 h-4 animate-spin" /> AI 생성 중...</span>}
                </div>

                <div className="flex items-center gap-2">
                    {!isFinalized && (
                        <button
                            onClick={handleAutoGenerate}
                            disabled={status === "generating"}
                            className="mr-2 px-3 py-1.5 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 flex items-center gap-1 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" /> AI 자동 작성
                        </button>
                    )}

                    <button className="p-2 text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] transition-colors" title="Print">
                        <Printer className="w-5 h-5" />
                    </button>
                    {!isFinalized && (
                        <>
                            <button
                                onClick={() => handleSave("DRAFT")}
                                disabled={status === "saving" || status === "generating"}
                                className="px-3 py-1.5 text-sm font-medium text-[var(--color-midnight-navy)] bg-white border border-[var(--color-midnight-navy)]/10 rounded hover:bg-[var(--color-midnight-navy)]/5"
                            >
                                임시 저장
                            </button>
                            <button
                                onClick={() => handleSave("FINAL")}
                                disabled={status === "saving" || status === "generating"}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-[var(--color-midnight-navy)] rounded hover:bg-[var(--color-midnight-navy)]/90 flex items-center gap-1"
                            >
                                <Save className="w-4 h-4" /> 제출
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* A4 Paper Container */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-lg border border-gray-200">
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-serif font-bold tracking-tight">상담 일지 (Counseling Log)</h1>
                        <p className="text-xs text-gray-500 mt-1">Serene Care Documentation System</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm">
                            <span className="font-bold mr-2">문서 번호:</span>
                            <span className="font-mono text-gray-600 underline decoration-dotted">{sessionId.slice(0, 8)}</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold mr-2">작성 일자:</span>
                            <span className="font-mono text-gray-600">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Form Content - Table Style */}
                <div className="border border-black">
                    {/* Writer Info */}
                    <div className="flex border-b border-black">
                        <div className="w-32 bg-gray-50 p-3 border-r border-black font-bold text-sm flex items-center justify-center">
                            작성자
                        </div>
                        <div className="flex-1 p-2">
                            <input
                                type="text"
                                disabled={isFinalized}
                                value={formData.writerName || ""}
                                onChange={(e) => handleChange("writerName", e.target.value)}
                                className="w-full bg-transparent p-1 focus:outline-none placeholder:text-gray-300"
                                placeholder="상담사 성명"
                            />
                        </div>
                    </div>

                    {/* S */}
                    <div className="border-b border-black flex flex-col">
                        <div className="bg-gray-50 p-2 border-b border-black/10 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg font-serif">S</span>
                            <span>Subjective (주관적 호소)</span>
                        </div>
                        <div className="p-4 min-h-[150px]">
                            <AutoResizeTextarea
                                disabled={isFinalized}
                                value={formData.subjective || ""}
                                onChange={(val) => handleChange("subjective", val)}
                                placeholder="내담자가 호소하는 주관적인 감정, 생각, 경험을 기록하십시오."
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* O */}
                    <div className="border-b border-black flex flex-col">
                        <div className="bg-gray-50 p-2 border-b border-black/10 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg font-serif">O</span>
                            <span>Objective (객관적 관찰)</span>
                        </div>
                        <div className="p-4 min-h-[150px]">
                            <AutoResizeTextarea
                                disabled={isFinalized}
                                value={formData.objective || ""}
                                onChange={(val) => handleChange("objective", val)}
                                placeholder="상담 중 관찰된 행동, 표정, 태도 등 객관적인 사실을 기록하십시오."
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* A */}
                    <div className="border-b border-black flex flex-col">
                        <div className="bg-gray-50 p-2 border-b border-black/10 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg font-serif">A</span>
                            <span>Assessment (분석 및 평가)</span>
                        </div>
                        <div className="p-4 min-h-[150px]">
                            <AutoResizeTextarea
                                disabled={isFinalized}
                                value={formData.assessment || ""}
                                onChange={(val) => handleChange("assessment", val)}
                                placeholder="임상적 소견, 증상의 변화, 상담 진행 상황에 대한 평가를 기록하십시오."
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* P */}
                    <div className="flex flex-col">
                        <div className="bg-gray-50 p-2 border-b border-black/10 font-bold text-sm flex items-center gap-2">
                            <span className="text-lg font-serif">P</span>
                            <span>Plan (향후 계획)</span>
                        </div>
                        <div className="p-4 min-h-[150px]">
                            <AutoResizeTextarea
                                disabled={isFinalized}
                                value={formData.plan || ""}
                                onChange={(val) => handleChange("plan", val)}
                                placeholder="다음 회기 목표, 치료 전략, 과제 부여 등을 기록하십시오."
                                className="text-sm leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-12 flex justify-end">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-serif mb-8">위와 같이 상담 내용을 기록함.</span>
                        <div className="flex items-end gap-4">
                            <span className="font-bold text-sm">상담사:</span>
                            <div className="border-b border-black w-32 text-center pb-1 font-signature text-xl">
                                {formData.writerName}
                            </div>
                            <span className="text-xs text-gray-400">(서명)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
