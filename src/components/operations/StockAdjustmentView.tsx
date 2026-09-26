import React, { useState } from 'react';
import { SlidersHorizontal, Plus, CheckCircle2, AlertTriangle, Calculator, History, ShieldAlert } from 'lucide-react';
import { Location, Operation, Product } from '../../types';
import { Badge } from '../ui/Badge';

interface StockAdjustmentViewProps {
  adjustments: Operation[];
  products: Product[];
  locations: Location[];
  getProductStock: (id: string, locId?: string) => number;
  onPerformAdjustment: (
    productId: string,
    locationId: string,
    physicalCount: number,
    reason: string
  ) => void;
  onSelectAdjustment: (op: Operation) => void;
}

export const StockAdjustmentView: React.FC<StockAdjustmentViewProps> = ({
  adjustments,
  products,
  locations,
  getProductStock,
  onPerformAdjustment,
  onSelectAdjustment,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedLocationId, setSelectedLocationId] = useState(
    locations.find((l) => l.type === 'internal')?.id || locations[0]?.id || ''
  );
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState('Periodic physical inventory count reconciliation');
  const [showForm, setShowForm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const internalLocations = locations.filter((l) => l.type === 'internal' || l.type === 'production');

  const systemStock = selectedProduct ? getProductStock(selectedProduct.id, selectedLocationId) : 0;
  const difference = physicalCount - systemStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLocationId) return;

    onPerformAdjustment(selectedProductId, selectedLocationId, Number(physicalCount), reason);
    setShowSuccessToast(true);
    setShowForm(false);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleOpenModalWithProduct = (prodId: string, locId?: string) => {
    setSelectedProductId(prodId);
    if (locId) setSelectedLocationId(locId);
    const curr = getProductStock(prodId, locId || selectedLocationId);
    setPhysicalCount(curr);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Stock Adjustments (Audit Reconciliation)</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300">
              Physical Count vs Recorded Stock
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Fix mismatches between physical rack counts and computer records. When damages, scraps, or count variances occur, enter the counted quantity—StockSense calculates the difference and auto-adjusts stock with audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            const curr = selectedProduct ? getProductStock(selectedProduct.id, selectedLocationId) : 0;
            setPhysicalCount(curr);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Perform Stock Count
        </button>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Physical count reconciled successfully! Inventory quantity and Stock Ledger have been updated.
        </div>
      )}

      {/* Stock Count Form Card */}
      {showForm && (
        <form onSubmit={handleSubmit} className="odoo-card p-6 bg-white space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              Reconcile Physical Inventory Count
            </h3>
            <span className="text-xs text-slate-400">Step: Select Product → Location → Enter Count</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const curr = getProductStock(e.target.value, selectedLocationId);
                  setPhysicalCount(curr);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Audited Location / Rack *
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  setSelectedLocationId(e.target.value);
                  const curr = getProductStock(selectedProductId, e.target.value);
                  setPhysicalCount(curr);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none font-medium"
              >
                {internalLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variance Calculation Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">1. Recorded Stock</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {systemStock} <span className="text-xs font-normal text-slate-500">{selectedProduct?.uom}</span>
              </div>
              <span className="text-[10px] text-slate-400">Current system balance</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">2. Physical Counted</span>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-lg font-bold text-amber-900 bg-amber-50/60 border border-amber-300 rounded-lg outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">Enter actual warehouse tally</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">3. Discrepancy (Delta)</span>
              <div
                className={`text-xl font-bold mt-1 ${
                  difference === 0
                    ? 'text-emerald-600'
                    : difference > 0
                    ? 'text-blue-600'
                    : 'text-rose-600'
                }`}
              >
                {difference > 0 ? `+${difference}` : difference} {selectedProduct?.uom}
              </div>
              <span className="text-[10px] text-slate-400">
                {difference === 0
                  ? 'Counts match perfectly'
                  : difference < 0
                  ? 'Shortage / Damaged goods'
                  : 'Surplus found'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Audit Notes & Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 3 kg steel damaged in transit, or physical inventory recount..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-sm transition-all"
            >
              Apply Adjustment & Update Ledger
            </button>
          </div>
        </form>
      )}

      {/* Adjustments Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Reconciliation & Audit History ({adjustments.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Logged to Virtual Scrap/Surplus</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Audit Ref</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product Reconciled</th>
                <th className="py-3 px-4">Adjustment Delta</th>
                <th className="py-3 px-4">Audit Reason</th>
                <th className="py-3 px-4 text-right">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No physical adjustments recorded. Click &quot;+ Perform Stock Count&quot; to run an audit.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    onClick={() => onSelectAdjustment(adj)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {adj.refNo}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {adj.sourceLocationName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {adj.scheduledDate}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {adj.items[0]?.productName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                        {adj.items[0]?.demandedQty} {adj.items[0]?.uom}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {adj.notes || 'Routine physical count adjustment'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {adj.performedBy}
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
