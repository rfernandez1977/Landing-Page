-- Script de configuración para Supabase
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear la tabla para solicitudes de demo
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    interest TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad
-- Política para insertar (cualquiera puede crear solicitudes)
CREATE POLICY "Allow insert for all users" ON demo_requests
    FOR INSERT WITH CHECK (true);

-- Política para leer (solo usuarios autenticados pueden ver)
CREATE POLICY "Allow read for authenticated users" ON demo_requests
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para actualizar (solo usuarios autenticados pueden actualizar)
CREATE POLICY "Allow update for authenticated users" ON demo_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_demo_requests_updated_at 
    BEFORE UPDATE ON demo_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Crear vista para estadísticas (opcional)
CREATE OR REPLACE VIEW demo_requests_stats AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_requests,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_requests,
    DATE_TRUNC('day', created_at) as date
FROM demo_requests
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 8. Insertar datos de ejemplo (opcional)
INSERT INTO demo_requests (name, company, email, phone, interest, status) VALUES
('Juan Pérez', 'Empresa Demo SPA', 'juan@demo.cl', '912345678', 'Sistema POS y facturación electrónica', 'pending'),
('María González', 'Comercio Test Ltda', 'maria@test.cl', '987654321', 'Integración con SII', 'pending');

-- 9. Verificar la configuración
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'demo_requests'
ORDER BY ordinal_position;

-- 10. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'demo_requests';
