"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <FileQuestion className="w-10 h-10 text-[var(--color-midnight-navy)]" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-neutral-800 mb-3 font-serif"
                >
                    페이지를 찾을 수 없습니다
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-500 mb-8 leading-relaxed"
                >
                    요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. 주소를 다시 확인해주세요.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="w-full h-12 bg-white border border-neutral-200 text-neutral-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        이전 페이지로
                    </button>

                    <Link
                        href="/"
                        className="w-full h-12 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-900/20"
                    >
                        <Home className="w-4 h-4" />
                        홈으로 이동
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
