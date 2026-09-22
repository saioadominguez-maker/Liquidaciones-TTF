import React, { useState } from 'react';
import { ShowEvent, SettlementStatus } from '../types';
import { formatEuro } from '../lib/dataService';
import { MapPin, Calendar, Check, ChevronDown, ChevronUp, Info, Building } from 'lucide-react';

interface ShowsTableProps {
  shows: ShowEvent[];
  status: SettlementStatus;
}

export const ShowsTable: React.FC<ShowsTableProps> = ({ shows, status }) => {
  const [expandedShowId, setExpandedShowId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedShowId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="shows-overview-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* BLOQUE PRINCIPAL: TABLA TOTAL AÑO */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>TOTAL AÑO</span>
                <span className="text-xs font-normal text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Liquidación de Shows
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Desglose individual por show con código de producción y ciudad
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600">Temporada {status.temporada}</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Código Show</th>
                  <th className="py-2.5 px-3">Ciudad / Evento</th>
                  <th className="py-2.5 px-3 text-right">Importe Neto</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shows.map((show) => {
                  const isNegative = show.neto_liquidar < 0;
                  const isExpanded = expandedShowId === show.id;

                  return (
                    <React.Fragment key={show.id}>
                      <tr
                        onClick={() => toggleExpand(show.id)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-slate-50/70' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-medium text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100 group-hover:bg-white border border-slate-200/80 transition-colors">
                            {show.show_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{show.ciudad}</span>
                            {show.neto_liquidar < 0 && (
                              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                Regularización
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono font-semibold ${
                            isNegative ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {formatEuro(show.neto_liquidar)}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-600 group-hover:text-slate-800">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>

                      {/* Desglose desplegable con detalles del show */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={4} className="p-4">
                            <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <span className="font-semibold text-slate-700 block mb-0.5">Recinto / Venue:</span>
                                <span className="text-slate-800 flex items-center gap-1">
                                  <Building className="w-3.5 h-3.5 text-slate-600" />
                                  {show.venue || 'No especificado'}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700 block mb-0.5">Fecha Concierto:</span>
                                <span className="text-slate-800 flex items-center gap-1 font-mono">
                                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                  {show.fecha}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700 block mb-0.5">Estado Facturación:</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                  {show.estado_facturacion}
                                </span>
                              </div>
                            </div>
                            {show.notas && (
                              <div className="mt-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60 flex items-start gap-1.5">
                                <Info className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                                <span>{show.notas}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Fila: Gastos pendientes de liquidar (exacto como en el Excel) */}
                <tr className="border-t border-slate-200 hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono text-slate-600 italic">Deducción</td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>Gastos pendientes de liquidar</span>
                      <span className="text-[10px] text-slate-600">(ver tabla inferior)</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">
                    {formatEuro(status.gastos_pendientes_total)}
                  </td>
                  <td className="py-3 px-2"></td>
                </tr>

                {/* FILA TOTAL DESTACADA (con fondo característico como en la plantilla del usuario) */}
                <tr className="bg-teal-500/25 border-t-2 border-teal-600/40 font-bold text-slate-900">
                  <td className="py-3 px-3 uppercase tracking-wider font-mono text-xs">TOTAL</td>
                  <td className="py-3 px-3 font-bold text-slate-900">Total Liquidación Artista</td>
                  <td className="py-3 px-3 text-right font-mono text-base font-bold text-slate-900">
                    {formatEuro(status.total_liquidar_neto)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Check className="w-4 h-4 text-teal-800 inline-block" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOQUE LATERAL: TOTAL FACTURADO (como en la captura del usuario) */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">TOTAL FACTURADO</h3>
            <span className="text-[11px] text-slate-600">Estado de cobros y facturación</span>
          </div>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600">Facturado</span>
              <span className="font-semibold text-slate-800">{formatEuro(status.total_facturado)}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-slate-200/80">
              <span className="text-slate-600 font-medium">Pendiente</span>
              <span className="font-bold text-amber-900 text-base">{formatEuro(status.total_pendiente)}</span>
            </div>
          </div>

          {/* Estado de validación */}
          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-600 mb-2 font-medium">Estado del visto bueno (OK):</div>
            {status.is_approved ? (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                  <Check className="w-4 h-4" />
                  <span>Aprobado por el Artista</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Liquidación conformada el {status.approved_at ? new Date(status.approved_at).toLocaleDateString('es-ES') : 'recientemente'}.
                  Lista para emisión de factura y orden de transferencia.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <div className="font-bold text-amber-800 mb-1">Pendiente de Aceptación</div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Por favor, revisa el detalle de los shows y gastos y haz clic en el botón superior{' '}
                  <strong>&quot;Dar OK a la Liquidación&quot;</strong> para confirmar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
