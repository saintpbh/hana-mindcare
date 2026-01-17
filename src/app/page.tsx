import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IntelligentBriefing } from "@/components/dashboard/IntelligentBriefing";
import { TodaysFlow } from "@/components/dashboard/TodaysFlow";
import { RecentSignals } from "@/components/dashboard/RecentSignals";
import { QuickNote } from "@/components/dashboard/QuickNote";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[var(--color-warm-white)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top: Intelligent Briefing */}
            <section>
              <IntelligentBriefing />
            </section>

            {/* Middle: Flow & Signals & Note */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">

              {/* Today's Flow (Timeline) */}
              <div className="lg:col-span-4 h-full">
                <TodaysFlow />
              </div>

              {/* Center: Recent Signals */}
              <div className="lg:col-span-5 h-full">
                <RecentSignals />
              </div>

              {/* Right: Quick Note */}
              <div className="lg:col-span-3 h-full">
                <QuickNote />
              </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
