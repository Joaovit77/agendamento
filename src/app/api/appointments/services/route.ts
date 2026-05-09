import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const [servicesRes, barbersRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true).order('price'),
    supabase.from('barbers').select('*').eq('active', true),
  ])
  return NextResponse.json({ services: servicesRes.data || [], barbers: barbersRes.data || [] })
}
