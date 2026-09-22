import React, { useState } from 'react';
import { Artist, SettlementStatus } from '../types';
import { formatEuro } from '../lib/dataService';
import {
  X,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Printer,
  RotateCcw,
  AlertCircle,
  Building,
} from 'lucide-react';

interface SettlementApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
  status: SettlementStatus;
  onConfirmApproval: (signatureName: string, notes?: string) => Promise<void>;
  onRevokeApproval: () => void;
}

export const SettlementApprovalModal: React.FC<SettlementApprovalModalProps> = ({
  isOpen,
  onClose,
  artist,
  status,
  onConfirmApproval,
  onRevokeApproval,
}) => {
  const [signatureName, setSignatureName] = useState(artist.name);
  const [notes, setNotes] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) return;

    setIsSubmitting(true);
    try {
      await onConfirmApproval(signatureName, notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${status.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-800'}`}>
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {status.is_approved ? 'Certificado de Conformidad (OK)' : 'Aceptar Liquidación de Shows'}
              </h3>
              <p className="text-xs text-slate-600">
                Taste The Floor • {artist.name} ({status.temporada})
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

        {/* Contenido según si ya está aprobada o pendiente */}
        {status.is_approved ? (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-emerald-900">
                  Liquidación Aceptada y Conforme
                </div>
                <div className="text-xs text-emerald-800 mt-1">
                  Has otorgado el visto bueno formal a esta liquidación. La administración de Taste The Floor
                  ha recibido tu conformidad para procesar el pago.
                </div>
              </div>
            </div>

            {/* Recibo / Certificado imprimible */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Artista:</span>
                <span className="font-bold text-slate-900 font-sans">{artist.name} ({artist.cifOrNif})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Temporada / Gira:</span>
                <span className="font-bold text-slate-900">{status.temporada}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Total Neto Liquidado:</span>
                <span className="font-bold text-slate-900 text-sm">{formatEuro(status.total_liquidar_neto)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Gastos Imputados:</span>
                <span className="font-bold text-rose-600">{formatEuro(status.gastos_pendientes_total)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Firmado Digitalmente Por:</span>
                <span className="font-bold text-emerald-800 font-sans">{status.signature_name || artist.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-sans">Fecha y Hora:</span>
                <span className="text-slate-800">
                  {status.approved_at ? new Date(status.approved_at).toLocaleString('es-ES') : 'Registrado'}
                </span>
              </div>
              {status.notes && (
                <div className="pt-1 text-slate-700 font-sans">
                  <span className="font-bold text-slate-900 block mb-0.5">Observaciones:</span>
                  <p className="italic text-xs bg-white p-2.5 rounded border border-slate-200">{status.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onRevokeApproval}
                className="text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Solicitar Revisión / Revocar OK</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Justificante</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApprove} className="p-6 space-y-5">
            {/* Resumen numérico antes de confirmar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Resumen de la Liquidación a Validar:
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 block">Total Shows:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatEuro(status.total_ano)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Deducción de Gastos:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {formatEuro(status.gastos_pendientes_total)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">Neto Final a Liquidar:</span>
                <span className="font-mono font-bold text-teal-800 text-base">
                  {formatEuro(status.total_liquidar_neto)}
                </span>
              </div>
            </div>

            {/* Texto de conformidad */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Declaración de Conformidad</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900">
                Al hacer clic en ACEPTAR, confirmas haber revisado los importes de los conciertos y la relación de
                gastos y facturas deducibles. Se registrará la aprobación con tu firma digital y marca de tiempo.
              </p>
            </div>

            {/* Nombre de firma */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firma Digital (Nombre Completo del Artista o Representante) *
              </label>
              <input
                type="text"
                required
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Nombre y Apellidos"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Observaciones opcionales */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones o Notas para Administración (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ejemplo: Conforme para emisión de factura; cuenta bancaria habitual..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Checkbox de conformidad */}
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs text-slate-700">
                He revisado las partidas de conciertos y gastos de esta liquidación y doy mi <strong>CONFORMIDAD (OK)</strong>.
              </span>
            </label>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-confirm-approval"
                disabled={!hasAgreed || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Guardando...' : 'ACEPTAR LIQUIDACIÓN (OK)'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
