import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Location, Operation, OperationType, Product } from '../../types';

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationType: OperationType;
  onCreate: (data: {
    type: OperationType;
    partnerName?: string;
    sourceLocationId: string;
    destLocationId: string;
    scheduledDate: string;
    notes?: string;
    items: { productId: string; demandedQty: number }[];
  }) => void;
  products: Product[];
  locations: Location[];
  selectedOpToView?: Operation | null;
  onValidate?: (id: string) => void;
  getProductStock?: (prodId: string, locId?: string) => number;
}

export const OperationModal: React.FC<OperationModalProps> = ({
  isOpen,
  onClose,
  operationType,
  onCreate,
  products,
  locations,
  selectedOpToView,
  onValidate,
  getProductStock,
}) => {
  const isViewMode = !!selectedOpToView;
  const currentType = selectedOpToView ? selectedOpToView.type : operationType;

  // Form State
  const [partnerName, setPartnerName] = useState('');
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destLocationId, setDestLocationId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: string; demandedQty: number }[]>([
    { productId: products[0]?.id || '', demandedQty: 10 },
  ]);

  const internalLocations = locations.filter((l) => l.type === 'internal' || l.type === 'production');
  const vendorLocations = locations.filter((l) => l.type === 'vendor');
  const customerLocations = locations.filter((l) => l.type === 'customer');
  const scrapLocations = locations.filter((l) => l.type === 'inventory_loss');

  useEffect(() => {
    if (selectedOpToView) {
      setPartnerName(selectedOpToView.partnerName || '');
      setSourceLocationId(selectedOpToView.sourceLocationId);
      setDestLocationId(selectedOpToView.destLocationId);
      setScheduledDate(selectedOpToView.scheduledDate);
      setNotes(selectedOpToView.notes || '');
      setItems(
        selectedOpToView.items.map((it) => ({
          productId: it.productId,
          demandedQty: it.demandedQty,
        }))
      );
    } else {
      setNotes('');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setItems([{ productId: products[0]?.id || '', demandedQty: 10 }]);

      if (currentType === 'receipt') {
        setPartnerName('Tata Steel / Global Vendors');
        setSourceLocationId(vendorLocations[0]?.id || locations[0]?.id || '');
        setDestLocationId(internalLocations[0]?.id || locations[0]?.id || '');
      } else if (currentType === 'delivery') {
        setPartnerName('Apex Technologies');
        setSourceLocationId(internalLocations[0]?.id || locations[0]?.id || '');
        setDestLocationId(customerLocations[0]?.id || locations[0]?.id || '');
      } else if (currentType === 'internal') {
        setPartnerName('Internal Logistics');
        setSourceLocationId(internalLocations[0]?.id || locations[0]?.id || '');
        setDestLocationId(internalLocations[1]?.id || internalLocations[0]?.id || locations[0]?.id || '');
      } else {
        setPartnerName('Count Audit');
        setSourceLocationId(internalLocations[0]?.id || locations[0]?.id || '');
        setDestLocationId(scrapLocations[0]?.id || locations[0]?.id || '');
      }
    }
  }, [selectedOpToView, currentType, isOpen, products, locations]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', demandedQty: 5 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'demandedQty', val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceLocationId || !destLocationId || items.length === 0) return;

    onCreate({
      type: currentType,
      partnerName,
      sourceLocationId,
      destLocationId,
      scheduledDate,
      notes,
      items: items.map((it) => ({
        productId: it.productId,
        demandedQty: Number(it.demandedQty),
      })),
    });
    onClose();
  };

  const titleMap = {
    receipt: 'New Receipt (Incoming Goods from Vendor)',
    delivery: 'New Delivery Order (Customer Outgoing)',
    internal: 'New Internal Warehouse Transfer',
    adjustment: 'New Stock Count Adjustment',
  };

  const iconMap = {
    receipt: <ArrowDownLeft className="w-5 h-5 text-emerald-400" />,
    delivery: <ArrowUpRight className="w-5 h-5 text-purple-400" />,
    internal: <ArrowLeftRight className="w-5 h-5 text-blue-400" />,
    adjustment: <SlidersHorizontal className="w-5 h-5 text-amber-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {iconMap[currentType]}
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {isViewMode ? `${selectedOpToView?.refNo} Details` : titleMap[currentType]}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isViewMode
                  ? `Status: ${selectedOpToView?.status.toUpperCase()}`
                  : 'Document draft preparation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Top Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {currentType === 'receipt'
                  ? 'Vendor / Supplier Name *'
                  : currentType === 'delivery'
                  ? 'Customer Name *'
                  : 'Operation Reference Note'}
              </label>
              <input
                type="text"
                disabled={isViewMode}
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder={currentType === 'receipt' ? 'e.g. Tata Steel' : 'e.g. Acme Corp'}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none disabled:bg-slate-100 disabled:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                disabled={isViewMode}
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#714B67] outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Source Location
              </label>
              <select
                disabled={isViewMode}
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none disabled:bg-slate-100"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Destination Location
              </label>
              <select
                disabled={isViewMode}
                value={destLocationId}
                onChange={(e) => setDestLocationId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none disabled:bg-slate-100"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Product Lines
              </span>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-[#714B67] font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product Line
                </button>
              )}
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const currentLocStock =
                  getProductStock && sourceLocationId
                    ? getProductStock(item.productId, sourceLocationId)
                    : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex-1">
                      <select
                        disabled={isViewMode}
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none disabled:bg-slate-100 font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32 flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        disabled={isViewMode}
                        value={item.demandedQty}
                        onChange={(e) => handleItemChange(idx, 'demandedQty', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none text-right font-bold disabled:bg-slate-100"
                      />
                      <span className="text-xs text-slate-500 font-medium shrink-0">
                        {prod?.uom || 'Units'}
                      </span>
                    </div>

                    {!isViewMode && items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internal Notes / Tracking Instructions
            </label>
            <input
              type="text"
              disabled={isViewMode}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handled by Freight Forwarder, Fragile items, etc."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none disabled:bg-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              {isViewMode && selectedOpToView?.status !== 'done' && onValidate && (
                <button
                  type="button"
                  onClick={() => {
                    onValidate(selectedOpToView.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Validate Document Now
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-xl shadow-sm"
                >
                  Create Document
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
