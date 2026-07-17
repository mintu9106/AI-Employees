'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm bg-white border border-line rounded-2xl p-8">
        <h1 className="font-serif text-2xl mb-1">Create your workspace</h1>
        <p className="text-sm text-inksoft mb-6">Hire your first AI Employee in minutes.</p>
        {error && <div className="text-xs font-mono text-white bg-[#B0435C] p-2.5 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Company name</label>
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Work email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Password</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </div>
          <button disabled={loading} className="bg-ink text-white rounded-full py-2.5 text-sm font-semibold hover:bg-brand disabled:opacity-60">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-inksoft mt-5">
          Already have an account? <Link href="/login" className="text-brand font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
