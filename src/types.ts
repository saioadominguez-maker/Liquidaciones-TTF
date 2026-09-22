export interface Artist {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tourName: string;
  cifOrNif: string;
}

export interface ShowEvent {
  id: string;
  artist_id: string;
  show_code: string; // e.g. "25_566"
  ciudad: string; // e.g. "Alicante"
  fecha: string;
  venue?: string;
  cache_bruto: number;
  gastos_asociados: number;
  neto_liquidar: number; // e.g. 16419.85
  estado_facturacion: 'Facturado' | 'Pendiente' | 'Cobrado';
  notas?: string;
}

export interface PendingExpense {
  id: string;
  artist_id: string;
  codigo: string; // e.g. "26C", "D1291"
  tipo_gasto: string; // e.g. "1.414", "1.294", "1.580", "1.680", "1.654"
  num_factura: string; // e.g. "M2026-0032", "14/2025", "28"
  fecha_factura: string; // e.g. "17/06/2026"
  proveedor: string; // e.g. "ZAZO GOMEZ, ISMAEL"
  concepto: string; // e.g. "MÚSICO", "GUITARRISTA", "SUPLIDOS", "TRANSPORTES", "BILLETE AVION"
  show_id: string; // e.g. "25_806", "25_532", "25_902"
  fecha_concierto?: string; // e.g. "26/05/2026"
  ciudad_detalle: string; // e.g. "Marina Reche - Ensayos - 26/05/26 - Caché"
  base_imponible: number; // Negative value in table e.g. -100.00
  categoria?: 'Músicos' | 'Vuelos y Transporte' | 'Suplidos' | 'Producción' | 'Otros';
}

export interface SettlementStatus {
  id: string;
  artist_id: string;
  temporada: string;
  total_ano: number;
  total_facturado: number;
  total_pendiente: number;
  gastos_pendientes_total: number;
  total_liquidar_neto: number;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  signature_name?: string;
  notes?: string;
}

export interface SupabaseSettings {
  url: string;
  anonKey: string;
  isConnected: boolean;
  useLiveSupabase: boolean;
}
