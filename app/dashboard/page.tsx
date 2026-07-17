import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, email')
    .eq('id', user.id)
    .single();

  const { data: employees } = await supabase
    .from('ai_employees')
    .select('id, slug, name, role, system_prompt')
    .eq('organization_id', profile?.organization_id)
    .order('created_at', { ascending: true });

  return <DashboardClient employees={employees || []} userEmail={profile?.email || user.email || ''} />;
}
