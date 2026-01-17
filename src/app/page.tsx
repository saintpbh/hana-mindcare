import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IntelligentBriefing } from "@/components/dashboard/IntelligentBriefing";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main Highlight: Intelligent Briefing */}
              <div className="md:col-span-2">
                <IntelligentBriefing />
              </div>

              {/* Placeholder for stats or calendar */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex items-center justify-center text-neutral-400 text-sm">
                Daily Schedule Placeholder
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-midnight-navy)]">Recent Activity</h2>
                <button className="text-sm text-[var(--color-champagne-gold)] font-medium hover:underline">View All</button>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm h-64 flex items-center justify-center text-neutral-400">
                Activity Feed Placeholder
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
