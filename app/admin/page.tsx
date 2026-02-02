import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AdminDashboard from '@/components/AdminDashboard';
import { verifyToken } from '@/lib/auth';

export default function AdminPage() {
  const token = cookies().get('accessToken')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== 'ADMIN') {
      redirect('/dashboard');
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <AppShell title="Admin" subtitle="Gerencie empresas, usuários e vínculos.">
      <AdminDashboard />
    </AppShell>
  );
}
