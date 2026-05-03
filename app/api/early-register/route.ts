import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { sendEmail } from '@/lib/email/send';
import { buildWelcomeEmail } from '@/lib/email/templates/welcome';

interface RegisterBody {
  name: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, message: 'İsim ve e-posta gerekli.' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Geçersiz e-posta adresi.' },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from('early_registrations')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Bu e-posta adresi zaten kayıtlı.' },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from('early_registrations')
      .insert({ name, email });

    if (error) {
      console.error('[early-register] Supabase hatası:', error.message);
      return NextResponse.json(
        { ok: false, message: 'Kayıt sırasında bir hata oluştu.' },
        { status: 500 },
      );
    }

    const { subject, html } = buildWelcomeEmail(name);
    try {
      await sendEmail({ to: email, subject, html });
    } catch (mailErr) {
      console.error('[early-register] Mail gönderilemedi:', mailErr);
    }

    return NextResponse.json({ ok: true, message: 'Kayıt başarılı!' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
