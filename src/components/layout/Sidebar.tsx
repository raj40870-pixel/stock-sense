import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  UserCheck,
  LogOut,
  FolderTree,
  BellRing,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'receipts'
  | 'deliveries'
  | 'internal'
  | 'adjustments'
  | 'ledger'
  | 'settings'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  lowStockCount: number;
  onOpenProfile?: () => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  lowStockCount,
  onOpenProfile,
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#9c698f] flex items-center justify-center text-white shadow-lg shadow-purple-950/40 font-bold">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-lg">StockSense</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                IMS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Odoo-Style Modular</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 touch-scroll">
        {/* Main Dashboard */}
        <div>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#714B67] text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard View</span>
          </button>
        </div>

        {/* 1. Products Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Products</span>
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <BellRing className="w-2.5 h-2.5" />
                {lowStockCount} alert
              </span>
            )}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('products')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Product Master & Stock</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('categories')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-slate-400" />
                <span>Product Categories</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Operations Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Operations</span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('receipts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'receipts'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border-l-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Receipts (Incoming Stock)</span>
            </button>

            <button
              onClick={() => handleNavClick('deliveries')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'deliveries'
                  ? 'bg-slate-800 text-purple-400 font-semibold border-l-2 border-purple-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              <span>Delivery Orders (Outgoing)</span>
            </button>

            <button
              onClick={() => handleNavClick('internal')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'internal'
                  ? 'bg-slate-800 text-blue-400 font-semibold border-l-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
              <span>Internal Transfers</span>
            </button>

            <button
              onClick={() => handleNavClick('adjustments')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'adjustments'
                  ? 'bg-slate-800 text-amber-400 font-semibold border-l-2 border-amber-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Stock Adjustments (Audit)</span>
            </button>
          </div>
        </div>

        {/* 3. Move History / Stock Ledger */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audit & Ledger</span>
          </div>
          <button
            onClick={() => handleNavClick('ledger')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'ledger'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Move History (Stock Ledger)</span>
          </button>
        </div>

        {/* 4. Settings */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Configuration</span>
          </div>
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <WarehouseIcon className="w-4 h-4 text-slate-400" />
            <span>Warehouses & Locations</span>
          </button>
        </div>
      </div>

      {/* Profile & Logout Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-9 h-9 rounded-full bg-purple-700/60 border border-purple-500 flex items-center justify-center font-bold text-white text-xs">
            {currentUser.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {currentUser.role === 'inventory_manager' ? (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ) : (
                <UserCheck className="w-3 h-3 text-blue-400" />
              )}
              <p className="text-[10px] text-slate-400 capitalize truncate">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-950/50 transition-colors border border-rose-900/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
