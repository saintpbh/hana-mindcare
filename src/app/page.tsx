import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IntelligentBriefing } from "@/components/dashboard/IntelligentBriefing";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { RecentSignals } from "@/components/dashboard/RecentSignals";
import { QuickNote } from "@/components/dashboard/QuickNote";
import { getDashboardData } from "@/app/actions/dashboard";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <div className="flex min-h-screen bg-[var(--color-warm-white)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top: Intelligent Briefing */}
            <section>
              <IntelligentBriefing clients={data.briefing} />
            </section>

            {/* Middle: Flow & Signals & Note */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] lg:flex-1">

              {/* Smart Calendar (Month & Daily Agenda) */}
              <div className="lg:col-span-4 h-full flex flex-col">
                <SmartCalendar className="flex-1" />
              </div>

              {/* Center: Recent Signals */}
              <div className="lg:col-span-5 h-full flex flex-col">
                <RecentSignals clients={data.signals} />
              </div>

              {/* Right: Quick Note */}
              <div className="lg:col-span-3 h-full flex flex-col">
                <QuickNote />
              </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
