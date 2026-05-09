'use client'
import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './page.module.css'

type Service = { id: string; name: string; duration_minutes: number; price: number; description: string }
type Barber  = { id: string; name: string }
type Step    = 'service' | 'barber' | 'datetime' | 'info' | 'confirm' | 'done'

const WORK_HOURS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00',
]

export default function Home() {
  const [step, setStep]                   = useState<Step>('service')
  const [services, setServices]           = useState<Service[]>([])
  const [barbers, setBarbers]             = useState<Barber[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber]   = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate]   = useState<Date | null>(null)
  const [selectedTime, setSelectedTime]   = useState<string | null>(null)
  const [bookedTimes, setBookedTimes]     = useState<string[]>([])
  const [clientName, setClientName]       = useState('')
  const [clientPhone, setClientPhone]     = useState('')
  const [notes, setNotes]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState<any>(null)

  useEffect(() => {
    fetch('/api/appointments/services')
      .then(r => r.json())
      .then(data => { setServices(data.services); setBarbers(data.barbers) })
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedBarber) return
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/appointments?date=${dateStr}&barber_id=${selectedBarber.id}`)
      .then(r => r.json())
      .then(data => setBookedTimes(data.bookedTimes || []))
  }, [selectedDate, selectedBarber])

  // Próximos 30 dias úteis (sem domingo)
  const availableDates = Array.from({ length: 40 }, (_, i) => addDays(new Date(), i + 1))
    .filter(d => d.getDay() !== 0)
    .slice(0, 30)

  async function handleSubmit() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientName || !clientPhone) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_phone: clientPhone,
          service_id: selectedService.id,
          barber_id: selectedBarber.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime + ':00',
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao agendar'); return }
      setResult(data.appointment)
      setStep('done')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function restart() {
    setStep('service'); setSelectedService(null); setSelectedBarber(null)
    setSelectedDate(null); setSelectedTime(null)
    setClientName(''); setClientPhone(''); setNotes('')
    setResult(null); setError('')
  }

  const steps: Step[] = ['service','barber','datetime','info','confirm']
  const stepIdx = steps.indexOf(step as any)

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.scissors}>✦</span>
            <div>
              <h1 className={styles.brandName}>BarberShop</h1>
              <p className={styles.brandTagline}>Tradição &amp; Estilo</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {step !== 'done' && (
          <div className={styles.hero}>
            <h2 className={styles.heroTitle}>Agende seu<br /><span className={styles.gold}>horário</span></h2>
            <p className={styles.heroSub}>Confirmação via WhatsApp • Sem espera</p>
          </div>
        )}

        {/* ── PROGRESS ── */}
        {step !== 'done' && (
          <div className={styles.progress}>
            {steps.map((s, i) => (
              <div key={s} className={[
                styles.progressStep,
                i <= stepIdx ? styles.progressActive : '',
                i < stepIdx  ? styles.progressDone  : '',
              ].join(' ')}>
                <div className={styles.progressDot}>{i < stepIdx ? '✓' : i + 1}</div>
                <span className={styles.progressLabel}>
                  {['Serviço','Barbeiro','Data/Hora','Dados','Revisar'][i]}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.card}>

          {/* ── STEP 1: Serviço ── */}
          {step === 'service' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Escolha o serviço</h3>
              <div className={styles.serviceGrid}>
                {services.map(s => (
                  <button key={s.id}
                    className={`${styles.serviceCard} ${selectedService?.id === s.id ? styles.selected : ''}`}
                    onClick={() => { setSelectedService(s); setStep('barber') }}>
                    <div className={styles.serviceName}>{s.name}</div>
                    <div className={styles.serviceDetails}>
                      <span className={styles.serviceDuration}>⏱ {s.duration_minutes} min</span>
                      <span className={styles.servicePrice}>R$ {s.price.toFixed(2).replace('.',',')}</span>
                    </div>
                    {s.description && <div className={styles.serviceDesc}>{s.description}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Barbeiro ── */}
          {step === 'barber' && (
            <div className={styles.stepContent}>
              <button className={styles.back} onClick={() => setStep('service')}>← Voltar</button>
              <h3 className={styles.stepTitle}>Escolha o barbeiro</h3>
              <div className={styles.barberGrid}>
                {barbers.map(b => (
                  <button key={b.id}
                    className={`${styles.barberCard} ${selectedBarber?.id === b.id ? styles.selected : ''}`}
                    onClick={() => { setSelectedBarber(b); setStep('datetime') }}>
                    <div className={styles.barberAvatar}>{b.name.charAt(0)}</div>
                    <div className={styles.barberName}>{b.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Data + Horário ── */}
          {step === 'datetime' && (
            <div className={styles.stepContent}>
              <button className={styles.back} onClick={() => setStep('barber')}>← Voltar</button>
              <h3 className={styles.stepTitle}>Escolha data e horário</h3>

              <div>
                <p className={styles.sectionLabel}>Data</p>
                <div className={styles.dateGrid}>
                  {availableDates.map(d => (
                    <button key={d.toISOString()}
                      className={`${styles.dateBtn} ${selectedDate?.toDateString() === d.toDateString() ? styles.selected : ''}`}
                      onClick={() => { setSelectedDate(d); setSelectedTime(null) }}>
                      <span className={styles.dateDay}>{format(d, 'EEE', { locale: ptBR })}</span>
                      <span className={styles.dateNum}>{format(d, 'd')}</span>
                      <span className={styles.dateMon}>{format(d, 'MMM', { locale: ptBR })}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <p className={styles.sectionLabel}>Horário disponível</p>
                  <div className={styles.timeGrid}>
                    {WORK_HOURS.map(t => {
                      const isBooked = bookedTimes.includes(t)
                      return (
                        <button key={t} disabled={isBooked}
                          className={[styles.timeBtn, isBooked ? styles.booked : '', selectedTime === t ? styles.selected : ''].join(' ')}
                          onClick={() => setSelectedTime(t)}>
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <button className={styles.nextBtn} onClick={() => setStep('info')}>
                  Continuar →
                </button>
              )}
            </div>
          )}

          {/* ── STEP 4: Dados do cliente ── */}
          {step === 'info' && (
            <div className={styles.stepContent}>
              <button className={styles.back} onClick={() => setStep('datetime')}>← Voltar</button>
              <h3 className={styles.stepTitle}>Seus dados</h3>
              <p className={styles.infoNote}>Você receberá a confirmação via <strong>WhatsApp</strong></p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nome completo</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>WhatsApp</label>
                <input value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                  placeholder="(41) 99999-9999" type="tel" />
                <span className={styles.hint}>Com DDD, sem espaços ou traços</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Observações <span className={styles.optional}>(opcional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: preferência de corte, barba com navalha..." rows={3} />
              </div>

              <button className={styles.nextBtn} disabled={!clientName || !clientPhone}
                onClick={() => setStep('confirm')}>
                Revisar agendamento →
              </button>
            </div>
          )}

          {/* ── STEP 5: Confirmar ── */}
          {step === 'confirm' && selectedService && selectedBarber && selectedDate && selectedTime && (
            <div className={styles.stepContent}>
              <button className={styles.back} onClick={() => setStep('info')}>← Voltar</button>
              <h3 className={styles.stepTitle}>Confirmar agendamento</h3>

              <div className={styles.summary}>
                <div className={styles.summaryRow}><span>Serviço</span><strong>{selectedService.name}</strong></div>
                <div className={styles.summaryRow}><span>Barbeiro</span><strong>{selectedBarber.name}</strong></div>
                <div className={styles.summaryRow}><span>Data</span>
                  <strong>{format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong></div>
                <div className={styles.summaryRow}><span>Horário</span><strong>{selectedTime}</strong></div>
                <div className={styles.summaryRow}><span>Duração</span><strong>{selectedService.duration_minutes} min</strong></div>
                <div className={styles.summaryRow}><span>Cliente</span><strong>{clientName}</strong></div>
                <div className={styles.summaryRow}><span>WhatsApp</span><strong>{clientPhone}</strong></div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <strong className={styles.gold}>R$ {selectedService.price.toFixed(2).replace('.',',')}</strong>
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <button className={styles.confirmBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Agendando...' : '✓ Confirmar agendamento'}
              </button>
              <p className={styles.whatsappNote}>📱 Você receberá uma mensagem no WhatsApp confirmando o horário</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && result && (
            <div className={styles.done}>
              <div className={styles.doneIcon}>✓</div>
              <h3 className={styles.doneTitle}>Agendado!</h3>
              <p className={styles.doneSub}>
                Confira seu WhatsApp — a confirmação foi enviada para <strong>{clientPhone}</strong>
              </p>
              <div className={styles.summary} style={{ marginTop: '2rem', width: '100%', maxWidth: 420 }}>
                <div className={styles.summaryRow}><span>Serviço</span><strong>{result.service_name}</strong></div>
                <div className={styles.summaryRow}><span>Barbeiro</span><strong>{result.barber_name}</strong></div>
                <div className={styles.summaryRow}><span>Data</span>
                  <strong>{format(new Date(result.date + 'T12:00'), "d 'de' MMMM", { locale: ptBR })}</strong></div>
                <div className={styles.summaryRow}><span>Horário</span><strong>{result.time.slice(0,5)}</strong></div>
              </div>
              <button className={styles.nextBtn} style={{ marginTop: '1.5rem' }} onClick={restart}>
                Fazer novo agendamento
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 BarberShop • Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
