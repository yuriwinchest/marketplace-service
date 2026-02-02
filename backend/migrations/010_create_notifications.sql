-- Migration: Create Notifications Table
-- Data: 2026-01-29
-- Descrição: Cria tabela para sistema de notificações
CREATE TYPE public.notification_type AS ENUM (
    'PROPOSAL_RECEIVED',
    'PROPOSAL_ACCEPTED',
    'PROPOSAL_REJECTED',
    'CONTACT_VIEWED',
    'SYSTEM_ALERT'
);
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type public.notification_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Backend controls access via service logic
CREATE POLICY "Users can access notifications" ON public.notifications FOR ALL USING (true);