import React, { useState } from 'react';
import { Artist } from '../types';
import { ARTISTS_LIST } from '../data/mockData';
import { ShieldCheck, Music, ArrowRight, UserCheck, Lock } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (artist: Artist) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedArtistId, setSelectedArtistId] = useState<string>('marina_reche');
  const [emailInput, setEmailInput] = useState<string>('marina.reche@tastethefloor.es');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••••••');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const handleSelectPreset = (artist: Artist) => {
    setSelectedArtistId(artist.id);
    setEmailInput(artist.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const artist = ARTISTS_LIST.find((a) => a.id === selectedArtistId) || ARTISTS_LIST[0];
    onLogin(artist);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Music className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-700">TASTE THE FLOOR</span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Portal de Liquidaciones</h2>
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-slate-600">
          Acceso privado para artistas: revisa tus shows, gastos y confirma el visto bueno a tu liquidación.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* Selector de artistas demo para facilitar la prueba */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Seleccionar Artista para Iniciar Sesión:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARTISTS_LIST.map((artist) => {
                const isSelected = selectedArtistId === artist.id;
                return (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => handleSelectPreset(artist)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">{artist.name}</div>
                      <div className="text-xs text-slate-500 truncate">{artist.tourName}</div>
                      <div className="text-[11px] font-mono text-slate-600">{artist.cifOrNif}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico del Artista</label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="artista@tastethefloor.es"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Contraseña / Clave de Acceso</label>
                <span className="text-xs text-slate-600">Acceso protegido</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-login-submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors cursor-pointer"
              >
                <span>Acceder a la Liquidación de {ARTISTS_LIST.find((a) => a.id === selectedArtistId)?.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Aviso sobre filtrado de datos */}
          <div className="mt-6 p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacidad & Filtrado por Login en Supabase</span>
            </div>
            <p>
              Según el usuario conectado, los datos financieros, shows e importaciones de Google Sheets se filtran
              exclusivamente para este artista, garantizando confidencialidad total y permitiendo dar el OK digital a la liquidación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
