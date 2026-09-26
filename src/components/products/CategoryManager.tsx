import React, { useState } from 'react';
import { FolderTree, Plus, Tag, Package } from 'lucide-react';
import { Category, Product } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  products,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory({ name, description });
    setName('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Product Categories</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#714B67]">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into hierarchical groups for inventory filtering and valuation.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-semibold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + New Category
        </button>
      </div>

      {/* Add Category Card */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="odoo-card p-5 bg-white space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#714B67]" /> Create New Product Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electrical Components"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of items in this category"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-lg shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          return (
            <div key={cat.id} className="odoo-card p-5 bg-white hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 text-[#714B67] border border-purple-100">
                  <FolderTree className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  {catProducts.length} Products
                </span>
                <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                  CAT-{cat.id.slice(-3).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
