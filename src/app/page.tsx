import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IntelligentBriefing } from "@/components/dashboard/IntelligentBriefing";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { RecentSignals } from "@/components/dashboard/RecentSignals";
import { QuickNote } from "@/components/dashboard/QuickNote";
import { getClients, getRecentQuickNotes } from "@/app/actions/clients";
import { getDashboardData } from "@/app/actions/dashboard";

export default async function Home() {
  const [data, notesResult, clientsResult] = await Promise.all([
    getDashboardData(),
    getRecentQuickNotes(10),
    getClients()
  ]);

  const recentNotes = notesResult.success ? notesResult.data : [];
  const clients = clientsResult.success ? clientsResult.data : [];

  return (
    <div className="flex min-h-screen bg-[var(--color-warm-white)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column (2/3) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Greeting / Briefing */}
                <section>
                  <IntelligentBriefing clients={data.briefing} />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Recent Signals */}
                  <div className="md:col-span-7">
                    <RecentSignals clients={data.signals} />
                  </div>

                  {/* Quick Note */}
                  <div className="md:col-span-5">
                    <QuickNote initialNotes={recentNotes} clients={clients} />
                  </div>
                </div>
              </div>

              {/* Right Column (1/3) */}
              <div className="lg:col-span-4">
                <section className="h-full sticky top-10">
                  <SmartCalendar className="h-full" />
                </section>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
