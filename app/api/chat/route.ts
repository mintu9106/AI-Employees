import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'No profile found for this user' }, { status: 400 });
  }

  let body: { employeeId?: string; conversationId?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { employeeId, content } = body;
  let conversationId = body.conversationId;

  if (!employeeId || !content) {
    return NextResponse.json({ error: 'employeeId and content are required' }, { status: 400 });
  }

  const { data: employee } = await supabase
    .from('ai_employees')
    .select('*')
    .eq('id', employeeId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (!employee) {
    return NextResponse.json({ error: 'AI Employee not found for your organization' }, { status: 404 });
  }

  if (!conversationId) {
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ organization_id: profile.organization_id, ai_employee_id: employee.id })
      .select()
      .single();
    if (convError || !conv) {
      return NextResponse.json({ error: convError?.message || 'Could not start conversation' }, { status: 500 });
    }
    conversationId = conv.id;
  }

  const { error: insertUserMsgError } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role: 'user', content });
  if (insertUserMsgError) {
    return NextResponse.json({ error: insertUserMsgError.message }, { status: 500 });
  }

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set on the server' }, { status: 500 });
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: employee.system_prompt,
      messages: (history || []).map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return NextResponse.json({ error: `Claude API error: ${errText}` }, { status: 502 });
  }

  const data = await anthropicRes.json();
  const replyText =
    (data.content || [])
      .map((block: { type: string; text?: string }) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim() || "Sorry, I didn't catch that — could you rephrase?";

  await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role: 'assistant', content: replyText });

  return NextResponse.json({ conversationId, reply: replyText });
}
