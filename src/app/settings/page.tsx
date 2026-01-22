"use client";

import { useState, useEffect } from "react";
import { User, Bell, Monitor, Globe, Shield, LogOut, Camera, ChevronRight, Moon, Sun, Type, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { sendAppointmentReminder } from "@/services/smsService";
import { ProfileSettings } from "@/components/settings/ProfileSettings";


const TABS = [
    { id: "account", label: "계정 (Account)", icon: User },
    { id: "notifications", label: "알림 (Notifications)", icon: Bell },
    { id: "display", label: "화면 (Display)", icon: Monitor },
    { id: "general", label: "일반 (General)", icon: Globe },
    { id: "locations", label: "상담 장소 (Locations)", icon: MapPinIcon },
    { id: "counselors", label: "상담사 관리 (Counselors)", icon: Users },
    { id: "ai", label: "AI 설정 (Intelligence)", icon: Sparkles },
    { id: "zoom", label: "회의 연동 (Meetings)", icon: Video },
];

import { MapPin as MapPinIcon, Plus, Trash2, Video, Users } from "lucide-react";
import { getLocations, addLocation, deleteLocation } from "@/app/actions/locations";
import { saveSetting, getSetting } from "@/app/actions/settings";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">설정 (Settings)</h1>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">앱 환경설정 및 계정 정보를 관리합니다.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="space-y-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-[var(--color-midnight-navy)] text-white shadow-lg shadow-[var(--color-midnight-navy)]/20"
                                        : "bg-white text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5 hover:text-[var(--color-midnight-navy)]"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm p-8 min-h-[500px]"
                        >
                            {activeTab === "account" && <ProfileSettings />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "display" && <DisplaySettings />}
                            {activeTab === "general" && <GeneralSettings />}
                            {activeTab === "locations" && <LocationManagement />}
                            {activeTab === "counselors" && <CounselorManagement />}
                            {activeTab === "ai" && <AISettings />}
                            {activeTab === "zoom" && <ZoomSettings />}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ... existing components ...

function ZoomSettings() {
    const [provider, setProvider] = useState<"zoom" | "jitsi" | "personal">("jitsi");
    const [personalLink, setPersonalLink] = useState("");
    const [accountId, setAccountId] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load settings from DB
        const load = async () => {
            const prov = await getSetting('MEETING_PROVIDER');
            const plink = await getSetting('PERSONAL_MEETING_LINK');
            const acc = await getSetting('ZOOM_ACCOUNT_ID');
            const cli = await getSetting('ZOOM_CLIENT_ID');
            const sec = await getSetting('ZOOM_CLIENT_SECRET');

            if (prov.success) setProvider((prov.data as any) || "jitsi");
            if (plink.success) setPersonalLink(plink.data || "");
            if (acc.success) setAccountId(acc.data || "");
            if (cli.success) setClientId(cli.data || "");
            if (sec.success) setClientSecret(sec.data || "");
            setIsLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        await saveSetting('MEETING_PROVIDER', provider);
        await saveSetting('PERSONAL_MEETING_LINK', personalLink);
        await saveSetting('ZOOM_ACCOUNT_ID', accountId);
        await saveSetting('ZOOM_CLIENT_ID', clientId);
        await saveSetting('ZOOM_CLIENT_SECRET', clientSecret);
        setIsLoading(false);
        alert("회의 연동 설정이 저장되었습니다.");
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">비대면 회의 연동 설정</h3>
                <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-8 leading-relaxed">
                    상담 예약 시 자동으로 생성될 화상 회의 방식을 선택하세요. <br />
                    <strong>줌 프로 버전이 없는 경우 Jitsi Meet(무료)</strong>를 권장합니다.
                </p>

                <div className="space-y-8">
                    {/* Provider Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-[var(--color-midnight-navy)]">회의 방식 선택</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setProvider("jitsi")}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all",
                                    provider === "jitsi"
                                        ? "border-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 ring-1 ring-[var(--color-midnight-navy)]"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="font-bold text-[var(--color-midnight-navy)] mb-1">Jitsi Meet (추천)</div>
                                <div className="text-xs text-green-600 font-medium italic">완전 무료 / 무제한</div>
                                <div className="text-[10px] text-gray-500 mt-1">로그인 없이 즉시 사용 가능한 오픈소스 방식</div>
                            </button>

                            <button
                                onClick={() => setProvider("personal")}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all",
                                    provider === "personal"
                                        ? "border-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 ring-1 ring-[var(--color-midnight-navy)]"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="font-bold text-[var(--color-midnight-navy)] mb-1">고정 개인 링크</div>
                                <div className="text-xs text-amber-600 font-medium italic">줌 무료 버전용</div>
                                <div className="text-[10px] text-gray-500 mt-1">본인의 고정 줌 링크(PMI)를 상담에 사용</div>
                            </button>

                            <button
                                onClick={() => setProvider("zoom")}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all",
                                    provider === "zoom"
                                        ? "border-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 ring-1 ring-[var(--color-midnight-navy)]"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="font-bold text-[var(--color-midnight-navy)] mb-1">Zoom API 연동</div>
                                <div className="text-xs text-blue-600 font-medium italic">줌 프로 이상 필요</div>
                                <div className="text-[10px] text-gray-500 mt-1">상담마다 고유한 회의실 링크 자동 생성</div>
                            </button>
                        </div>
                    </div>

                    {provider === "personal" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-200"
                        >
                            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider">개인 상담 링크 URL</label>
                            <input
                                type="url"
                                value={personalLink}
                                onChange={(e) => setPersonalLink(e.target.value)}
                                placeholder="https://zoom.us/j/me/..."
                                className="w-full p-3 rounded-lg border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <p className="text-[10px] text-amber-700">모든 상담 예약에 이 링크가 동일하게 전송됩니다.</p>
                        </motion.div>
                    )}

                    {provider === "zoom" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 border-l-4 border-blue-500 pl-4 py-2"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">Account ID</label>
                                <input
                                    type="text"
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    placeholder="Zoom Account ID"
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">Client ID</label>
                                <input
                                    type="text"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    placeholder="Zoom App Client ID"
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">Client Secret</label>
                                <input
                                    type="password"
                                    value={clientSecret}
                                    onChange={(e) => setClientSecret(e.target.value)}
                                    placeholder="Zoom App Client Secret"
                                    className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                                />
                            </div>
                        </motion.div>
                    )}

                    {provider === "jitsi" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-50 rounded-xl border border-green-200"
                        >
                            <p className="text-sm text-green-800">
                                <strong>Jitsi Meet</strong>는 별도의 설정 없이 바로 사용 가능합니다. <br />
                                상담 예약 시마다 고유한 무료 회의실 링크가 생성됩니다.
                            </p>
                        </motion.div>
                    )}

                    <div className="pt-6">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[var(--color-midnight-navy)] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "저장 중..." : "회의 설정 저장하기"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountSettings() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-[var(--color-midnight-navy)]/5">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 border-4 border-white shadow-md" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-midnight-navy)]">Dr. Sarah Kim</h3>
                    <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-2">임상 심리 전문가</p>
                    <button className="text-xs text-[var(--color-champagne-gold)] font-medium hover:underline">프로필 사진 변경</button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">이름</label>
                        <input type="text" defaultValue="Sarah Kim" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">직함</label>
                        <input type="text" defaultValue="임상 심리 전문가" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">이메일</label>
                        <input type="email" defaultValue="sarah.kim@hanacare.com" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">전문 분야</label>
                        <input type="text" defaultValue="인지행동치료, 트라우마" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--color-midnight-navy)]/5">
                    <h4 className="flex items-center gap-2 font-medium text-[var(--color-midnight-navy)] mb-4">
                        <Shield className="w-4 h-4" /> 보안
                    </h4>
                    <button className="text-sm text-[var(--color-midnight-navy)]/70 hover:text-[var(--color-midnight-navy)] flex items-center justify-between w-full p-3 rounded-xl hover:bg-[var(--color-midnight-navy)]/5 transition-colors text-left">
                        비밀번호 변경
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button className="text-sm text-rose-500 hover:text-rose-600 flex items-center justify-between w-full p-3 rounded-xl hover:bg-rose-50 transition-colors text-left font-medium mt-2">
                        로그아웃
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings() {
    // Initialize with safe defaults, then hydrate from localStorage
    const [toggles, setToggles] = useState({
        sessionReminder: true,
        communityAlerts: true,
        marketing: false,
        emailDigest: true,
        autoSms: false // New Toggle
    });

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("notification_settings");
        if (saved) {
            setToggles(JSON.parse(saved));
        }
    }, []);

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem("notification_settings", JSON.stringify(next));

            // Show toast/alert for feedback based on Auto SMS
            if (key === 'autoSms') {
                if (next.autoSms) alert("자동 발송이 활성화되었습니다. (세션 30분 전 자동 발송)");
                else alert("자동 발송이 꺼졌습니다. 수동으로 문자를 발송해야 합니다.");
            }
            return next;
        });
    };

    const handleTestReminder = async () => {
        const response = await sendAppointmentReminder("010-1234-5678", "홍길동", "10월 24일", "오후 2시");
        if (response.success) {
            alert("테스트 알림이 전송되었습니다. (콘솔 확인)");
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">알림 설정</h3>

            <div className="space-y-6">
                <div className="p-4 bg-[var(--color-midnight-navy)]/5 rounded-xl border border-[var(--color-midnight-navy)]/10">
                    <ToggleItem
                        label="리마인드 문자 자동 발송"
                        desc="상담 30분 전에 환자에게 안내 문자를 자동으로 발송합니다."
                        checked={toggles.autoSms}
                        onChange={() => handleToggle("autoSms")}
                    />
                </div>

                <ToggleItem
                    label="세션 알림 (의사용)"
                    desc="예정된 상담 세션 10분 전에 앱 푸시 알림을 받습니다."
                    checked={toggles.sessionReminder}
                    onChange={() => handleToggle("sessionReminder")}
                />
                <ToggleItem
                    label="커뮤니티 활동"
                    desc="내 게시글에 댓글이 달리거나 좋아요를 받으면 알림을 받습니다."
                    checked={toggles.communityAlerts}
                    onChange={() => handleToggle("communityAlerts")}
                />
                <ToggleItem
                    label="이메일 요약"
                    desc="매주 월요일 아침에 주간 일정과 인사이트 요약을 이메일로 받습니다."
                    checked={toggles.emailDigest}
                    onChange={() => handleToggle("emailDigest")}
                />
                <ToggleItem
                    label="마케팅 정보 수신"
                    desc="새로운 기능 업데이트 및 이벤트 소식을 받습니다."
                    checked={toggles.marketing}
                    onChange={() => handleToggle("marketing")}
                />

                <div className="pt-6 border-t border-[var(--color-midnight-navy)]/5">
                    <h4 className="flex items-center gap-2 font-medium text-[var(--color-midnight-navy)] mb-4">
                        테스트 (Test)
                    </h4>
                    <button
                        onClick={handleTestReminder}
                        className="py-2 px-4 bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] rounded-lg text-sm font-medium hover:bg-[var(--color-midnight-navy)]/10 transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        예약 알림 자동 발송 테스트
                    </button>
                </div>
            </div>
        </div>
    );
}

function DisplaySettings() {
    const { title, logoStartColor, logoEndColor, updateBranding } = useBranding();
    const [localTitle, setLocalTitle] = useState(title);
    const [localStart, setLocalStart] = useState(logoStartColor);
    const [localEnd, setLocalEnd] = useState(logoEndColor);

    const handleSave = async () => {
        await updateBranding({
            title: localTitle,
            logoStartColor: localStart,
            logoEndColor: localEnd
        });
        alert("브랜드 설정이 저장되었습니다.");
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">화면 설정</h3>

            <div className="space-y-8">
                {/* Branding Settings */}
                <div className="space-y-6 pb-8 border-b border-[var(--color-midnight-navy)]/5">
                    <h4 className="text-sm font-bold text-[var(--color-midnight-navy)] mb-4">브랜드 설정</h4>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">서비스 이름 (App Name)</label>
                        <input
                            type="text"
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">로고 시작 색상 (Tailwind Class)</label>
                            <input
                                type="text"
                                value={localStart}
                                onChange={(e) => setLocalStart(e.target.value)}
                                placeholder="from-blue-500"
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">로고 끝 색상 (Tailwind Class)</label>
                            <input
                                type="text"
                                value={localEnd}
                                onChange={(e) => setLocalEnd(e.target.value)}
                                placeholder="to-cyan-400"
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-[var(--color-midnight-navy)]/5 rounded-xl">
                        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br", localStart, localEnd)} />
                        <span className="font-serif text-xl tracking-wide text-[var(--color-midnight-navy)]">{localTitle}</span>
                        <span className="text-xs text-gray-500 ml-auto">미리보기</span>
                    </div>

                    <button
                        onClick={handleSave}
                        className="bg-[var(--color-midnight-navy)] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors"
                    >
                        브랜드 설정 저장
                    </button>
                </div>


                <div>
                    <label className="block text-sm font-medium text-[var(--color-midnight-navy)] mb-3">테마 설정 (Theme)</label>
                    <div className="grid grid-cols-3 gap-4">
                        <button className="border-2 border-[var(--color-midnight-navy)] bg-white p-4 rounded-xl flex flex-col items-center gap-2 group">
                            <Sun className="w-6 h-6 text-amber-500" />
                            <span className="text-sm font-medium text-[var(--color-midnight-navy)]">라이트 모드</span>
                        </button>
                        <button className="border border-[var(--color-midnight-navy)]/10 bg-[var(--color-midnight-navy)] p-4 rounded-xl flex flex-col items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity">
                            <Moon className="w-6 h-6 text-white" />
                            <span className="text-sm font-medium text-white">다크 모드</span>
                        </button>
                        <button className="border border-[var(--color-midnight-navy)]/10 bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl flex flex-col items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity">
                            <Monitor className="w-6 h-6 text-gray-600" />
                            <span className="text-sm font-medium text-gray-600">시스템 설정</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-midnight-navy)] mb-3 flex items-center gap-2">
                        <Type className="w-4 h-4" /> 글자 크기
                    </label>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-[var(--color-midnight-navy)]" />
                    <div className="flex justify-between text-xs text-[var(--color-midnight-navy)]/60 mt-2">
                        <span>작게</span>
                        <span>보통</span>
                        <span>크게</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-4">일반 설정</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">언어</label>
                        <select className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm">
                            <option>한국어</option>
                            <option>English</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">시간대 (Timezone)</label>
                        <select className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm">
                            <option>Asia/Seoul (GMT+9)</option>
                            <option>America/New_York (GMT-5)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AISettings() {
    const [openaiKey, setOpenaiKey] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [selectedProvider, setSelectedProvider] = useState<"openai" | "gemini">("openai");

    // Load from local storage on mount
    useState(() => {
        if (typeof window !== "undefined") {
            setOpenaiKey(localStorage.getItem("openai_api_key") || "");
            setGeminiKey(localStorage.getItem("gemini_api_key") || "");
            setSelectedProvider((localStorage.getItem("ai_provider") as "openai" | "gemini") || "openai");
        }
    });

    const handleSave = () => {
        localStorage.setItem("openai_api_key", openaiKey);
        localStorage.setItem("gemini_api_key", geminiKey);
        localStorage.setItem("ai_provider", selectedProvider);
        alert("AI 설정이 저장되었습니다.");
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">AI 모델 연동 설정</h3>
                <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-8 leading-relaxed">
                    상담일지 자동 작성을 위해 AI 모델을 연동합니다. <br />
                    API Key는 서버에 저장되지 않고 <strong>브라우저에만 저장</strong>되어 안전합니다.
                </p>

                <div className="space-y-8">
                    {/* Provider Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[var(--color-midnight-navy)]">기본 AI 모델 선택</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedProvider("openai")}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all",
                                    selectedProvider === "openai"
                                        ? "border-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 ring-1 ring-[var(--color-midnight-navy)]"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="font-bold text-[var(--color-midnight-navy)] mb-1">OpenAI (ChatGPT)</div>
                                <div className="text-xs text-gray-500">GPT-4o 모델 사용</div>
                            </button>
                            <button
                                onClick={() => setSelectedProvider("gemini")}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all",
                                    selectedProvider === "gemini"
                                        ? "border-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 ring-1 ring-[var(--color-midnight-navy)]"
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <div className="font-bold text-[var(--color-midnight-navy)] mb-1">Google Gemini</div>
                                <div className="text-xs text-gray-500">Gemini 1.5 Flash 사용</div>
                            </button>
                        </div>
                    </div>

                    {/* API Keys */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">OpenAI API Key</label>
                            <input
                                type="password"
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                            />
                            <p className="text-xs text-gray-400">OpenAI Platform에서 발급받은 키를 입력하세요.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">Gemini API Key</label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm font-mono"
                            />
                            <p className="text-xs text-gray-400">Google AI Studio에서 발급받은 키를 입력하세요.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="bg-[var(--color-midnight-navy)] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors"
                        >
                            설정 저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LocationManagement() {
    const [locations, setLocations] = useState<any[]>([]);
    const [newLocation, setNewLocation] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const res = await getLocations();
        if (res.success) {
            setLocations(res.data || []);
        }
        setIsLoading(false);
    };

    const handleAdd = async () => {
        if (!newLocation.trim()) return;
        const res = await addLocation(newLocation.trim());
        if (res.success) {
            setNewLocation("");
            fetchLocations();
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`'${name}' 장소를 삭제하시겠습니까?`)) {
            const res = await deleteLocation(id);
            if (res.success) {
                fetchLocations();
            }
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">상담 장소 관리</h3>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="새로운 상담 장소 이름 (예: 강남 센터)"
                        className="flex-1 p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-[var(--color-midnight-navy)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        추가
                    </button>
                </div>

                <div className="mt-8">
                    <label className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-4 block">현재 등록된 장소 목록</label>
                    {isLoading ? (
                        <div className="text-sm text-gray-400">로드 중...</div>
                    ) : locations.length === 0 ? (
                        <div className="text-sm text-gray-400 italic bg-gray-50 p-6 rounded-xl border border-dashed text-center">등록된 장소가 없습니다. 초기 장소를 추가해주세요.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {locations.map((loc) => (
                                <div key={loc.id} className="flex items-center justify-between p-4 bg-white border border-[var(--color-midnight-navy)]/5 rounded-xl shadow-sm hover:border-[var(--color-midnight-navy)]/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-[var(--color-midnight-navy)]/5">
                                            <MapPinIcon className="w-4 h-4 text-[var(--color-midnight-navy)]" />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--color-midnight-navy)]">{loc.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(loc.id, loc.name)}
                                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 p-6 bg-[var(--color-warm-white)]/50 rounded-2xl border border-[var(--color-midnight-navy)]/5">
                <h4 className="text-sm font-bold text-[var(--color-midnight-navy)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-champagne-gold)]" /> Tip
                </h4>
                <p className="text-xs text-[var(--color-midnight-navy)]/60 leading-relaxed">
                    여기에서 등록된 장소는 '내담자 예약하기' 팝업의 장소 선택 목록에 즉시 반영됩니다.
                    자주 이용하시는 상담 센터나 지점 이름을 등록해 관리하세요.
                </p>
            </div>
        </div>
    );
}

function ToggleItem({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: () => void }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <h4 className="text-sm font-medium text-[var(--color-midnight-navy)]">{label}</h4>
                <p className="text-xs text-[var(--color-midnight-navy)]/60">{desc}</p>
            </div>
            <button
                onClick={onChange}
                className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                    checked ? "bg-[var(--color-champagne-gold)]" : "bg-gray-200"
                )}
            >
                <div className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    checked ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
        </div>
    );
}

function CounselorManagement() {
    const [counselors, setCounselors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCounselor, setCurrentCounselor] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        nickname: "",
        birthYear: "",
        gender: "여성",
        qualifications: "",
        specialties: "",
        residence: "",
        phoneNumber: ""
    });

    useEffect(() => {
        fetchCounselors();
    }, []);

    const fetchCounselors = async () => {
        const { getCounselors } = await import("@/app/actions/counselors");
        const res = await getCounselors();
        if (res.success) {
            setCounselors(res.data || []);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { createCounselor, updateCounselor } = await import("@/app/actions/counselors");

        const payload = {
            ...formData,
            qualifications: formData.qualifications.split(",").map(s => s.trim()).filter(Boolean),
            specialties: formData.specialties.split(",").map(s => s.trim()).filter(Boolean),
        };

        let res;
        if (currentCounselor) {
            res = await updateCounselor(currentCounselor.id, payload);
        } else {
            res = await createCounselor(payload);
        }

        if (res.success) {
            fetchCounselors();
            setIsEditing(false);
            setCurrentCounselor(null);
            setFormData({
                name: "",
                nickname: "",
                birthYear: "",
                gender: "여성",
                qualifications: "",
                specialties: "",
                residence: "",
                phoneNumber: ""
            });
        } else {
            alert(res.error);
        }
    };

    const handleEdit = (c: any) => {
        setCurrentCounselor(c);
        setFormData({
            name: c.name,
            nickname: c.nickname || "",
            birthYear: c.birthYear || "",
            gender: c.gender || "여성",
            qualifications: c.qualifications.join(", "),
            specialties: c.specialties.join(", "),
            residence: c.residence || "",
            phoneNumber: c.phoneNumber || ""
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`'${name}' 상담사를 삭제하시겠습니까?`)) {
            const { deleteCounselor } = await import("@/app/actions/counselors");
            const res = await deleteCounselor(id);
            if (res.success) fetchCounselors();
        }
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--color-midnight-navy)]">{currentCounselor ? "상담사 정보 수정" : "새 상담사 등록"}</h3>
                    <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:underline">취소</button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">이름 (실명)</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">닉네임 (활동명)</label>
                        <input value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">전화번호</label>
                        <input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="010-0000-0000" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">생년</label>
                        <input value={formData.birthYear} onChange={e => setFormData({ ...formData, birthYear: e.target.value })} placeholder="YYYY" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">성별</label>
                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm">
                            <option value="여성">여성</option>
                            <option value="남성">남성</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">주거지 (시/구)</label>
                        <input value={formData.residence} onChange={e => setFormData({ ...formData, residence: e.target.value })} placeholder="서울 강남구" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">자격증 (쉼표로 구분)</label>
                        <input value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} placeholder="임상심리전문가, 청소년상담사 1급" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">주력 상담 분야 (쉼표로 구분)</label>
                        <input value={formData.specialties} onChange={e => setFormData({ ...formData, specialties: e.target.value })} placeholder="우울, 불안, 트라우마" className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 text-sm" />
                    </div>

                    <div className="col-span-2 pt-4">
                        <button type="submit" className="w-full bg-[var(--color-midnight-navy)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-midnight-navy)]/90 transition-colors">
                            {currentCounselor ? "정보 수정 완료" : "상담사 등록하기"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-midnight-navy)]">상담사 관리</h3>
                    <p className="text-sm text-[var(--color-midnight-navy)]/60">센터 소속 상담사를 등록하고 관리합니다.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCounselor(null); setFormData({ name: "", nickname: "", birthYear: "", gender: "여성", qualifications: "", specialties: "", residence: "", phoneNumber: "" }); }}
                    className="bg-[var(--color-midnight-navy)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> 상담사 등록
                </button>
            </div>

            {isLoading ? (
                <div className="text-sm text-gray-400">로드 중...</div>
            ) : counselors.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
                    <p className="text-gray-400">등록된 상담사가 없습니다.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {counselors.map((c: any) => (
                        <div key={c.id} className="bg-white border border-[var(--color-midnight-navy)]/10 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center text-[var(--color-midnight-navy)] font-bold text-lg">
                                    {c.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[var(--color-midnight-navy)]">{c.name}</span>
                                        {c.nickname && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{c.nickname}</span>}
                                        <span className="text-xs text-gray-400 border-l pl-2 ml-1">{c.phoneNumber}</span>
                                    </div>
                                    <div className="text-xs text-[var(--color-midnight-navy)]/60 mt-1">
                                        {c.qualifications.join(", ")}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">내담자 {c._count?.clients || 0}명</span>
                                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">세션 {c._count?.sessions || 0}건</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(c)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">수정</button>
                                <button onClick={() => handleDelete(c.id, c.name)} className="p-2 hover:bg-rose-50 rounded-lg text-rose-500">삭제</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
