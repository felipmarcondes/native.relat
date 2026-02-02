'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!res.ok) {
      setError('Credenciais inválidas.');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <form
        className="w-full max-w-md space-y-6 rounded-lg border border-slate-800 bg-slate-900 p-8"
        onSubmit={onSubmit}
      >
        <div>
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-slate-400">Acesse o painel de relatórios.</p>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">
            Email
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Senha
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          className="w-full rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
