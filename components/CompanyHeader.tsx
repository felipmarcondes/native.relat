'use client';

import { useEffect, useState } from 'react';

type Props = {
  companyId: string;
};

export default function CompanyHeader({ companyId }: Props) {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/companies/${companyId}/reports/last-update`);
      if (res.ok) {
        const data = await res.json();
        setUpdatedAt(data.updatedAt);
      }
    };
    load();
  }, [companyId]);

  return (
    <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300">
      Atualizado em {updatedAt ?? '--'}
    </div>
  );
}
