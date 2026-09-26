import React, { useState } from 'react';
import {
  Search,
  Bell,
  CloudCheck,
  ShieldAlert,
  Layers,
  ChevronDown,
  Warehouse as WarehouseIcon,
  Plus,
} from 'lucide-react';
import { Product, UserProfile, Warehouse } from '../../types';

interface TopbarProps {
  currentUser: UserProfile;
  onRoleChange: (role: 'inventory_manager' | 'warehouse_staff') => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lowStockProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onQuickAction: (action: 'receipt' | 'delivery' | 'internal' | 'adjustment') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onRoleChange,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  searchQuery,
  onSearchChange,
  lowStockProducts,
  onSelectProduct,
  onQuickAction,
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU (e.g. STL-101), Products, Reference (REC-2026)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs border border-transparent focus:border-[#714B67] rounded-xl outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* InsForge Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>InsForge BaaS Active</span>
        </div>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
          <WarehouseIcon className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="bg-transparent outline-none cursor-pointer pr-1"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Alerts Notification */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Stock Alerts"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Inventory Alerts ({lowStockProducts.length})
                </span>
                <span className="text-[11px] text-slate-500">Auto Reorder</span>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">All stock levels are healthy! 🎉</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p);
                        setShowAlertsDropdown(false);
                      }}
                      className="p-2 rounded-lg bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          {p.sku}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        Minimum threshold: <span className="font-semibold">{p.minStock} {p.uom}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentUser.role === 'inventory_manager' ? 'bg-[#714B67]' : 'bg-blue-600'
              }`}
            />
            <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Switch Perspective
              </div>
              <button
                onClick={() => {
                  onRoleChange('inventory_manager');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentUser.role === 'inventory_manager'
                    ? 'bg-purple-50 text-[#714B67] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                👔 Inventory Manager
                <span className="block text-[10px] text-slate-400 font-normal">Full control & Reorder rules</span>
              </button>
              <button
                onClick={() => {
                  onRoleChange('warehouse_staff');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentUser.role === 'warehouse_staff'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                📦 Warehouse Staff
                <span className="block text-[10px] text-slate-400 font-normal">Transfers, Picking & Counting</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
