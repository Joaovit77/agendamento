# ✂️ BarberShop — Agendamento Online

Sistema completo de agendamento com:
- **Next.js 14** (App Router)
- **Supabase** (banco de dados, sem conflito de horários via constraint UNIQUE)
- **Twilio** (confirmação via WhatsApp)
- **Deploy na Vercel** em minutos

---

## 🚀 Setup passo a passo

### 1. Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto
2. No painel, vá em **SQL Editor** e execute todo o conteúdo de `supabase-schema.sql`
3. Vá em **Settings → API** e copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Twilio (WhatsApp Sandbox)

1. Crie uma conta em [twilio.com](https://twilio.com)
2. Vá em **Messaging → Try it out → Send a WhatsApp message**
3. Siga as instruções para ativar o sandbox (enviar uma mensagem de join)
4. Copie:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
   - O número do sandbox (ex: `whatsapp:+14155238886`) → `TWILIO_WHATSAPP_FROM`

> **Produção**: Para usar seu próprio número WhatsApp Business, solicite aprovação no Twilio (pode levar alguns dias).

### 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy na Vercel

```bash
# Instale a CLI da Vercel (uma vez)
npm i -g vercel

# Faça login
vercel login

# Deploy (na pasta do projeto)
vercel

# Em produção
vercel --prod
```

Durante o deploy, a Vercel vai perguntar sobre as variáveis de ambiente. **Adicione todas do `.env.local`** ou faça isso depois no painel em **Settings → Environment Variables**.

---

## 🗃️ Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   └── appointments/
│   │       ├── route.ts          ← POST (criar) e GET (horários ocupados)
│   │       └── services/route.ts ← GET serviços e barbeiros
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                  ← UI completa de agendamento
│   └── page.module.css
├── lib/
│   ├── supabase.ts               ← cliente Supabase
│   └── whatsapp.ts               ← envio via Twilio
supabase-schema.sql               ← execute no Supabase
```

---

## 🎨 Personalização

### Trocar nome da barbearia
Edite em:
- `src/app/layout.tsx` → `metadata.title` e `description`
- `src/app/page.tsx` → `<h1>` e `<p>` do header e footer

### Trocar serviços / barbeiros
Execute UPDATE no Supabase ou edite diretamente na tabela `services` e `barbers`.

### Horário de funcionamento
Em `src/app/page.tsx`, edite o array `WORK_HOURS`.

### Dias de folga / feriados
Em `page.tsx`, a lógica `availableDates` filtra domingos (`d.getDay() !== 0`). Para adicionar sábado de folga, adicione `&& d.getDay() !== 6`.

---

## 🔒 Anti-conflito de horários

O sistema usa duas camadas:
1. **Verificação prévia** na API — retorna mensagem amigável se o horário estiver ocupado
2. **Índice UNIQUE** no Supabase — garante integridade mesmo em race conditions simultâneas

```sql
CREATE UNIQUE INDEX no_double_booking
  ON appointments (barber_id, appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled');
```

---

## 📱 Mensagem WhatsApp enviada

```
✂️ Agendamento Confirmado!

Olá, João! Seu horário foi agendado com sucesso.

📋 Detalhes:
• Serviço: Corte + Barba
• Barbeiro: Carlos Silva
• Data: segunda-feira, 15 de julho de 2025
• Horário: 14:30
• Valor: R$ 55,00

📍 Nos vemos em breve!
```
