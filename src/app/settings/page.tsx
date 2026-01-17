"use client";

import { useState } from "react";
import { User, Bell, Monitor, Globe, Shield, LogOut, Camera, ChevronRight, Moon, Sun, Type, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { sendAppointmentReminder } from "@/services/smsService";

const TABS = [
    { id: "account", label: "계정 (Account)", icon: User },
    { id: "notifications", label: "알림 (Notifications)", icon: Bell },
    { id: "display", label: "화면 (Display)", icon: Monitor },
    { id: "general", label: "일반 (General)", icon: Globe },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">설정 (Settings)</h1>
                    <p className="text-sm text-[var(--color-midnight-navy)]/60">앱 환경설정 및 계정 정보를 관리합니다.</p>
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
                            {activeTab === "account" && <AccountSettings />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "display" && <DisplaySettings />}
                            {activeTab === "general" && <GeneralSettings />}
                        </motion.div>
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
    const [toggles, setToggles] = useState({
        sessionReminder: true,
        communityAlerts: true,
        marketing: false,
        emailDigest: true
    });

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
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
                <ToggleItem
                    label="세션 알림"
                    desc="예정된 상담 세션 10분 전에 알림을 받습니다."
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
    return (
        <div className="space-y-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">화면 설정</h3>

            <div className="space-y-8">
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
        <div className="space-y-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6">일반 설정</h3>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">언어 (Language)</label>
                    <select className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-white text-sm">
                        <option>한국어 (Korean)</option>
                        <option>English</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">날짜 형식 (Date Format)</label>
                    <select className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-white text-sm">
                        <option>YYYY년 MM월 DD일</option>
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">시간대 (Timezone)</label>
                    <select className="w-full p-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-white text-sm">
                        <option>Asia/Seoul (GMT+9)</option>
                        <option>America/New_York (GMT-5)</option>
                    </select>
                </div>
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
