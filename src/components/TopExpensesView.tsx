import React, { useMemo } from 'react';
import { PendingExpense, ShowEvent } from '../types';
import { formatEuro } from '../lib/dataService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { TrendingUp, AlertTriangle, PieChart as PieIcon, BarChart3, Building2 } from 'lucide-react';

interface TopExpensesViewProps {
  expenses: PendingExpense[];
  shows: ShowEvent[];
}

export const TopExpensesView: React.FC<TopExpensesViewProps> = ({ expenses, shows }) => {
  // 1. Ordenar por mayor gasto absoluto
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => Math.abs(b.base_imponible) - Math.abs(a.base_imponible));
  }, [expenses]);

  // 2. Agrupación por categoría
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const cat = e.categoria || (e.concepto.includes('AVION') || e.concepto.includes('TRANSP') ? 'Vuelos y Transporte' : 'Músicos');
      const current = map.get(cat) || 0;
      map.set(cat, current + Math.abs(e.base_imponible));
    });

    const colors = ['#0f766e', '#0284c7', '#d97706', '#64748b', '#9333ea'];
    let idx = 0;
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      color: colors[idx++ % colors.length],
    }));
  }, [expenses]);

  // 3. Agrupación por proveedor principal
  const providerData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const current = map.get(e.proveedor) || 0;
      map.set(e.proveedor, current + Math.abs(e.base_imponible));
    });

    return Array.from(map.entries())
      .map(([provider, amount]) => ({
        provider: provider.length > 20 ? provider.slice(0, 18) + '...' : provider,
        fullName: provider,
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const totalGastosAbs = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Math.abs(curr.base_imponible), 0);
  }, [expenses]);

  return (
    <div id="top-expenses-view" className="space-y-6 mb-8">
      {/* Encabezado de la sección */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Análisis Financiero de Gastos</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Mayores Gastos y Desglose de Facturación</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Identificación de las partidas de gasto más significativas pendientes de regularizar en la liquidación.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Total Gastos Auditados</div>
            <div className="text-lg font-mono font-bold text-rose-600">-{formatEuro(totalGastosAbs)}</div>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Nº Facturas</div>
            <div className="text-lg font-mono font-bold text-slate-800">{expenses.length}</div>
          </div>
        </div>
      </div>

      {/* Gráficos comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Proveedores con mayor importe acumulado */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>Top Proveedores por Gasto Acumulado</span>
              </h3>
              <p className="text-xs text-slate-600">Facturación acumulada por proveedor (€)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => `${v}€`} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="provider" type="category" stroke="#475569" fontSize={11} width={130} />
                <Tooltip
                  formatter={(val: any) => [`${formatEuro(Number(val))}`, 'Total Gasto']}
                  labelFormatter={(name) => `Proveedor: ${name}`}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#0f766e" radius={[0, 4, 4, 0]}>
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0f766e' : '#14b8a6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Desglose por Categoría */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-sky-600" />
                <span>Distribución por Naturaleza de Gasto</span>
              </h3>
              <p className="text-xs text-slate-600">Músicos vs Logística / Vuelos</p>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${formatEuro(Number(val))}`, 'Total']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <div className="font-mono font-semibold text-slate-900">{formatEuro(cat.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista detallada de los 5 mayores gastos individuales */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Facturas con Mayor Importe Individual</h3>
        <p className="text-xs text-slate-600 mb-4">
          Detalle de las líneas de mayor cuantía en la liquidación de la gira
        </p>

        <div className="space-y-3">
          {sortedExpenses.slice(0, 5).map((exp, index) => (
            <div
              key={exp.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{exp.proveedor}</div>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                      {exp.num_factura}
                    </span>
                    <span>•</span>
                    <span>{exp.concepto}</span>
                    <span>•</span>
                    <span className="text-slate-600">{exp.ciudad_detalle}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center justify-between sm:block pl-10 sm:pl-0">
                <div className="font-mono font-bold text-base text-rose-600">
                  {formatEuro(exp.base_imponible)}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">Fra. del {exp.fecha_factura}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
