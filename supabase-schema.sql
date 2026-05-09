-- ============================================================
-- SCHEMA - Barbearia Agendamento
-- Execute isso no SQL Editor do Supabase
-- ============================================================

-- Tabela de serviços
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de barbeiros
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  barber_id UUID REFERENCES barbers(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  whatsapp_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para evitar conflito de horários
CREATE UNIQUE INDEX no_double_booking
  ON appointments (barber_id, appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled');

-- Índice para busca por data
CREATE INDEX idx_appointments_date ON appointments (appointment_date, appointment_time);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais - Serviços
INSERT INTO services (name, duration_minutes, price, description) VALUES
  ('Corte de Cabelo', 30, 35.00, 'Corte masculino com acabamento'),
  ('Barba', 20, 25.00, 'Modelagem e hidratação da barba'),
  ('Corte + Barba', 50, 55.00, 'Combo completo corte e barba'),
  ('Pigmentação', 40, 45.00, 'Pigmentação capilar e barba'),
  ('Sobrancelha', 15, 15.00, 'Design de sobrancelha masculina');

-- Dados iniciais - Barbeiro
INSERT INTO barbers (name, phone) VALUES
  ('Carlos Silva', '+5541999999999');

-- Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Permite leitura pública de serviços e barbeiros
CREATE POLICY "Services são públicos" ON services FOR SELECT USING (true);
CREATE POLICY "Barbers são públicos" ON barbers FOR SELECT USING (active = true);

-- Permite inserir agendamentos sem autenticação
CREATE POLICY "Qualquer um pode agendar" ON appointments FOR INSERT WITH CHECK (true);

-- Permite leitura de agendamentos (para checar disponibilidade)
CREATE POLICY "Agendamentos podem ser consultados" ON appointments FOR SELECT USING (true);

-- Permite update via service_role (API)
CREATE POLICY "Service role pode atualizar" ON appointments FOR UPDATE USING (true);
