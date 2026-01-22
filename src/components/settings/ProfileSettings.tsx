"use client";

import { useState, useEffect } from "react";
import { updateProfile, getProfile } from "@/app/actions/profile";
import { useAuth } from "@/hooks/useAuth";

export function ProfileSettings() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        specialties: [] as string[],
        qualifications: [] as string[],
    });

    const [newSpecialty, setNewSpecialty] = useState("");
    const [newQualification, setNewQualification] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const result = await getProfile();
        if (result.success && result.user) {
            setFormData({
                name: result.user.name || "",
                phone: result.user.phone || "",
                specialties: result.user.specialties || [],
                qualifications: result.user.qualifications || [],
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage("");

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage("프로필이 성공적으로 업데이트되었습니다.");
            setIsEditing(false);
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage(result.error || "업데이트에 실패했습니다.");
        }

        setIsSaving(false);
    };

    const addSpecialty = () => {
        if (newSpecialty.trim()) {
            setFormData({
                ...formData,
                specialties: [...formData.specialties, newSpecialty.trim()],
            });
            setNewSpecialty("");
        }
    };

    const removeSpecialty = (index: number) => {
        setFormData({
            ...formData,
            specialties: formData.specialties.filter((_, i) => i !== index),
        });
    };

    const addQualification = () => {
        if (newQualification.trim()) {
            setFormData({
                ...formData,
                qualifications: [...formData.qualifications, newQualification.trim()],
            });
            setNewQualification("");
        }
    };

    const removeQualification = (index: number) => {
        setFormData({
            ...formData,
            qualifications: formData.qualifications.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-midnight-navy)]">
                    계정 정보
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm bg-[var(--color-midnight-navy)] text-white rounded-lg hover:opacity-90"
                    >
                        수정
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("성공") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                {/* 이름 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-midnight-navy)] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                </div>

                {/* 이메일 (읽기 전용) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                    </label>
                    <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
                </div>

                {/* 전화번호 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        전화번호
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="010-0000-0000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-midnight-navy)] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                </div>

                {/* 전문 분야 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        전문 분야
                    </label>
                    <div className="space-y-2">
                        {formData.specialties.map((specialty, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                    {specialty}
                                </span>
                                {isEditing && (
                                    <button
                                        onClick={() => removeSpecialty(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSpecialty}
                                    onChange={(e) => setNewSpecialty(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                                    placeholder="예: 불안장애, 우울증"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                    onClick={addSpecialty}
                                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                                >
                                    추가
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 자격증 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        자격증
                    </label>
                    <div className="space-y-2">
                        {formData.qualifications.map((qualification, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                                    {qualification}
                                </span>
                                {isEditing && (
                                    <button
                                        onClick={() => removeQualification(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newQualification}
                                    onChange={(e) => setNewQualification(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addQualification()}
                                    placeholder="예: 임상심리사 1급, EMDR"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                    onClick={addQualification}
                                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                                >
                                    추가
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 버튼 */}
                {isEditing && (
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-[var(--color-midnight-navy)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {isSaving ? "저장 중..." : "저장"}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                loadProfile();
                            }}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            취소
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
