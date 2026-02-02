'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Company = {
  id: string;
  name: string;
};

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
};

export default function AppShell({ children, title, subtitle, headerRight }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies.map((item: any) => item.company));
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 p-6">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">meta-client-reports</h1>
          <p className="text-xs text-slate-400">Painel multi-tenant</p>
        </div>
        <nav className="space-y-2 text-sm">
          <Link className="block rounded px-3 py-2 hover:bg-slate-800" href="/dashboard">
            Dashboard
          </Link>
          <Link className="block rounded px-3 py-2 hover:bg-slate-800" href="/admin">
            Admin
          </Link>
          <div className="mt-6">
            <p className="text-xs uppercase text-slate-400">Empresas</p>
            <div className="mt-2 space-y-2">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  className="block rounded px-3 py-2 text-xs hover:bg-slate-800"
                  href={`/company/${company.id}`}
                >
                  {company.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-8 py-6">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {headerRight}
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
