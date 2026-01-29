
-- Adicionar tipos para escopo de localização
CREATE TYPE location_scope AS ENUM ('national', 'state', 'city');

-- Atualizar service_requests
ALTER TABLE service_requests
ADD COLUMN location_scope location_scope NOT NULL DEFAULT 'city',
ADD COLUMN uf CHAR(2),
ADD COLUMN city TEXT;

-- Atualizar professional_profiles
ALTER TABLE professional_profiles
ADD COLUMN location_scope location_scope NOT NULL DEFAULT 'city',
ADD COLUMN uf CHAR(2),
ADD COLUMN city TEXT;
