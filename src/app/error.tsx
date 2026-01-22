"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    const isAuthError = error.message.includes("인증") || error.message.includes("Auth");

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-neutral-800 mb-3 font-serif"
                >
                    {isAuthError ? "로그인이 필요합니다" : "문제가 발생했습니다"}
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-500 mb-8 leading-relaxed"
                >
                    {isAuthError
                        ? "서비스를 이용하기 위해서는 로그인이 필요합니다. 아래 버튼을 눌러 로그인 페이지로 이동해주세요."
                        : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주시거나, 문제가 지속되면 관리자에게 문의해주세요."}
                    {!isAuthError && (
                        <span className="block mt-2 text-xs text-neutral-400 bg-neutral-100 py-1 px-2 rounded-md font-mono">
                            Error Code: {error.digest || "UNKNOWN_ERROR"}
                        </span>
                    )}
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    {isAuthError ? (
                        <Link
                            href="/login"
                            className="w-full h-12 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-900/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            로그인 페이지로 이동
                        </Link>
                    ) : (
                        <>
                            <button
                                onClick={reset}
                                className="w-full h-12 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-900/20"
                            >
                                <RefreshCw className="w-4 h-4" />
                                다시 시도하기
                            </button>

                            <Link
                                href="/"
                                className="w-full h-12 bg-white border border-neutral-200 text-neutral-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all"
                            >
                                <Home className="w-4 h-4" />
                                홈으로 돌아가기
                            </Link>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
