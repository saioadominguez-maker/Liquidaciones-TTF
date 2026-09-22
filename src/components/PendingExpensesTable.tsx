import React, { useState, useMemo } from 'react';
import { PendingExpense } from '../types';
import { formatEuro } from '../lib/dataService';
import { Search, Filter, Download, ArrowUpDown, FileSpreadsheet } from 'lucide-react';

interface PendingExpensesTableProps {
  expenses: PendingExpense[];
}

export const PendingExpensesTable: React.FC<PendingExpensesTableProps> = ({ expenses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('ALL');

  const conceptsList = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.concepto) set.add(e.concepto.trim());
    });
    return Array.from(set);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ciudad_detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.num_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.show_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchConcept = selectedConcept === 'ALL' || item.concepto.trim() === selectedConcept;

      return matchSearch && matchConcept;
    });
  }, [expenses, searchTerm, selectedConcept]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.base_imponible, 0);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Tipo Gasto',
      'Nº Factura',
      'Fecha Factura',
      'Proveedor',
      'Concepto',
      'ID Show',
      'Ciudad / Detalle Concierto',
      'Base Imponible (€)',
    ];

    const rows = filteredExpenses.map((e) => [
      `"${e.codigo}"`,
      `"${e.tipo_gasto}"`,
      `"${e.num_factura}"`,
      `"${e.fecha_factura}"`,
      `"${e.proveedor}"`,
      `"${e.concepto}"`,
      `"${e.show_id}"`,
      `"${e.ciudad_detalle.replace(/"/g, '""')}"`,
      e.base_imponible.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gastos_pendientes_liquidar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="pending-expenses-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* Título de la tabla idéntico al Excel */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-700" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                GASTOS PENDIENTES DE LIQUIDAR
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Facturas imputadas a producción, músicos y logística de los shows pendientes de regularizar
            </p>
          </div>

          {/* Acciones de filtro y exportación */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por proveedor o concepto..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-52"
              />
            </div>

            {conceptsList.length > 0 && (
              <select
                value={selectedConcept}
                onChange={(e) => setSelectedConcept(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">Todos los conceptos ({expenses.length})</option>
                {conceptsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Descargar tabla en formato CSV compatible con Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de la Tabla con estilo exacto al Excel de la imagen */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          {/* Cabecera con fondo verde azulado suave característico del diseño original */}
          <thead>
            <tr className="bg-teal-500/25 border-b border-teal-600/30 text-slate-900 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Código</th>
              <th className="py-2.5 px-3">Tipo gasto</th>
              <th className="py-2.5 px-3">Fecha fra.</th>
              <th className="py-2.5 px-3">Proveedor</th>
              <th className="py-2.5 px-3">Concepto</th>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Fecha Concierto</th>
              <th className="py-2.5 px-3">Ciudad / Detalle</th>
              <th className="py-2.5 px-3 text-right">Base Imponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredExpenses.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{item.codigo}</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{item.tipo_gasto || '-'}</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">{item.num_factura}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">{item.proveedor}</td>
                <td className="py-2.5 px-3">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {item.concepto}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{item.show_id}</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">{item.fecha_factura}</td>
                <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={item.ciudad_detalle}>
                  {item.ciudad_detalle}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600">
                  {formatEuro(item.base_imponible)}
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-600 text-sm">
                  No se encontraron gastos con el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>

          {/* Fila final TOTAL como en la imagen */}
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td colSpan={8} className="py-2.5 px-3 text-right font-bold uppercase text-slate-900 tracking-wider text-xs">
                TOTAL
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-sm bg-teal-500/25 text-slate-900 border-l border-teal-600/30">
                {formatEuro(totalFiltered)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
