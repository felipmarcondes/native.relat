'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Company = {
  id: string;
  name: string;
};

export default function DashboardCompanies() {
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
    <div className="grid gap-4 md:grid-cols-2">
      {companies.map((company) => (
        <Link
          key={company.id}
          href={`/company/${company.id}`}
          className="rounded-lg border border-slate-800 bg-slate-900 p-6 hover:border-emerald-500"
        >
          <h3 className="text-lg font-semibold">{company.name}</h3>
          <p className="text-sm text-slate-400">Ver relatórios e conexões</p>
        </Link>
      ))}
      {companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 p-6 text-sm text-slate-400">
          Nenhuma empresa disponível.
        </div>
      ) : null}
    </div>
  );
}
