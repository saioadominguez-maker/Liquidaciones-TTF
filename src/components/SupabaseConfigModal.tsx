import React, { useState } from 'react';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SETUP,
  getSupabase,
} from '../lib/supabase';
import {
  X,
  Database,
  Copy,
  Check,
  ServerOff,
  Table,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [useLive, setUseLive] = useState(currentConfig.useLive);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'creds' | 'sql' | 'sheets'>('creds');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey, useLive);
    onConfigUpdated();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestResult('Probando conexión directa desde el cliente...');
    saveSupabaseConfig(url, anonKey, true);
    const client = getSupabase();
    if (!client) {
      setTestResult('Error: Debes introducir una URL y clave anon válidas de Supabase.');
      return;
    }

    try {
      const { data, error } = await client.from('eventos_shows').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          setTestResult('Conexión con Supabase establecida con éxito, pero la tabla "eventos_shows" aún no ha sido creada. Puedes crearla con la pestaña "Script SQL".');
        } else {
          setTestResult(`Respuesta de Supabase: ${error.message}`);
        }
      } else {
        setTestResult('¡Conexión directa exitosa con Supabase! Tabla encontrada.');
      }
    } catch (e: any) {
      setTestResult(`Error de red o CORS: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Conexión Directa a Supabase</h3>
              <p className="text-xs text-slate-600">
                Frontend directo sin servidor intermedio • Listo para Vercel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('creds')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'creds'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Credenciales Incrustadas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Script SQL (Tablas)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sheets'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Importar Google Sheets
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6">
          {activeTab === 'creds' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ServerOff className="w-4 h-4 text-emerald-600" />
                  <span>Sin servidor backend (Directo Client-Side)</span>
                </div>
                <p>
                  Tal como solicitaste, la conexión se realiza directamente desde el cliente (React) mediante
                  la librería <code>@supabase/supabase-js</code>. Las credenciales están preparadas para ser incrustadas
                  en <code>src/lib/supabase.ts</code> para desplegar en Vercel sin tener que configurar variables en su panel.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SUPABASE PROJECT URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SUPABASE ANON PUBLIC KEY
                </label>
                <textarea
                  rows={2}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="toggle-live"
                  checked={useLive}
                  onChange={(e) => setUseLive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="toggle-live" className="text-xs font-medium text-slate-800 cursor-pointer">
                  Activar consulta en tiempo real a Supabase (si está desmarcado, utiliza los datos cargados de la plantilla)
                </label>
              </div>

              {testResult && (
                <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 break-words">
                  {testResult}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Probar Conexión
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Estructura de las 3 Tablas en Supabase</div>
                  <p className="text-[11px] text-slate-600">
                    Copia y pega este script en el <strong>SQL Editor</strong> de tu proyecto Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Cómo importar los Google Sheets en Supabase</span>
                </div>
                <p className="text-[11px] text-emerald-950">
                  Las tablas han sido diseñadas con los encabezados exactos de tu hoja de cálculo.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-1">
                    1. Tabla de Eventos / Shows (Información General)
                  </div>
                  <p className="text-slate-600 mb-1.5">
                    Exporta tu Google Sheet de eventos a formato <code>.csv</code> e impórtalo en la tabla{' '}
                    <code>public.eventos_shows</code> desde el Table Editor de Supabase.
                  </p>
                  <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200">
                    Columnas: show_code, ciudad, fecha, cache_bruto, neto_liquidar, estado_facturacion, artista_id
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-1">
                    2. Tabla Financiera de Facturas / Gastos
                  </div>
                  <p className="text-slate-600 mb-1.5">
                    Exporta tu hoja de facturas a <code>.csv</code> e impórtala en la tabla{' '}
                    <code>public.facturas_gastos</code>.
                  </p>
                  <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200">
                    Columnas: codigo, tipo_gasto, num_factura, fecha_factura, proveedor, concepto, show_id, ciudad_detalle, base_imponible
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-1">
                    3. Filtrado automático por Login de Artista
                  </div>
                  <p className="text-slate-600">
                    Al incluir el campo <code>artista_id</code> (ej: <code>marina_reche</code>), la aplicación
                    filtra automáticamente solo las filas pertenecientes al artista que inició sesión.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
