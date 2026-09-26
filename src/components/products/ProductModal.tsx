import React, { useState, useEffect } from 'react';
import { X, Package, Layers, Scale, Bookmark, Hash } from 'lucide-react';
import { Category, Location, Product } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    product: Omit<Product, 'id' | 'createdAt'>,
    initialStock?: { locationId: string; quantity: number },
    id?: string
  ) => void;
  productToEdit?: Product | null;
  categories: Category[];
  locations: Location[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  locations,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uom, setUom] = useState('Units');
  const [minStock, setMinStock] = useState(10);
  const [maxStock, setMaxStock] = useState(100);
  const [costPrice, setCostPrice] = useState(100);
  const [description, setDescription] = useState('');

  // Initial stock setup (optional for new products)
  const [hasInitialStock, setHasInitialStock] = useState(false);
  const [initialQty, setInitialQty] = useState(50);
  const [initialLocationId, setInitialLocationId] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategoryId(productToEdit.categoryId);
      setUom(productToEdit.uom);
      setMinStock(productToEdit.minStock);
      setMaxStock(productToEdit.maxStock);
      setCostPrice(productToEdit.costPrice || 0);
      setDescription(productToEdit.description || '');
      setHasInitialStock(false);
    } else {
      setName('');
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setCategoryId(categories[0]?.id || '');
      setUom('Units');
      setMinStock(10);
      setMaxStock(100);
      setCostPrice(50);
      setDescription('');
      setHasInitialStock(false);
      setInitialLocationId(locations.find((l) => l.type === 'internal')?.id || locations[0]?.id || '');
    }
  }, [productToEdit, isOpen, categories, locations]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const selectedCat = categories.find((c) => c.id === categoryId);

    const productPayload = {
      name,
      sku: sku.toUpperCase(),
      categoryId,
      categoryName: selectedCat?.name || 'General',
      uom,
      minStock: Number(minStock),
      maxStock: Number(maxStock),
      costPrice: Number(costPrice),
      description,
    };

    const initialStockPayload =
      hasInitialStock && !productToEdit
        ? { locationId: initialLocationId, quantity: Number(initialQty) }
        : undefined;

    onSave(productPayload, initialStockPayload, productToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/40 text-purple-200">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {productToEdit ? 'Edit Product Master' : 'Create Product Master'}
              </h3>
              <p className="text-[11px] text-slate-400">Inventory SKU configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Steel Rods (10mm)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
            />
          </div>

          {/* SKU and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                SKU / Code *
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="STL-101"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* UOM and Cost Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure (UoM) *
              </label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
              >
                <option value="Kg">Kg (Kilograms)</option>
                <option value="Units">Units (Pieces)</option>
                <option value="Pcs">Pcs (Parts)</option>
                <option value="Boxes">Boxes (Cartons)</option>
                <option value="Meters">Meters (Length)</option>
                <option value="Liters">Liters (Liquid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Standard Unit Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
              />
            </div>
          </div>

          {/* Reordering Rules (Min / Max) */}
          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
            <span className="text-xs font-bold text-[#714B67] flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" /> Reordering Rules
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min Stock (Alert Trigger)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Max Stock Level
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Initial Stock (Optional for New Product) */}
          {!productToEdit && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInitialStock}
                  onChange={(e) => setHasInitialStock(e.target.checked)}
                  className="rounded text-[#714B67] focus:ring-[#714B67]"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Provide Initial Stock On Hand (Opening Balance)
                </span>
              </label>

              {hasInitialStock && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Initial Quantity ({uom})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={initialQty}
                      onChange={(e) => setInitialQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Target Rack / Location
                    </label>
                    <select
                      value={initialLocationId}
                      onChange={(e) => setInitialLocationId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      {locations
                        .filter((l) => l.type === 'internal' || l.type === 'production')
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dimensions, specifications, supplier notes..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-xl shadow-sm transition-all"
            >
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
