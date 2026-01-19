import React from 'react';
"use client";

import { motion } from "framer-motion";
import React from "react";

export function AudioVisualizer({ isRecording = true }: { isRecording?: boolean }) {
    // Simulate 30 bars for the visualizer
    const bars = Array.from({ length: 30 });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-12 w-full" />; // Prevent hydration mismatch

    return (
        <div className="flex items-center justify-center gap-1 h-12 w-full overflow-hidden">
            {bars.map((_, index) => (
                <motion.div
                    key={index}
                    className="w-1 rounded-full bg-[var(--color-champagne-gold)]"
                    animate={isRecording ? {
                        height: [
                            "10%",
                            `${Math.random() * 80 + 20}%`,
                            "10%"
                        ],
                        opacity: [0.3, 1, 0.3],
                    } : {
                        height: "10%",
                        opacity: 0.3
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: index * 0.05, // Stagger effect
                    }}
                />
            ))}
        </div>
    );
}
