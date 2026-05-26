import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, email, fullName, role } = await request.json();

    if (!id || !email || !role) {
      return NextResponse.json({ error: 'Missing required parameters: id, email, and role are required.' }, { status: 400 });
    }

    console.log(`Securing profile creation for user: ${email} (${id}) as ${role}`);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: fullName || email.split('@')[0],
        role
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting profile with admin key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });

  } catch (error: any) {
    console.error('Server profile registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
