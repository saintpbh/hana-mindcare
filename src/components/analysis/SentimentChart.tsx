"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { time: '00:00', sentiment: 40, label: 'Start' },
    { time: '05:00', sentiment: 35, label: 'Anxiety' },
    { time: '10:00', sentiment: 45, label: 'Opening Up' },
    { time: '15:00', sentiment: 30, label: 'Crisis' },
    { time: '20:00', sentiment: 55, label: 'Resolution' },
    { time: '25:00', sentiment: 65, label: 'Calm' },
    { time: '30:00', sentiment: 75, label: 'End' },
];

export function SentimentChart() {
    return (
        <div className="w-full h-[300px] bg-white rounded-2xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-midnight-navy)]">
                    Emotional Journey Map
                </h3>
                <div className="flex items-center gap-4 text-sm text-[var(--color-midnight-navy)]/60">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-champagne-gold)]" />
                        Positive
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-midnight-navy)]/20" />
                        Stress
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1A1F2C', opacity: 0.4, fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            padding: '12px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#D4AF37"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSentiment)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
