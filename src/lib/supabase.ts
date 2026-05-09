import { createClient } from '@supabase/supabase-js'

export type Service = { id: string; name: string; duration_minutes: number; price: number; description: string; active: boolean }
export type Barber   = { id: string; name: string; phone: string; active: boolean }
export type Appointment = {
  id: string; client_name: string; client_phone: string; service_id: string; barber_id: string;
  appointment_date: string; appointment_time: string; status: 'pending'|'confirmed'|'cancelled'|'completed';
  whatsapp_sent: boolean; notes?: string; created_at: string;
}

export const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )