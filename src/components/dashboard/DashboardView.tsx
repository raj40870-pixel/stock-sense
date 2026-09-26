import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  Category,
  DashboardKPIs,
  Location,
  Operation,
  OperationStatus,
  OperationType,
  Product,
  Warehouse,
} from '../../types';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';

interface DashboardViewProps {
  kpis: DashboardKPIs;
  operations: Operation[];
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  locations: Location[];
  onValidateOperation: (opId: string) => void;
  onOpenNewOp: (type: OperationType) => void;
  onOpenNewProduct: () => void;
  onSelectOperation: (op: Operation) => void;
  getProductStock: (productId: string) => number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  operations,
  products,
  categories,
  warehouses,
  locations,
  onValidateOperation,
  onOpenNewOp,
  onOpenNewProduct,
  onSelectOperation,
  getProductStock,
}) => {
  // Dynamic Filters as requested in Problem Statement:
  // 1. By document type: Receipts / Delivery / Internal / Adjustments
  // 2. By status: Draft, Waiting, Ready, Done, Canceled
  // 3. By warehouse or location
  // 4. By product category
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filtered Operations
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      if (filterType !== 'all' && op.type !== filterType) return false;
      if (filterStatus !== 'all' && op.status !== filterStatus) return false;
      if (filterLocation !== 'all') {
        if (op.sourceLocationId !== filterLocation && op.destLocationId !== filterLocation) {
          return false;
        }
      }
      if (filterCategory !== 'all') {
        const hasMatchingCat = op.items.some((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return prod?.categoryId === filterCategory;
        });
        if (!hasMatchingCat) return false;
      }
      return true;
    });
  }, [operations, filterType, filterStatus, filterLocation, filterCategory, products]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterLocation('all');
    setFilterCategory('all');
  };

  const hasActiveFilters =
    filterType !== 'all' || filterStatus !== 'all' || filterLocation !== 'all' || filterCategory !== 'all';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#714B67] text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">StockSense Operations Hub</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur">
              Real-Time
            </span>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Centralized inventory dashboard tracking incoming goods, outgoing dispatches, internal movements & audit logs.
          </p>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenNewOp('receipt')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            + New Receipt
          </button>

          <button
            onClick={() => onOpenNewOp('delivery')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            + New Delivery
          </button>

          <button
            onClick={() => onOpenNewOp('internal')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer
          </button>

          <button
            onClick={() => onOpenNewOp('adjustment')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Count Audit
          </button>
        </div>
      </div>

      {/* 5 KPIs as specified in Problem Statement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Products in Stock */}
        <StatCard
          title="Products in Stock"
          value={kpis.totalProducts}
          subtitle={`(${kpis.totalStockUnits} total units)`}
          icon={<Package className="w-5 h-5 text-indigo-600" />}
          accentColor="blue"
          trend={`${products.length} registered SKUs`}
        />

        {/* 2. Low Stock / Out of Stock Items */}
        <StatCard
          title="Low & Out of Stock"
          value={kpis.lowStockItemsCount + kpis.outOfStockItemsCount}
          subtitle={`${kpis.outOfStockItemsCount} critical 0-stock`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          accentColor="amber"
          alert={kpis.lowStockItemsCount > 0 || kpis.outOfStockItemsCount > 0}
          alertText="Reorder alert"
        />

        {/* 3. Pending Receipts */}
        <StatCard
          title="Pending Receipts"
          value={kpis.pendingReceiptsCount}
          subtitle="Incoming from vendors"
          icon={<ArrowDownLeft className="w-5 h-5 text-emerald-600" />}
          accentColor="emerald"
          trend="Awaiting arrival"
        />

        {/* 4. Pending Deliveries */}
        <StatCard
          title="Pending Deliveries"
          value={kpis.pendingDeliveriesCount}
          subtitle="Sales dispatches"
          icon={<ArrowUpRight className="w-5 h-5 text-[#714B67]" />}
          accentColor="purple"
          trend="To pack & ship"
        />

        {/* 5. Internal Transfers Scheduled */}
        <StatCard
          title="Scheduled Transfers"
          value={kpis.internalTransfersScheduledCount}
          subtitle="Rack & floor movements"
          icon={<ArrowLeftRight className="w-5 h-5 text-blue-600" />}
          accentColor="blue"
          trend="Inter-warehouse"
        />
      </div>

      {/* Visual Inventory Flow Diagram (Odoo Style) */}
      <div className="odoo-card p-4 bg-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Real-time Inventory Lifecycle Flow
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Stock Movement Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>1. Incoming Receipts</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-mono">
                + Stock
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Vendor supplies delivered to Main Warehouse.</p>
            <div className="mt-2 text-xs font-bold text-emerald-800">
              {operations.filter((o) => o.type === 'receipt' && o.status === 'done').length} Processed
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>2. Internal Transfers</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-800 text-[10px] font-mono">
                ± Rebalance
              </span>
            </div>
            <p className="text-[11px] text-blue-700 mt-1">Movement between Racks & Production Floor.</p>
            <div className="mt-2 text-xs font-bold text-blue-800">
              {operations.filter((o) => o.type === 'internal' && o.status === 'done').length} Completed
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
              <span>3. Outgoing Delivery</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 text-[10px] font-mono">
                - Stock
              </span>
            </div>
            <p className="text-[11px] text-purple-700 mt-1">Pick, pack & shipment fulfillment to customers.</p>
            <div className="mt-2 text-xs font-bold text-purple-800">
              {operations.filter((o) => o.type === 'delivery' && o.status === 'done').length} Shipped
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>4. Stock Adjustments</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-mono">
                Audit Sync
              </span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Fix physical count vs system recorded count.</p>
            <div className="mt-2 text-xs font-bold text-amber-800">
              {operations.filter((o) => o.type === 'adjustment' && o.status === 'done').length} Reconciled
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Section (From Problem Statement) */}
      <div className="odoo-card p-4 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#714B67]" />
            <h2 className="text-sm font-bold text-slate-900">Dynamic Operations Filter</h2>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-[#714B67]">
                Filtered ({filteredOperations.length} items)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 self-start md:self-auto"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. By Document Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-[#714B67]"
            >
              <option value="all">All Documents</option>
              <option value="receipt">Receipts (Incoming)</option>
              <option value="delivery">Deliveries (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>

          {/* 2. By Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-[#714B67]"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {/* 3. By Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Warehouse / Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-[#714B67]"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. By Product Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Product Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-[#714B67]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="odoo-card overflow-hidden bg-white">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Operations Stream</h3>
            <p className="text-xs text-slate-500">Showing {filteredOperations.length} active documents</p>
          </div>

          <span className="text-xs font-mono text-slate-400">Total: {operations.length} documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Partner / Destination</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No operations match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOperations.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => onSelectOperation(op)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {op.refNo}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="type" type={op.type} size="sm">
                        {op.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{op.partnerName}</div>
                      <div className="text-[10px] text-slate-400">
                        {op.sourceLocationName} → {op.destLocationName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {op.scheduledDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        {op.items.map((it, idx) => (
                          <span key={idx} className="font-medium text-slate-700">
                            {it.demandedQty} {it.uom} • {it.productName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="status" status={op.status} size="sm">
                        {op.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {op.status !== 'done' && op.status !== 'canceled' ? (
                        <button
                          onClick={() => onValidateOperation(op.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition-all"
                        >
                          Validate
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validated
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
