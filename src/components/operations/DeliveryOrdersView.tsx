import React, { useState } from 'react';
import { ArrowUpRight, Plus, CheckCircle2, PackageCheck, Box, UserCheck, AlertCircle } from 'lucide-react';
import { Location, Operation, Product } from '../../types';
import { Badge } from '../ui/Badge';

interface DeliveryOrdersViewProps {
  deliveries: Operation[];
  products: Product[];
  locations: Location[];
  onOpenCreate: () => void;
  onValidate: (id: string) => void;
  onUpdateStatus: (id: string, status: any) => void;
  onSelectDelivery: (op: Operation) => void;
  getProductStock: (id: string, locId?: string) => number;
}

export const DeliveryOrdersView: React.FC<DeliveryOrdersViewProps> = ({
  deliveries,
  products,
  locations,
  onOpenCreate,
  onValidate,
  onUpdateStatus,
  onSelectDelivery,
  getProductStock,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Delivery Orders (Outgoing Stock)</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
              - Stock Deduction
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            When customer orders leave the warehouse: 1. Pick items → 2. Pack items → 3. Click{' '}
            <strong className="text-purple-400">Validate</strong> to deduct stock automatically and log shipment to
            the Stock Ledger.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Create Delivery Order
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Outgoing Dispatches ({deliveries.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Process: Pick → Pack → Validate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Source Warehouse Location</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Items to Ship</th>
                <th className="py-3 px-4">Picking / Packing Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No delivery orders yet. Click &quot;+ Create Delivery Order&quot; to ship products.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => {
                  const firstItem = del.items[0];
                  const availableInSource = firstItem
                    ? getProductStock(firstItem.productId, del.sourceLocationId)
                    : 0;
                  const isStockInsufficient = firstItem && availableInSource < firstItem.demandedQty;

                  return (
                    <tr
                      key={del.id}
                      onClick={() => onSelectDelivery(del)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {del.refNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{del.partnerName}</div>
                        <div className="text-[10px] text-slate-400">Customer Shipment</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{del.sourceLocationName}</span>
                        {firstItem && del.status !== 'done' && (
                          <div
                            className={`text-[10px] ${
                              isStockInsufficient ? 'text-rose-600 font-bold' : 'text-slate-400'
                            }`}
                          >
                            Avail: {availableInSource} {firstItem.uom}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {del.scheduledDate}
                      </td>
                      <td className="py-3 px-4">
                        {del.items.map((it, idx) => (
                          <div key={idx} className="font-semibold text-purple-900 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-[11px] font-mono text-purple-900">
                              -{it.demandedQty} {it.uom}
                            </span>
                            <span className="text-slate-700 text-xs font-medium">{it.productName}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {del.status === 'draft' && (
                            <button
                              onClick={() => onUpdateStatus(del.id, 'waiting')}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                            >
                              Start Picking →
                            </button>
                          )}
                          {del.status === 'waiting' && (
                            <button
                              onClick={() => onUpdateStatus(del.id, 'ready')}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                            >
                              Pack Items →
                            </button>
                          )}
                          {(del.status === 'ready' || del.status === 'done' || del.status === 'canceled') && (
                            <Badge variant="status" status={del.status} size="sm">
                              {del.status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {del.status !== 'done' && del.status !== 'canceled' ? (
                          <button
                            onClick={() => onValidate(del.id)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-all"
                          >
                            Validate (-Stock)
                          </button>
                        ) : (
                          <span className="text-xs text-purple-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Dispatched
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
