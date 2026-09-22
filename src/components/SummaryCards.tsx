import React from 'react';
import { SettlementStatus } from '../types';
import { formatEuro } from '../lib/dataService';
import {
  CalendarDays,
  Receipt,
  Clock3,
  ReceiptText,
  BadgeCheck,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

interface SummaryCardsProps {
  status: SettlementStatus;
  onOpenApprovalModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ status, onOpenApprovalModal }) => {
  return (
    <div id="summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. TOTAL AÑO / NETO LIQUIDABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Año (Neto)</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
            {formatEuro(status.total_ano)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
            <span>Shows + regularizaciones</span>
          </div>
        </div>
      </div>

      {/* 2. TOTAL FACTURADO */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Facturado</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
            {formatEuro(status.total_facturado)}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            {status.total_facturado === 0 ? 'Sin facturas emitidas este periodo' : 'Facturas procesadas'}
          </div>
        </div>
      </div>

      {/* 3. TOTAL PENDIENTE DE COBRO / FACTURAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Pendiente</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock3 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-900">
            {formatEuro(status.total_pendiente)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>A la espera de orden de pago / factura</span>
          </div>
        </div>
      </div>

      {/* 4. GASTOS PENDIENTES DE LIQUIDAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Gastos Pendientes</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-600">
            {formatEuro(status.gastos_pendientes_total)}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            A deducir de liquidación (8 facturas)
          </div>
        </div>
      </div>
    </div>
  );
};
