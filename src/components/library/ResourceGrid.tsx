"use client";

import { Play, FileText, Headphones, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Resource {
    id: string;
    title: string;
    author: string;
    type: "audio" | "video" | "article";
    category: string;
    duration: string;
    coverColor: string;
}

interface ResourceGridProps {
    resources: Resource[];
    onSelect: (resource: Resource) => void;
}

export function ResourceGrid({ resources, onSelect }: ResourceGridProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "audio": return Headphones;
            case "video": return Video;
            default: return FileText;
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((resource) => {
                const Icon = getTypeIcon(resource.type);

                return (
                    <div
                        key={resource.id}
                        onClick={() => onSelect(resource)}
                        className="group cursor-pointer"
                    >
                        {/* Aspect Ratio Box */}
                        <div className={cn("relative aspect-[4/5] rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1", resource.coverColor)}>
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />

                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2">
                                    <Icon className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Hover Play Button */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-midnight-navy)] shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-5 h-5 ml-1 fill-current" />
                                </div>
                            </div>
                        </div>

                        <h3 className="font-medium text-[var(--color-midnight-navy)] leading-tight group-hover:text-[var(--color-champagne-gold)] transition-colors">
                            {resource.title}
                        </h3>
                        <p className="text-xs text-[var(--color-midnight-navy)]/60 mt-1">
                            {resource.author} • {resource.duration}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
