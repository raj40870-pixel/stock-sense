import React from 'react';
import { ArrowLeftRight, Plus, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import { Location, Operation, Product } from '../../types';
import { Badge } from '../ui/Badge';

interface InternalTransfersViewProps {
  transfers: Operation[];
  products: Product[];
  locations: Location[];
  onOpenCreate: () => void;
  onValidate: (id: string) => void;
  onSelectTransfer: (op: Operation) => void;
  getProductStock: (id: string, locId?: string) => number;
}

export const InternalTransfersView: React.FC<InternalTransfersViewProps> = ({
  transfers,
  products,
  locations,
  onOpenCreate,
  onValidate,
  onSelectTransfer,
  getProductStock,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Internal Transfers</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
              ± Inter-location Move
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Shift inventory between internal storage locations (e.g. <em>Main Store → Production Rack</em>, or <em>Rack A → Rack B</em>). Total company stock stays unchanged while individual location balances update with full ledger logs.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + New Internal Transfer
        </button>
      </div>

      {/* Transfers Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All Internal Relocations ({transfers.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Location rebalancing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Transfer Ref</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items Transferred</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No internal transfers logged. Click &quot;+ New Internal Transfer&quot; to move stock between racks.
                  </td>
                </tr>
              ) : (
                transfers.map((intOp) => (
                  <tr
                    key={intOp.id}
                    onClick={() => onSelectTransfer(intOp)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {intOp.refNo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{intOp.sourceLocationName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                        <span>{intOp.destLocationName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {intOp.scheduledDate}
                    </td>
                    <td className="py-3 px-4">
                      {intOp.items.map((it, idx) => (
                        <div key={idx} className="font-semibold text-blue-900 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[11px] font-mono text-blue-900">
                            {it.demandedQty} {it.uom}
                          </span>
                          <span className="text-slate-700 text-xs font-medium">{it.productName}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="status" status={intOp.status} size="sm">
                        {intOp.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {intOp.status !== 'done' && intOp.status !== 'canceled' ? (
                        <button
                          onClick={() => onValidate(intOp.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                        >
                          Execute Transfer
                        </button>
                      ) : (
                        <span className="text-xs text-blue-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Relocated
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
