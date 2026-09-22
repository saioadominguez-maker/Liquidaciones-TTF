import { Artist, ShowEvent, PendingExpense, SettlementStatus } from '../types';
import { getSupabase, getStoredSupabaseConfig } from './supabase';
import {
  ARTISTS_LIST,
  INITIAL_SHOWS_MARINA,
  INITIAL_EXPENSES_MARINA,
  INITIAL_SETTLEMENT_STATUS_MARINA,
  INITIAL_SHOWS_ALVARO,
  INITIAL_EXPENSES_ALVARO,
  INITIAL_SETTLEMENT_STATUS_ALVARO,
} from '../data/mockData';

const STORAGE_SHOWS_PREFIX = 'portal_shows_';
const STORAGE_EXPENSES_PREFIX = 'portal_expenses_';
const STORAGE_STATUS_PREFIX = 'portal_status_';

export async function fetchArtistData(artistId: string): Promise<{
  shows: ShowEvent[];
  expenses: PendingExpense[];
  status: SettlementStatus;
  dataSource: 'supabase' | 'local_demo';
}> {
  const { useLive } = getStoredSupabaseConfig();
  const supabase = getSupabase();

  // Si el usuario activó conexión en vivo a Supabase y el cliente está disponible
  if (useLive && supabase) {
    try {
      const [showsRes, expRes, statusRes] = await Promise.all([
        supabase.from('eventos_shows').select('*').eq('artista_id', artistId).order('fecha', { ascending: true }),
        supabase.from('facturas_gastos').select('*').eq('artista_id', artistId).order('fecha_factura', { ascending: false }),
        supabase.from('liquidaciones_aprobadas').select('*').eq('artista_id', artistId).maybeSingle(),
      ]);

      if (!showsRes.error && showsRes.data && showsRes.data.length > 0) {
        const shows: ShowEvent[] = showsRes.data.map((s: any) => ({
          id: s.id,
          artist_id: s.artista_id,
          show_code: s.show_code,
          ciudad: s.ciudad,
          fecha: s.fecha,
          venue: s.venue,
          cache_bruto: Number(s.cache_bruto || 0),
          gastos_asociados: Number(s.gastos_asociados || 0),
          neto_liquidar: Number(s.neto_liquidar || 0),
          estado_facturacion: s.estado_facturacion || 'Pendiente',
          notas: s.notas,
        }));

        const expenses: PendingExpense[] = (expRes.data || []).map((e: any) => ({
          id: e.id,
          artist_id: e.artista_id,
          codigo: e.codigo || '',
          tipo_gasto: e.tipo_gasto || '',
          num_factura: e.num_factura || '',
          fecha_factura: e.fecha_factura || '',
          proveedor: e.proveedor || '',
          concepto: e.concepto || '',
          show_id: e.show_id || '',
          fecha_concierto: e.fecha_concierto || '',
          ciudad_detalle: e.ciudad_detalle || '',
          base_imponible: Number(e.base_imponible || 0),
          categoria: e.categoria || 'Músicos',
        }));

        const pendingExpensesTotal = expenses.reduce((acc, curr) => acc + curr.base_imponible, 0);
        const totalNetoShows = shows.reduce((acc, curr) => acc + curr.neto_liquidar, 0);

        const status: SettlementStatus = statusRes.data
          ? {
              id: statusRes.data.id,
              artist_id: statusRes.data.artista_id,
              temporada: statusRes.data.temporada || '2025/2026',
              total_ano: totalNetoShows,
              total_facturado: 0,
              total_pendiente: totalNetoShows,
              gastos_pendientes_total: pendingExpensesTotal,
              total_liquidar_neto: totalNetoShows,
              is_approved: !!statusRes.data.is_approved,
              approved_at: statusRes.data.approved_at,
              approved_by: statusRes.data.approved_by,
              signature_name: statusRes.data.signature_name,
              notes: statusRes.data.notes,
            }
          : {
              id: `status_${artistId}`,
              artist_id: artistId,
              temporada: '2025/2026',
              total_ano: totalNetoShows,
              total_facturado: 0,
              total_pendiente: totalNetoShows,
              gastos_pendientes_total: pendingExpensesTotal,
              total_liquidar_neto: totalNetoShows,
              is_approved: false,
            };

        return { shows, expenses, status, dataSource: 'supabase' };
      }
    } catch (err) {
      console.warn('Fallo consultando Supabase directo, recurriendo a datos locales/cacheados:', err);
    }
  }

  // Fallback con persistencia local
  const cachedShows = localStorage.getItem(STORAGE_SHOWS_PREFIX + artistId);
  const cachedExpenses = localStorage.getItem(STORAGE_EXPENSES_PREFIX + artistId);
  const cachedStatus = localStorage.getItem(STORAGE_STATUS_PREFIX + artistId);

  let shows: ShowEvent[] = [];
  let expenses: PendingExpense[] = [];
  let status: SettlementStatus;

  if (artistId === 'marina_reche') {
    shows = cachedShows ? JSON.parse(cachedShows) : INITIAL_SHOWS_MARINA;
    expenses = cachedExpenses ? JSON.parse(cachedExpenses) : INITIAL_EXPENSES_MARINA;
    status = cachedStatus ? JSON.parse(cachedStatus) : INITIAL_SETTLEMENT_STATUS_MARINA;
  } else if (artistId === 'alvaro_de_luna') {
    shows = cachedShows ? JSON.parse(cachedShows) : INITIAL_SHOWS_ALVARO;
    expenses = cachedExpenses ? JSON.parse(cachedExpenses) : INITIAL_EXPENSES_ALVARO;
    status = cachedStatus ? JSON.parse(cachedStatus) : INITIAL_SETTLEMENT_STATUS_ALVARO;
  } else {
    shows = cachedShows ? JSON.parse(cachedShows) : [];
    expenses = cachedExpenses ? JSON.parse(cachedExpenses) : [];
    status = cachedStatus
      ? JSON.parse(cachedStatus)
      : {
          id: `status_${artistId}`,
          artist_id: artistId,
          temporada: '2025/2026',
          total_ano: 0,
          total_facturado: 0,
          total_pendiente: 0,
          gastos_pendientes_total: 0,
          total_liquidar_neto: 0,
          is_approved: false,
        };
  }

  return { shows, expenses, status, dataSource: 'local_demo' };
}

export async function approveSettlement(
  artistId: string,
  userEmail: string,
  signatureName: string,
  notes?: string
): Promise<SettlementStatus> {
  const { useLive } = getStoredSupabaseConfig();
  const supabase = getSupabase();
  const now = new Date().toISOString();

  // Si Supabase está en vivo
  if (useLive && supabase) {
    try {
      const { data, error } = await supabase.from('liquidaciones_aprobadas').upsert({
        artista_id: artistId,
        temporada: '2025/2026',
        total_liquidado: 22871.23,
        is_approved: true,
        approved_at: now,
        approved_by: userEmail,
        signature_name: signatureName,
        notes: notes || 'Conformidad emitida por el artista mediante el portal web.',
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          artist_id: data.artista_id,
          temporada: data.temporada,
          total_ano: 22871.23,
          total_facturado: 0,
          total_pendiente: 22871.23,
          gastos_pendientes_total: -1656.79,
          total_liquidar_neto: 22871.23,
          is_approved: true,
          approved_at: data.approved_at,
          approved_by: data.approved_by,
          signature_name: data.signature_name,
          notes: data.notes,
        };
      }
    } catch (e) {
      console.warn('Error al guardar aprobación en Supabase, guardando en local:', e);
    }
  }

  // Guardado en LocalStorage
  const cachedStatusStr = localStorage.getItem(STORAGE_STATUS_PREFIX + artistId);
  const baseStatus: SettlementStatus = cachedStatusStr
    ? JSON.parse(cachedStatusStr)
    : (artistId === 'marina_reche' ? INITIAL_SETTLEMENT_STATUS_MARINA : INITIAL_SETTLEMENT_STATUS_ALVARO);

  const updatedStatus: SettlementStatus = {
    ...baseStatus,
    is_approved: true,
    approved_at: now,
    approved_by: userEmail,
    signature_name: signatureName,
    notes: notes || 'Conformidad emitida por el artista mediante el portal web.',
  };

  localStorage.setItem(STORAGE_STATUS_PREFIX + artistId, JSON.stringify(updatedStatus));
  return updatedStatus;
}

export function revokeApproval(artistId: string): SettlementStatus {
  const cachedStatusStr = localStorage.getItem(STORAGE_STATUS_PREFIX + artistId);
  const baseStatus: SettlementStatus = cachedStatusStr
    ? JSON.parse(cachedStatusStr)
    : (artistId === 'marina_reche' ? INITIAL_SETTLEMENT_STATUS_MARINA : INITIAL_SETTLEMENT_STATUS_ALVARO);

  const updatedStatus: SettlementStatus = {
    ...baseStatus,
    is_approved: false,
    approved_at: undefined,
    approved_by: undefined,
    signature_name: undefined,
  };

  localStorage.setItem(STORAGE_STATUS_PREFIX + artistId, JSON.stringify(updatedStatus));
  return updatedStatus;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
