import React, { useState, useEffect } from 'react';
import { Artist, ShowEvent, PendingExpense, SettlementStatus } from './types';
import { ARTISTS_LIST } from './data/mockData';
import { fetchArtistData, approveSettlement, revokeApproval, formatEuro } from './lib/dataService';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ShowsTable } from './components/ShowsTable';
import { PendingExpensesTable } from './components/PendingExpensesTable';
import { TopExpensesView } from './components/TopExpensesView';
import { PendingBillingView } from './components/PendingBillingView';
import { SettlementApprovalModal } from './components/SettlementApprovalModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  LayoutDashboard,
  TrendingDown,
  Clock,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Building,
} from 'lucide-react';

export default function App() {
  // Estado de sesión
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(() => {
    const saved = localStorage.getItem('portal_current_artist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ARTISTS_LIST[0];
      }
    }
    return ARTISTS_LIST[0]; // Por defecto cargamos a Marina Reche para visualización directa
  });

  // Datos financieros del artista activo
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [expenses, setExpenses] = useState<PendingExpense[]>([]);
  const [status, setStatus] = useState<SettlementStatus | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local_demo'>('local_demo');
  const [isLoading, setIsLoading] = useState(true);

  // Vistas y modales
  const [activeTab, setActiveTab] = useState<'shows' | 'gastos' | 'mayores_gastos' | 'pendientes'>('shows');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Carga de datos al cambiar el artista conectado
  const loadData = async (artistId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchArtistData(artistId);
      setShows(data.shows);
      setExpenses(data.expenses);
      setStatus(data.status);
      setDataSource(data.dataSource);
    } catch (err) {
      console.error('Error cargando datos del artista:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentArtist) {
      loadData(currentArtist.id);
    }
  }, [currentArtist]);

  const handleLogin = (artist: Artist) => {
    setCurrentArtist(artist);
    localStorage.setItem('portal_current_artist', JSON.stringify(artist));
  };

  const handleLogout = () => {
    setCurrentArtist(null);
    localStorage.removeItem('portal_current_artist');
  };

  const handleConfirmApproval = async (signatureName: string, notes?: string) => {
    if (!currentArtist) return;
    const updated = await approveSettlement(
      currentArtist.id,
      currentArtist.email,
      signatureName,
      notes
    );
    setStatus(updated);
  };

  const handleRevokeApproval = () => {
    if (!currentArtist) return;
    const updated = revokeApproval(currentArtist.id);
    setStatus(updated);
  };

  // Si no hay artista conectado, mostrar Login
  if (!currentArtist) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Barra de cabecera */}
      {status && (
        <Header
          artist={currentArtist}
          status={status}
          dataSource={dataSource}
          onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Banner de Estado de Aceptación */}
      {status && (
        <div className="bg-slate-900 text-white py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {status.is_approved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Liquidación ACEPTADA (OK)</strong> • Conformidad otorgada por{' '}
                    {status.signature_name || currentArtist.name} el{' '}
                    {status.approved_at ? new Date(status.approved_at).toLocaleDateString('es-ES') : ''}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Liquidación Pendiente de Aprobación</strong> • Revisa los shows y haz clic en ACEPTAR
                    para dar el visto bueno.
                  </span>
                </>
              )}
            </div>

            {!status.is_approved && (
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Aceptar Liquidación</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Selector de Pestañas / Subpantallas */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              id="tab-shows"
              onClick={() => setActiveTab('shows')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'shows'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen Principal (Shows & Gastos)</span>
            </button>

            <button
              type="button"
              id="tab-gastos"
              onClick={() => setActiveTab('gastos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'gastos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Gastos Pendientes de Liquidar ({expenses.length})</span>
            </button>

            <button
              type="button"
              id="tab-mayores-gastos"
              onClick={() => setActiveTab('mayores_gastos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'mayores_gastos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Mayores Gastos (Gráficas)</span>
            </button>

            <button
              type="button"
              id="tab-pendientes"
              onClick={() => setActiveTab('pendientes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pendientes'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pendientes & Estado de Pagos</span>
            </button>
          </div>

          {/* Selector rápido para probar el filtro de 1 artista según login */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium">Artista Conectado:</span>
            <select
              value={currentArtist.id}
              onChange={(e) => {
                const found = ARTISTS_LIST.find((a) => a.id === e.target.value);
                if (found) handleLogin(found);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {ARTISTS_LIST.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.tourName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tarjetas de Resumen Numérico (TOTAL AÑO, FACTURADO, PENDIENTE, GASTOS) */}
        {status && <SummaryCards status={status} onOpenApprovalModal={() => setIsApprovalModalOpen(true)} />}

        {/* Renderizado de Vistas según pestaña */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-600 text-sm">
            Cargando liquidación del artista...
          </div>
        ) : (
          <>
            {activeTab === 'shows' && status && (
              <div className="space-y-8">
                {/* 1. Tabla Principal de Shows (TOTAL AÑO & FACTURADO) */}
                <ShowsTable shows={shows} status={status} />

                {/* 2. Tabla de Gastos Pendientes de Liquidar (Directamente visible como en la captura) */}
                <PendingExpensesTable expenses={expenses} />
              </div>
            )}

            {activeTab === 'gastos' && (
              <div>
                <PendingExpensesTable expenses={expenses} />
              </div>
            )}

            {activeTab === 'mayores_gastos' && (
              <TopExpensesView expenses={expenses} shows={shows} />
            )}

            {activeTab === 'pendientes' && status && (
              <PendingBillingView
                status={status}
                shows={shows}
                onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Taste The Floor</span>
            <span>•</span>
            <span>Portal de Liquidaciones y Visto Bueno de Artistas</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Configurar Conexión Supabase & Tablas Google Sheets
            </button>
            <span>•</span>
            <span>Versión 1.0 (Vercel Direct Client)</span>
          </div>
        </div>
      </footer>

      {/* Modal de Aceptación / Visto Bueno de la Liquidación */}
      {status && (
        <SettlementApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          artist={currentArtist}
          status={status}
          onConfirmApproval={handleConfirmApproval}
          onRevokeApproval={handleRevokeApproval}
        />
      )}

      {/* Modal de Conexión Supabase & Tablas */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          if (currentArtist) loadData(currentArtist.id);
        }}
      />
    </div>
  );
}
