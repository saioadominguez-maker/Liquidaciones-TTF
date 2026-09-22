import React from 'react';
import { SettlementStatus, ShowEvent } from '../types';
import { formatEuro } from '../lib/dataService';
import { Clock, CheckCircle2, ArrowRight, Banknote, ShieldAlert, FileText, Send } from 'lucide-react';

interface PendingBillingViewProps {
  status: SettlementStatus;
  shows: ShowEvent[];
  onOpenApprovalModal: () => void;
}

export const PendingBillingView: React.FC<PendingBillingViewProps> = ({
  status,
  shows,
  onOpenApprovalModal,
}) => {
  return (
    <div id="pending-billing-view" className="space-y-6 mb-8">
      {/* Tarjeta de estado de pagos y facturación */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Estado de Pagos y Facturación</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Pendientes de Cobro y Tramitación</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Estado de la liquidación actual para tramitar la orden de transferencia correspondiente a los shows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
              <div className="text-[11px] font-semibold text-amber-800 uppercase">Importe Pendiente</div>
              <div className="text-xl font-bold font-mono text-amber-900">{formatEuro(status.total_pendiente)}</div>
            </div>
          </div>
        </div>

        {/* Flujo paso a paso para el pago */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Flujo de Liquidación y Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Paso 1: Visto bueno del artista */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                status.is_approved
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-amber-300 bg-amber-50/70 ring-2 ring-amber-400/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paso 1</span>
                {status.is_approved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div className="font-bold text-sm text-slate-900 mb-1">Visto Bueno (OK)</div>
              <p className="text-xs text-slate-600 mb-3">
                {status.is_approved
                  ? `Conformidad otorgada por ${status.signature_name || 'el artista'}.`
                  : 'Requiere que el artista conectado revise y haga clic en ACEPTAR.'}
              </p>
              {!status.is_approved && (
                <button
                  type="button"
                  onClick={onOpenApprovalModal}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Dar OK Ahora
                </button>
              )}
            </div>

            {/* Paso 2: Generación del acta */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paso 2</span>
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="font-bold text-sm text-slate-900 mb-1">Hoja de Liquidación</div>
              <p className="text-xs text-slate-600">
                Cierre oficial con deducción de los gastos (-1.656,79 €) y balance definitivo por show.
              </p>
            </div>

            {/* Paso 3: Emisión de factura */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paso 3</span>
                <Send className="w-4 h-4 text-slate-600" />
              </div>
              <div className="font-bold text-sm text-slate-900 mb-1">Factura del Artista</div>
              <p className="text-xs text-slate-600">
                Emisión de factura por el importe neto liquidado a la promotora/agencia.
              </p>
            </div>

            {/* Paso 4: Pago por transferencia */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Paso 4</span>
                <Banknote className="w-4 h-4 text-slate-600" />
              </div>
              <div className="font-bold text-sm text-slate-900 mb-1">Transferencia Bancaria</div>
              <p className="text-xs text-slate-600">
                Ingreso en cuenta bancaria y remisión del justificante de pago al artista.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de shows con estado de facturación pendiente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Shows en Espera de Facturación</h3>
        <p className="text-xs text-slate-600 mb-4">
          Conciertos cuyos importes netos forman parte de la bolsa pendiente de 22.871,23 €
        </p>

        <div className="divide-y divide-slate-100">
          {shows.map((show) => (
            <div key={show.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                    {show.show_code}
                  </span>
                  <span className="font-semibold text-sm text-slate-900">{show.ciudad}</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{show.venue || 'Concierto en gira'}</div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-slate-900">{formatEuro(show.neto_liquidar)}</div>
                <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {show.estado_facturacion}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
