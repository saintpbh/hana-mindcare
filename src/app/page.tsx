import { getClients, getRecentQuickNotes } from "@/app/actions/clients";
import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { requireAuth } from "@/lib/auth";


export const dynamic = 'force-dynamic';

export default async function Home() {
  await requireAuth();
  const [data, notesResult, clientsResult] = await Promise.all([
    getDashboardData(),
    getRecentQuickNotes(10),
    getClients()
  ]);

  const recentNotes = (notesResult.success && notesResult.data) ? notesResult.data : [];
  const clients = (clientsResult.success && clientsResult.data) ? clientsResult.data : [];

  return (
    <DashboardPage
      data={data}
      recentNotes={recentNotes}
      clients={clients}
    />
  );
}
