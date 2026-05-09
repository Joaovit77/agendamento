import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()
  const [servicesRes, barbersRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true).order('price'),
    supabase.from('barbers').select('*').eq('active', true),
  ])
  return NextResponse.json({ services: servicesRes.data || [], barbers: barbersRes.data || [] })
}