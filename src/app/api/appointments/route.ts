
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendConfirmationWhatsApp } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_name, client_phone, service_id, barber_id, appointment_date, appointment_time, notes } = body

    if (!client_name || !client_phone || !service_id || !barber_id || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const { data: service, error: serviceError } = await db
      .from('services').select('*').eq('id', service_id).single()
    if (serviceError || !service)
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    const { data: barber, error: barberError } = await db
      .from('barbers').select('*').eq('id', barber_id).single()
    if (barberError || !barber)
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })

    // Verifica conflito de horário (mensagem amigável)
    const { data: conflict } = await db
      .from('appointments').select('id')
      .eq('barber_id', barber_id).eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time).neq('status', 'cancelled')
      .maybeSingle()

    if (conflict)
      return NextResponse.json(
        { error: 'Este horário já está ocupado. Por favor, escolha outro.' }, { status: 409 }
      )

    // Insere — o índice UNIQUE no banco é a última barreira contra race conditions
    const { data: appointment, error: insertError } = await db
      .from('appointments')
      .insert({ client_name, client_phone, service_id, barber_id, appointment_date, appointment_time, status: 'confirmed', notes: notes || null })
      .select().single()

    if (insertError) {
      if (insertError.code === '23505')
        return NextResponse.json(
          { error: 'Este horário foi reservado agora mesmo. Por favor, escolha outro.' }, { status: 409 }
        )
      throw insertError
    }

    // Envia WhatsApp (não bloqueia a resposta se falhar)
    try {
      await sendConfirmationWhatsApp({
        clientName: client_name, clientPhone: client_phone,
        serviceName: service.name, barberName: barber.name,
        date: appointment_date, time: appointment_time,
        price: service.price, appointmentId: appointment.id,
      })
      await db.from('appointments').update({ whatsapp_sent: true }).eq('id', appointment.id)
    } catch (err) {
      console.error('Erro ao enviar WhatsApp:', err)
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id, client_name,
        service_name: service.name, barber_name: barber.name,
        date: appointment_date, time: appointment_time, price: service.price,
      },
    })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date      = searchParams.get('date')
  const barber_id = searchParams.get('barber_id')

  if (!date || !barber_id)
    return NextResponse.json({ error: 'date e barber_id são obrigatórios' }, { status: 400 })

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('appointments').select('appointment_time')
    .eq('appointment_date', date).eq('barber_id', barber_id).neq('status', 'cancelled')

  if (error) return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })

  return NextResponse.json({ bookedTimes: data.map(a => a.appointment_time.slice(0, 5)) })
}
