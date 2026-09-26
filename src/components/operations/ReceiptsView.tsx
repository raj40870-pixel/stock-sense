import React, { useState } from 'react';
import { ArrowDownLeft, Plus, CheckCircle2, Clock, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { Location, Operation, Product } from '../../types';
import { Badge } from '../ui/Badge';

interface ReceiptsViewProps {
  receipts: Operation[];
  products: Product[];
  locations: Location[];
  onOpenCreate: () => void;
  onValidate: (id: string) => void;
  onSelectReceipt: (op: Operation) => void;
  getProductStock: (id: string, locId?: string) => number;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  products,
  locations,
  onOpenCreate,
  onValidate,
  onSelectReceipt,
  getProductStock,
}) => {
  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-4 sm:p-6 rounded-2xl border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Receipts (Incoming Goods)</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
              + Stock Addition
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            When raw materials or inventory arrive from external vendors, create a receipt and click{' '}
            <strong className="text-emerald-400">Validate</strong> to automatically increment warehouse stock and log
            the ledger entry.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Receipt</span>
        </button>
      </div>

      {/* Receipts Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Vendor Incoming Shipments ({receipts.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Status: Ready to Validate</span>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Destination Storage</th>
                <th className="py-3 px-4">Arrival Date</th>
                <th className="py-3 px-4">Products & Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No receipts recorded yet. Click &quot;+ Create Receipt&quot; to receive goods from a vendor.
                  </td>
                </tr>
              ) : (
                receipts.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => onSelectReceipt(rec)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rec.refNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rec.partnerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> External Supplier
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {rec.destLocationName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {rec.scheduledDate}
                    </td>
                    <td className="py-3 px-4">
                      {rec.items.map((it, idx) => (
                        <div key={idx} className="font-semibold text-emerald-800 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[11px] font-mono">
                            +{it.demandedQty} {it.uom}
                          </span>
                          <span className="text-slate-700 text-xs font-medium">{it.productName}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="status" status={rec.status} size="sm">
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {rec.status !== 'done' && rec.status !== 'canceled' ? (
                        <button
                          onClick={() => onValidate(rec.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                        >
                          Validate (+Stock)
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Received
                        </span>
                      )}
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
