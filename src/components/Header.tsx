import React from 'react';
import { Artist, SettlementStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  Database,
  LogOut,
  FileCheck,
  Building2,
  User,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  artist: Artist;
  status: SettlementStatus;
  dataSource: 'supabase' | 'local_demo';
  onOpenApprovalModal: () => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  artist,
  status,
  dataSource,
  onOpenApprovalModal,
  onOpenSupabaseModal,
  onLogout,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo y Nombre del Portal */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm flex-shrink-0">
              TTF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Taste The Floor</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-700">Liquidaciones</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                Portal de Liquidación: {artist.name}
              </h1>
            </div>
          </div>

          {/* Acciones principales & Estado de la Liquidación */}
          <div className="flex items-center gap-3">
            {/* Indicador de Supabase */}
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              id="btn-supabase-status"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
              title="Configuración de tablas y conexión directa a Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase {dataSource === 'supabase' ? 'En Vivo' : 'Directo (Config)'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dataSource === 'supabase' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </button>

            {/* Estado de Aceptación / Botón de OK */}
            {status.is_approved ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-emerald-900 leading-tight">Liquidación Aceptada (OK)</div>
                  <div className="text-[10px] text-emerald-700">
                    Firmado por {status.signature_name || artist.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenApprovalModal}
                  className="ml-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Ver Certificado
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-open-approval"
                onClick={onOpenApprovalModal}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-sm font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Dar OK a la Liquidación</span>
              </button>
            )}

            {/* Perfil del artista & Cerrar Sesión */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-800">{artist.name}</div>
                <div className="text-slate-600 font-mono text-[10px]">{artist.cifOrNif}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                id="btn-logout"
                title="Cerrar sesión de artista"
                className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
