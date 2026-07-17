import Link from 'next/link';

export default function HomePage() {
  const employees = [
    { name: 'Ava', role: 'Customer Support', desc: 'Answers questions and resolves issues, 24/7.' },
    { name: 'Noah', role: 'Sales', desc: 'Follows up on every lead, on schedule, every time.' },
    { name: 'Priya', role: 'HR', desc: 'Handles onboarding and policy questions instantly.' },
  ];

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 bg-bg/90 backdrop-blur border-b border-line z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-serif font-bold flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-brand text-white flex items-center justify-center text-xs font-mono">MS</span>
            MS AI Workforce
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="border border-line rounded-full px-4 py-2 text-sm font-semibold hover:border-ink">Sign in</Link>
            <Link href="/register" className="bg-ink text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-brand mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-active" /> NOW HIRING · 24/7 AVAILABILITY
        </div>
        <h1 className="font-serif text-5xl leading-tight max-w-2xl">
          Build, hire, and manage <span className="text-brand">AI Employees</span> for your business.
        </h1>
        <p className="text-inksoft text-lg max-w-lg mt-5">
          Real accounts, real conversation history, real Claude-powered AI Employees — sign up and hire your first three in under a minute.
        </p>
        <div className="flex gap-3 mt-8">
          <Link href="/register" className="bg-ink text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand">Hire your first AI Employee</Link>
          <Link href="/login" className="border border-line rounded-full px-6 py-3 text-sm font-semibold hover:border-ink">Sign in</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="font-serif text-2xl mb-6">Your first three hires</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {employees.map((e) => (
            <div key={e.name} className="bg-white border border-line rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg bg-brandtint text-brand font-serif font-semibold flex items-center justify-center mb-4">{e.name[0]}</div>
              <h3 className="font-serif text-lg">{e.name}</h3>
              <div className="font-mono text-[10px] uppercase text-inksoft mb-2">{e.role}</div>
              <p className="text-sm text-inksoft">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
