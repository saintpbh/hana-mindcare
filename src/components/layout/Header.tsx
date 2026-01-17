import { Search } from "lucide-react";

export function Header() {
    return (
        <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-100 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
            <div>
                <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                    Good Morning, Dr. Park
                </h1>
                <p className="text-sm text-neutral-500">You have 3 sessions today</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="h-10 pl-10 pr-4 rounded-full bg-white border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10 w-64"
                    />
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm overflow-hidden">
                    {/* Placeholder for user avatar */}
                    <div className="w-full h-full bg-[var(--color-midnight-navy)] flex items-center justify-center text-white font-medium text-sm">
                        DP
                    </div>
                </div>
            </div>
        </header>
    );
}
