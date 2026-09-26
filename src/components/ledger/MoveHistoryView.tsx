import React, { useState } from 'react';
import { History, Search, Download, ArrowRight, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { StockMove } from '../../types';
import { Badge } from '../ui/Badge';

interface MoveHistoryViewProps {
  moves: StockMove[];
}

export const MoveHistoryView: React.FC<MoveHistoryViewProps> = ({ moves }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredMoves = moves.filter((m) => {
    const matchesSearch =
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.fromLocationName.toLowerCase().includes(search.toLowerCase()) ||
      m.toLocationName.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.operationType === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Timestamp,Reference,Operation,Product,SKU,From,To,Quantity,UoM,PerformedBy'];
    const rows = filteredMoves.map(
      (m) =>
        `"${m.timestamp}","${m.reference}","${m.operationType}","${m.productName}","${m.sku}","${m.fromLocationName}","${m.toLocationName}",${m.quantity},"${m.uom}","${m.performedBy}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stocksense_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMoveIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />;
      case 'delivery':
        return <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />;
      case 'internal':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Move History (Stock Ledger)</h1>
              <span className="text-xs text-slate-500">Immutable chronological audit trail</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Every physical product movement (vendor receipt, internal rack transfer, customer delivery, or damage adjustment) is permanently logged here with exact quantities and user stamps.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4" /> Export Audit CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Reference, SKU, or Location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#714B67]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none"
          >
            <option value="all">All Movements</option>
            <option value="receipt">Receipts (+Stock)</option>
            <option value="delivery">Deliveries (-Stock)</option>
            <option value="internal">Internal Transfers</option>
            <option value="adjustment">Count Adjustments</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Stock Moves Ledger ({filteredMoves.length} records)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Sorted: Most Recent First</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMoves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No movements recorded yet.
                  </td>
                </tr>
              ) : (
                filteredMoves.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {m.reference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium capitalize text-slate-700">
                        {getMoveIcon(m.operationType)}
                        <span>{m.operationType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.sku}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {m.fromLocationName}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1 text-slate-700">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{m.toLocationName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          m.operationType === 'receipt'
                            ? 'text-emerald-700'
                            : m.operationType === 'delivery'
                            ? 'text-purple-700'
                            : m.operationType === 'internal'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {m.operationType === 'receipt' ? '+' : m.operationType === 'delivery' ? '-' : ''}
                        {m.quantity} {m.uom}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium text-[11px]">
                      {m.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
