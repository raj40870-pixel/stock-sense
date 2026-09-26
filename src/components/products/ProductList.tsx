import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Layers,
  MapPin,
} from 'lucide-react';
import { Category, Location, Product, UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { inventoryStore } from '../../services/inventoryStore';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  locations: Location[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  getProductStock: (productId: string, locationId?: string) => number;
  getProductBreakdown: (productId: string) => { location: Location; quantity: number }[];
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  locations,
  currentUser,
  onOpenCreateModal,
  onEditProduct,
  onDeleteProduct,
  getProductStock,
  getProductBreakdown,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    const currentStock = getProductStock(p.id);
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = currentStock > 0 && currentStock <= p.minStock;
    } else if (stockFilter === 'out') {
      matchesStock = currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Product Master Catalog</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#714B67]">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage product items, SKU codes, units of measure, reordering rules, and multi-location availability.
          </p>
        </div>

        {currentUser.role === 'inventory_manager' && (
          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Product</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#714B67]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock (≤ Min)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="odoo-card bg-white overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Reordering Rules</th>
                <th className="py-3 px-4">Stock Health</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const stock = getProductStock(prod.id);
                  const isExpanded = expandedProductId === prod.id;
                  const breakdown = isExpanded ? getProductBreakdown(prod.id) : [];

                  let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
                  if (stock === 0) stockStatus = 'out_of_stock';
                  else if (stock <= prod.minStock) stockStatus = 'low_stock';

                  return (
                    <React.Fragment key={prod.id}>
                      <tr
                        onClick={() => toggleExpand(prod.id)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-purple-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#714B67]" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {prod.sku}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {prod.description || 'Standard catalog item'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {prod.categoryName || 'Raw Material'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {stock} <span className="text-xs font-normal text-slate-500">{prod.uom}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Min: {prod.minStock}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                              Max: {prod.maxStock}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="stock" stockStatus={stockStatus} size="sm">
                            Status
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditProduct(prod)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {currentUser.role === 'inventory_manager' && (
                              <button
                                onClick={() => onDeleteProduct(prod.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Stock availability per location (Problem statement requirement) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={8} className="p-4 pl-12 border-t border-slate-100">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                                <MapPin className="w-3.5 h-3.5 text-[#714B67]" />
                                Stock Availability per Location / Rack:
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {breakdown.map((item) => (
                                  <div
                                    key={item.location.id}
                                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                                  >
                                    <div>
                                      <p className="text-[11px] font-semibold text-slate-800">
                                        {item.location.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        {item.location.code}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`text-xs font-bold ${
                                          item.quantity > 0 ? 'text-emerald-700' : 'text-slate-400'
                                        }`}
                                      >
                                        {item.quantity} {prod.uom}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
