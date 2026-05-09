export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const [servicesRes, barbersRes] = await Promise.all([
    getSupabase().from('services').select('*').eq('active', true).order('price'),
    getSupabase().from('barbers').select('*').eq('active', true),
  ])
  return NextResponse.json({ services: servicesRes.data || [], barbers: barbersRes.data || [] })
}
