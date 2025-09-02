-- Script para corregir las políticas de RLS
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar políticas actuales
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

-- 2. Eliminar políticas existentes que puedan estar causando conflicto
DROP POLICY IF EXISTS "Allow insert for all users" ON demo_requests;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON demo_requests;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON demo_requests;

-- 3. Crear políticas correctas para permitir inserción pública
-- Política para INSERT (cualquiera puede crear solicitudes)
CREATE POLICY "Enable insert for all users" ON demo_requests
    FOR INSERT WITH CHECK (true);

-- Política para SELECT (cualquiera puede leer)
CREATE POLICY "Enable select for all users" ON demo_requests
    FOR SELECT USING (true);

-- Política para UPDATE (solo usuarios autenticados pueden actualizar)
CREATE POLICY "Enable update for authenticated users" ON demo_requests
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (solo usuarios autenticados pueden eliminar)
CREATE POLICY "Enable delete for authenticated users" ON demo_requests
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verificar que las políticas se crearon correctamente
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

-- 5. Probar inserción (opcional)
-- INSERT INTO demo_requests (name, company, email, phone, interest, status) VALUES
-- ('Test RLS Fix', 'Test Company', 'test@rls.com', '912345678', 'Testing RLS policies', 'pending');

-- 6. Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'demo_requests';
