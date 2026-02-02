import AppShell from '@/components/AppShell';
import DashboardCompanies from '@/components/DashboardCompanies';

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Selecione uma empresa para ver relatórios.">
      <DashboardCompanies />
    </AppShell>
  );
}
