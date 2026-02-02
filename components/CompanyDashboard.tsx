'use client';

import { useEffect, useMemo, useState } from 'react';

type ContentPost = {
  id: string;
  permalink: string;
  captionShort: string;
  mediaType: string;
  createdTime: string;
  totals: {
    views: number;
    reach: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
  };
};

type ContentReport = {
  summary: ContentPost['totals'];
  posts: ContentPost[];
  dailySeries: Array<{ date: string; views: number; reach: number; engagement: number }>;
};

type AdsReport = {
  summary: {
    spend: number;
    results: number;
    clicks: number;
    impressionsOrViews: number;
    activeAdsCount: number;
  };
  dailySeries: Array<{ date: string; spend: number; results: number; clicks: number }>;
};

type Connection = {
  id: string;
  type: string;
  externalId: string;
  displayName: string;
  status: string;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export default function CompanyDashboard({ companyId }: { companyId: string }) {
  const [tab, setTab] = useState<'content' | 'ads' | 'connections'>('content');
  const [from, setFrom] = useState(formatDate(daysAgo(7)));
  const [to, setTo] = useState(formatDate(new Date()));
  const [source, setSource] = useState('instagram');
  const [profile, setProfile] = useState('');
  const [contentReport, setContentReport] = useState<ContentReport | null>(null);
  const [adsReport, setAdsReport] = useState<AdsReport | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [canManageConnections, setCanManageConnections] = useState(false);
  const [newConnection, setNewConnection] = useState({
    type: 'instagram_profile',
    externalId: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(() => {
    const lastUpdate = contentReport?.dailySeries?.slice(-1)[0]?.date || adsReport?.dailySeries?.slice(-1)[0]?.date;
    return lastUpdate ? `Atualizado em ${lastUpdate}` : 'Sem atualizações recentes';
  }, [contentReport, adsReport]);

  useEffect(() => {
    const loadRole = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCanManageConnections(data.user?.role === 'ADMIN' || data.user?.role === 'STAFF');
      }
    };
    loadRole();
  }, []);

  useEffect(() => {
    if (tab === 'content') {
      loadContent();
    }
    if (tab === 'ads') {
      loadAds();
    }
    if (tab === 'connections') {
      loadConnections();
    }
  }, [tab]);

  const loadContent = async () => {
    setLoading(true);
    const params = new URLSearchParams({ from, to, source });
    if (profile) {
      params.set('profile', profile);
    }
    const res = await fetch(`/api/companies/${companyId}/reports/content?${params.toString()}`);
    const data = await res.json();
    setContentReport(data);
    setLoading(false);
  };

  const loadAds = async () => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`/api/companies/${companyId}/reports/ads?${params.toString()}`);
    const data = await res.json();
    setAdsReport(data);
    setLoading(false);
  };

  const loadConnections = async () => {
    const res = await fetch(`/api/companies/${companyId}/connections`);
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections);
    }
  };

  const submitConnection = async () => {
    const res = await fetch(`/api/companies/${companyId}/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConnection)
    });

    if (res.ok) {
      setShowModal(false);
      setNewConnection({ type: 'instagram_profile', externalId: '', displayName: '' });
      loadConnections();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <span className="text-slate-400">{subtitle}</span>
        <div className="ml-auto flex gap-2">
          <button
            className={`rounded px-3 py-1 ${tab === 'content' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
            onClick={() => setTab('content')}
          >
            Conteúdo
          </button>
          <button
            className={`rounded px-3 py-1 ${tab === 'ads' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
            onClick={() => setTab('ads')}
          >
            Anúncios
          </button>
          <button
            className={`rounded px-3 py-1 ${tab === 'connections' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
            onClick={() => setTab('connections')}
          >
            Conexões
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-xs text-slate-400">
            De
            <input
              className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="flex flex-col text-xs text-slate-400">
            Até
            <input
              className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          {tab === 'content' ? (
            <>
              <label className="flex flex-col text-xs text-slate-400">
                Source
                <select
                  className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </label>
              <label className="flex flex-col text-xs text-slate-400">
                Perfil (externalId)
                <input
                  className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  value={profile}
                  onChange={(event) => setProfile(event.target.value)}
                />
              </label>
            </>
          ) : null}
          <button
            className="self-end rounded bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950"
            onClick={() => (tab === 'content' ? loadContent() : loadAds())}
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Carregando...</p> : null}

      {tab === 'content' && contentReport ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(contentReport.summary).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase text-slate-400">{key}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold">Posts</h3>
            <div className="overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-2">Data</th>
                    <th>Legenda</th>
                    <th>Views</th>
                    <th>Reach</th>
                    <th>Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {contentReport.posts.map((post) => (
                    <tr key={post.id} className="border-t border-slate-800">
                      <td className="py-2">{new Date(post.createdTime).toLocaleDateString()}</td>
                      <td className="max-w-xs truncate">{post.captionShort}</td>
                      <td>{post.totals.views}</td>
                      <td>{post.totals.reach}</td>
                      <td>{post.totals.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'ads' && adsReport ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase text-slate-400">Spend</p>
              <p className="text-2xl font-semibold">{adsReport.summary.spend.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase text-slate-400">Resultados</p>
              <p className="text-2xl font-semibold">{adsReport.summary.results}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase text-slate-400">Anúncios ativos</p>
              <p className="text-2xl font-semibold">{adsReport.summary.activeAdsCount}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-3 text-sm font-semibold">Série diária</h3>
            <div className="overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-2">Data</th>
                    <th>Spend</th>
                    <th>Results</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {adsReport.dailySeries.map((item) => (
                    <tr key={item.date} className="border-t border-slate-800">
                      <td className="py-2">{item.date}</td>
                      <td>{item.spend.toFixed(2)}</td>
                      <td>{item.results}</td>
                      <td>{item.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'connections' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Conexões</h3>
            {canManageConnections ? (
              <button
                className="rounded bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950"
                onClick={() => setShowModal(true)}
              >
                Adicionar conexão
              </button>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((conn) => (
              <div key={conn.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase text-slate-400">{conn.type}</p>
                <p className="text-lg font-semibold">{conn.displayName}</p>
                <p className="text-xs text-slate-400">ID: {conn.externalId}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Nova conexão</h3>
            <label className="flex flex-col text-xs text-slate-400">
              Tipo
              <select
                className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                value={newConnection.type}
                onChange={(event) => setNewConnection({ ...newConnection, type: event.target.value })}
              >
                <option value="instagram_profile">Instagram</option>
                <option value="facebook_page">Facebook Page</option>
                <option value="ad_account">Meta Ads</option>
              </select>
            </label>
            <label className="flex flex-col text-xs text-slate-400">
              External ID
              <input
                className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                value={newConnection.externalId}
                onChange={(event) => setNewConnection({ ...newConnection, externalId: event.target.value })}
              />
            </label>
            <label className="flex flex-col text-xs text-slate-400">
              Nome de exibição
              <input
                className="mt-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                value={newConnection.displayName}
                onChange={(event) => setNewConnection({ ...newConnection, displayName: event.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button className="rounded bg-slate-800 px-3 py-2 text-xs" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="rounded bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950"
                onClick={submitConnection}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
