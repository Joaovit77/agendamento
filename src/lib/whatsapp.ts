import twilio from 'twilio'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const getClient = () => twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `whatsapp:+${withCountry}`
}

export async function sendConfirmationWhatsApp({
  clientName, clientPhone, serviceName, barberName, date, time, price, appointmentId,
}: {
  clientName: string; clientPhone: string; serviceName: string; barberName: string;
  date: string; time: string; price: number; appointmentId: string;
}) {
  const dateFormatted = format(new Date(`${date}T${time}`), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const timeFormatted = time.slice(0, 5)

  const message = `✂️ *Agendamento Confirmado!*

Olá, *${clientName}*! Seu horário foi agendado com sucesso.

📋 *Detalhes:*
- Serviço: ${serviceName}
- Barbeiro: ${barberName}
- Data: ${dateFormatted}
- Horário: ${timeFormatted}
- Valor: R$ ${price.toFixed(2).replace('.', ',')}

📍 *Nos vemos em breve!*
Caso precise cancelar ou remarcar, responda essa mensagem.

_ID: ${appointmentId.slice(0, 8).toUpperCase()}_`

  await getClient().messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: formatPhone(clientPhone),
    body: message,
  })
}

export async function sendCancellationWhatsApp({
  clientName, clientPhone, date, time,
}: {
  clientName: string; clientPhone: string; date: string; time: string;
}) {
  const dateFormatted = format(new Date(`${date}T${time}`), "d 'de' MMMM", { locale: ptBR })
  await getClient().messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: formatPhone(clientPhone),
    body: `❌ *Agendamento Cancelado*\n\nOlá, *${clientName}*!\n\nSeu agendamento do dia *${dateFormatted}* às *${time.slice(0,5)}* foi cancelado.\n\nPara remarcar, acesse nosso site. 😊`,
  })
}