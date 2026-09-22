import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Artist, ShowEvent, PendingExpense, SettlementStatus } from '../types';

/**
 * DATOS DE CONEXIÓN DE SUPABASE INCRUSTADOS DIRECTAMENTE EN EL CÓDIGO
 * ------------------------------------------------------------------
 * Puedes reemplazar estas dos constantes directamente con los datos de tu proyecto
 * de Supabase (Project Settings -> API -> Project URL & Project API Keys 'anon' 'public').
 * Al estar aquí, la app se conectará automáticamente en Vercel sin necesidad
 * de configurar variables de entorno.
 */
export const DEFAULT_SUPABASE_URL = 'https://tastethefloor-liquidaciones.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vLWtleSIsInJlZiI6InRhc3RldGhlZmxvb3ItbGlxdWlkYWNpb25lcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjIwMjAwMDAwMDB9.placeholder_key';

// Claves de almacenamiento local para permitir configuración interactiva en caliente
const STORAGE_KEY_URL = 'supabase_portal_url';
const STORAGE_KEY_KEY = 'supabase_portal_anon_key';
const STORAGE_KEY_USE_LIVE = 'supabase_portal_use_live';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  const useLive = localStorage.getItem(STORAGE_KEY_USE_LIVE) === 'true';
  return { url, anonKey, useLive };
}

export function saveSupabaseConfig(url: string, anonKey: string, useLive: boolean) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  localStorage.setItem(STORAGE_KEY_USE_LIVE, useLive ? 'true' : 'false');
  _cachedClient = null; // Reiniciar cliente
}

let _cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey || anonKey.includes('placeholder')) {
    return null;
  }

  if (!_cachedClient) {
    try {
      _cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Error inicializando Supabase Client:', err);
      return null;
    }
  }
  return _cachedClient;
}

/**
 * Script SQL para crear las tablas correspondientes a las importaciones de Google Sheet
 * en Supabase con RLS preparado.
 */
export const SUPABASE_SQL_SETUP = `-- ========================================================
-- TABLAS EN SUPABASE PARA EL PORTAL DE LIQUIDACIONES DE ARTISTAS
-- ========================================================

-- 1. Tabla de Artistas (y usuarios con login)
CREATE TABLE IF NOT EXISTS public.artistas (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  gira TEXT,
  cif_nif TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Información General de Eventos / Shows (Importada desde Google Sheets)
CREATE TABLE IF NOT EXISTS public.eventos_shows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  artista_id TEXT REFERENCES public.artistas(id) ON DELETE CASCADE,
  show_code TEXT NOT NULL,          -- ej: '25_566'
  ciudad TEXT NOT NULL,             -- ej: 'Alicante'
  fecha DATE,                       -- ej: '2026-06-20'
  venue TEXT,                       -- ej: 'Recinto Ferial'
  cache_bruto NUMERIC DEFAULT 0,    -- Facturación bruta
  gastos_asociados NUMERIC DEFAULT 0,
  neto_liquidar NUMERIC NOT NULL,   -- Neto a liquidar del show (ej: 16419.85)
  estado_facturacion TEXT DEFAULT 'Pendiente', -- 'Facturado' | 'Pendiente' | 'Cobrado'
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla Financiera de Facturas / Gastos (Importada desde Google Sheets)
CREATE TABLE IF NOT EXISTS public.facturas_gastos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  artista_id TEXT REFERENCES public.artistas(id) ON DELETE CASCADE,
  codigo TEXT,                      -- ej: '26C', 'D1291'
  tipo_gasto TEXT,                  -- ej: '1.414', '1.294'
  num_factura TEXT,                 -- ej: 'M2026-0032', '14/2025'
  fecha_factura TEXT,               -- ej: '17/06/2026'
  proveedor TEXT NOT NULL,          -- ej: 'ZAZO GOMEZ, ISMAEL'
  concepto TEXT NOT NULL,           -- ej: 'MÚSICO', 'TRANSPORTES', 'BILLETE AVION'
  show_id TEXT,                     -- ej: '25_806'
  fecha_concierto TEXT,             -- ej: '26/05/2026'
  ciudad_detalle TEXT NOT NULL,     -- ej: 'Marina Reche - Ensayos - 26/05/26 - Caché'
  base_imponible NUMERIC NOT NULL,  -- ej: -100.00 (valor negativo para gasto)
  categoria TEXT DEFAULT 'Músicos', -- 'Músicos', 'Vuelos y Transporte', 'Suplidos', 'Producción'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Aprobación de Liquidación por el Artista (OK / ACEPTACIÓN)
CREATE TABLE IF NOT EXISTS public.liquidaciones_aprobadas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  artista_id TEXT REFERENCES public.artistas(id) ON DELETE CASCADE,
  temporada TEXT NOT NULL,          -- ej: '2025/2026'
  total_liquidado NUMERIC NOT NULL, -- ej: 22871.23
  is_approved BOOLEAN DEFAULT TRUE,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT NOT NULL,
  signature_name TEXT NOT NULL,
  notes TEXT
);

-- Habilitar RLS básico
ALTER TABLE public.artistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones_aprobadas ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública con clave anon (o filtrada por auth)
CREATE POLICY "Lectura anonima artistas" ON public.artistas FOR SELECT USING (true);
CREATE POLICY "Lectura anonima shows" ON public.eventos_shows FOR SELECT USING (true);
CREATE POLICY "Lectura anonima gastos" ON public.facturas_gastos FOR SELECT USING (true);
CREATE POLICY "Lectura anonima aprobaciones" ON public.liquidaciones_aprobadas FOR ALL USING (true);
`;
