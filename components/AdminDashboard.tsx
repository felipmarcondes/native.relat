'use client';

import { useEffect, useState } from 'react';

type Company = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<'companies' | 'users' | 'links'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'CLIENT' });
  const [linkForm, setLinkForm] = useState({ companyId: '', userId: '', role: 'CLIENT' });

  const loadCompanies = async () => {
    const res = await fetch('/api/admin/companies');
    if (res.ok) {
      const data = await res.json();
      setCompanies(data.companies);
    }
  };

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadUsers();
  }, []);

  const createCompany = async () => {
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName })
    });
    if (res.ok) {
      setCompanyName('');
      loadCompanies();
    }
  };

  const createUser = async () => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    if (res.ok) {
      setUserForm({ name: '', email: '', password: '', role: 'CLIENT' });
      loadUsers();
    }
  };

  const linkUser = async () => {
    const res = await fetch(`/api/admin/companies/${linkForm.companyId}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: linkForm.userId, role: linkForm.role })
    });
    if (res.ok) {
      setLinkForm({ companyId: '', userId: '', role: 'CLIENT' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          className={`rounded px-3 py-1 text-sm ${tab === 'companies' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
          onClick={() => setTab('companies')}
        >
          Empresas
        </button>
        <button
          className={`rounded px-3 py-1 text-sm ${tab === 'users' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
          onClick={() => setTab('users')}
        >
          Usuários
        </button>
        <button
          className={`rounded px-3 py-1 text-sm ${tab === 'links' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}
          onClick={() => setTab('links')}
        >
          Vínculos
        </button>
      </div>

      {tab === 'companies' ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold">Nova empresa</h3>
            <div className="mt-3 flex gap-2">
              <input
                className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Nome da empresa"
              />
              <button className="rounded bg-emerald-500 px-3 py-2 text-sm text-slate-950" onClick={createCompany}>
                Criar
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {companies.map((company) => (
              <div key={company.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold">{company.name}</p>
                <p className="text-xs text-slate-400">ID: {company.id}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'users' ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold">Novo usuário</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="Nome"
                value={userForm.name}
                onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="Email"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              />
              <input
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="Senha"
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
              />
              <select
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                value={userForm.role}
                onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>
            <button className="mt-3 rounded bg-emerald-500 px-3 py-2 text-sm text-slate-950" onClick={createUser}>
              Criar usuário
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-400">Role: {user.role}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'links' ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h3 className="text-sm font-semibold">Vincular usuário</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <select
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={linkForm.companyId}
              onChange={(event) => setLinkForm({ ...linkForm, companyId: event.target.value })}
            >
              <option value="">Selecione empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={linkForm.userId}
              onChange={(event) => setLinkForm({ ...linkForm, userId: event.target.value })}
            >
              <option value="">Selecione usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={linkForm.role}
              onChange={(event) => setLinkForm({ ...linkForm, role: event.target.value })}
            >
              <option value="CLIENT">CLIENT</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button className="mt-3 rounded bg-emerald-500 px-3 py-2 text-sm text-slate-950" onClick={linkUser}>
            Vincular
          </button>
        </div>
      ) : null}
    </div>
  );
}
