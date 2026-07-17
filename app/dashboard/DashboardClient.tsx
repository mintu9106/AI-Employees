'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Employee = { id: string; slug: string; name: string; role: string; system_prompt: string };
type Message = { id?: string; role: string; content: string };

export default function DashboardClient({ employees, userEmail }: { employees: Employee[]; userEmail: string }) {
  const [activeId, setActiveId] = useState(employees[0]?.id);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeEmployee = employees.find((e) => e.id === activeId);

  useEffect(() => {
    loadConversation(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversation(employeeId?: string) {
    if (!employeeId) return;
    setMessages([]);
    setConversationId(null);
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('ai_employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (conv) {
      setConversationId(conv.id);
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, role, content')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || !activeEmployee || loading) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: activeEmployee.id, conversationId, content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-60 bg-ink text-white p-5 flex flex-col gap-1 shrink-0">
        <div className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-[10px] font-mono">MS</span>
          Workforce
        </div>
        {employees.length === 0 && (
          <p className="text-xs text-white/50 font-mono">No AI Employees yet.</p>
        )}
        {employees.map((e) => (
          <button
            key={e.id}
            onClick={() => setActiveId(e.id)}
            className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeId === e.id ? 'bg-brand' : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {e.name}
            <span className="block text-[10px] font-mono opacity-70">{e.role}</span>
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/50">
          <div className="mb-2 truncate">{userEmail}</div>
          <button onClick={handleSignOut} className="text-white/70 hover:text-white">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-8 max-w-3xl mx-auto w-full">
        {activeEmployee ? (
          <>
            <div className="mb-4">
              <h1 className="font-serif text-2xl">{activeEmployee.name}</h1>
              <p className="text-sm text-inksoft font-mono">{activeEmployee.role} · Powered by Claude</p>
            </div>
            <div className="flex-1 overflow-y-auto bg-white border border-line rounded-2xl p-5 flex flex-col gap-3 mb-4 min-h-[420px]">
              {messages.length === 0 && (
                <div className="text-sm text-inksoft">No messages yet — say hello to {activeEmployee.name}.</div>
              )}
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap ${
                    m.role === 'user' ? 'self-end bg-brand text-white' : 'self-start bg-bg'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && <div className="text-xs font-mono text-inksoft">{activeEmployee.name} is typing…</div>}
              <div ref={bottomRef} />
            </div>
            {error && <div className="text-xs font-mono text-[#B0435C] mb-2">{error}</div>}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-line rounded-full px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button onClick={sendMessage} disabled={loading} className="bg-ink text-white rounded-full px-5 py-2.5 text-sm hover:bg-brand disabled:opacity-60">
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-inksoft text-sm">No AI Employees found for your organization.</p>
        )}
      </main>
    </div>
  );
}
