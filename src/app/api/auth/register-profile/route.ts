import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, clientIp } from '@/lib/server-auth';

const ALLOWED_ROLES = ['candidate', 'recruiter'];

export async function POST(request: NextRequest) {
  const limited = rateLimit(`register:${clientIp(request)}`, 10, 60_000);
  if (limited) return limited;

  try {
    const { id, email, fullName, role } = await request.json();

    if (!id || !email || !role) {
      return NextResponse.json({ error: 'Missing required parameters: id, email, and role are required.' }, { status: 400 });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    // The account must already exist in Supabase Auth with the same email.
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.getUserById(id);
    if (authErr || !authUser?.user || authUser.user.email?.toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json({ error: 'Unknown account.' }, { status: 400 });
    }

    // Insert only. An existing profile is never overwritten, so roles cannot be changed this way.
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('id', id).maybeSingle();
    if (existing) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseAdmin.from('profiles').insert({
      id,
      email: authUser.user.email,
      full_name: String(fullName || String(email).split('@')[0]).slice(0, 120),
      role,
    });

    if (error) {
      console.error('Error inserting profile:', error);
      return NextResponse.json({ error: 'Could not create profile.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Server profile registration error:', error);
    return NextResponse.json({ error: 'Could not create profile.' }, { status: 500 });
  }
}
