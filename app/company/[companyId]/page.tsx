import AppShell from '@/components/AppShell';
import CompanyDashboard from '@/components/CompanyDashboard';
import CompanyHeader from '@/components/CompanyHeader';

export default function CompanyPage({ params }: { params: { companyId: string } }) {
  return (
    <AppShell
      title="Empresa selecionada"
      subtitle={`ID: ${params.companyId}`}
      headerRight={<CompanyHeader companyId={params.companyId} />}
    >
      <CompanyDashboard companyId={params.companyId} />
    </AppShell>
  );
}
