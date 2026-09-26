import React, { useState } from 'react';
import {
  Search,
  Bell,
  ShieldAlert,
  Warehouse as WarehouseIcon,
  LogOut,
  Menu,
} from 'lucide-react';
import { Product, UserProfile, Warehouse } from '../../types';

interface TopbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onWarehouseChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lowStockProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onQuickAction: (action: 'receipt' | 'delivery' | 'internal' | 'adjustment') => void;
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onLogout,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  searchQuery,
  onSearchChange,
  lowStockProducts,
  onSelectProduct,
  onQuickAction,
  onToggleMobileMenu,
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 gap-2 sm:gap-4">
      {/* Mobile Hamburger Menu Toggle + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU, Products, Documents..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs border border-transparent focus:border-[#714B67] rounded-xl outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* InsForge Status Badge (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>InsForge BaaS Active</span>
        </div>

        {/* Warehouse Selector (Tablet and Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700">
          <WarehouseIcon className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="bg-transparent outline-none cursor-pointer pr-1 max-w-[130px] truncate"
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
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
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
                <div className="space-y-1.5 max-h-60 overflow-y-auto touch-scroll">
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
                        <span className="text-xs font-bold text-slate-800 truncate mr-2">{p.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 shrink-0">
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

        {/* Read-Only Fixed Role Badge (Tablet and Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              currentUser.role === 'inventory_manager'
                ? 'bg-[#714B67]'
                : currentUser.role === 'warehouse_staff'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          />
          <span>
            {currentUser.role === 'inventory_manager' && '👔 Manager'}
            {currentUser.role === 'warehouse_staff' && '📦 Staff'}
            {currentUser.role === 'general_user' && '👤 User'}
          </span>
        </div>

        {/* User Profile Avatar with Direct Logout Popover */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pr-1.5 sm:pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 shrink-0"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#714B67] to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-700 max-w-[85px] truncate">
              {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-100 text-[#714B67] text-[10px] font-bold">
                    {currentUser.role === 'inventory_manager' && '👔 Manager'}
                    {currentUser.role === 'warehouse_staff' && '📦 Staff'}
                    {currentUser.role === 'general_user' && '👤 User'}
                  </span>
                </div>
              </div>

              {/* Warehouse selector on Mobile within Profile Dropdown */}
              <div className="sm:hidden py-3 border-b border-slate-100">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Warehouse Filter
                </label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => onWarehouseChange(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 outline-none"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all border border-rose-200/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out / Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
