import React, { useState } from 'react';
import { Warehouse as WarehouseIcon, MapPin, Plus, Building, Layers, CheckCircle2 } from 'lucide-react';
import { Location, Warehouse } from '../../types';

interface WarehouseSettingsProps {
  warehouses: Warehouse[];
  locations: Location[];
  onAddWarehouse: (wh: Omit<Warehouse, 'id'>) => void;
  onAddLocation: (loc: Omit<Location, 'id'>) => void;
}

export const WarehouseSettings: React.FC<WarehouseSettingsProps> = ({
  warehouses,
  locations,
  onAddWarehouse,
  onAddLocation,
}) => {
  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [showAddLocModal, setShowAddLocModal] = useState(false);

  // New WH state
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // New Loc state
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locWhId, setLocWhId] = useState(warehouses[0]?.id || '');
  const [locType, setLocType] = useState<'internal' | 'production'>('internal');

  const handleCreateWh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whCode) return;
    onAddWarehouse({ name: whName, code: whCode.toUpperCase(), address: whAddress });
    setWhName('');
    setWhCode('');
    setWhAddress('');
    setShowAddWhModal(false);
  };

  const handleCreateLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !locCode) return;
    onAddLocation({
      warehouseId: locWhId,
      name: locName,
      code: locCode.toUpperCase(),
      type: locType,
    });
    setLocName('');
    setLocCode('');
    setShowAddLocModal(false);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-[#714B67] border border-purple-100">
              <WarehouseIcon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Warehouses & Storage Locations</h1>
              <span className="text-xs text-slate-500">Multi-warehouse & rack infrastructure</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Configure physical premises, central stores, production staging floors, and individual shelving racks.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddWhModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Warehouse</span>
          </button>
          <button
            onClick={() => setShowAddLocModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Location</span>
          </button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="space-y-6">
        {warehouses.map((wh) => {
          const whLocations = locations.filter((l) => l.warehouseId === wh.id);

          return (
            <div key={wh.id} className="odoo-card p-6 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#714B67] font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {wh.code}
                      </span>
                      {wh.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Default Site
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{wh.address}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {whLocations.length} Associated Locations
                </span>
              </div>

              {/* Racks & Locations inside this Warehouse */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Internal Storage Racks & Sub-Locations:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {whLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-900">{loc.name}</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {loc.code}
                        </span>
                        <span className="text-[10px] capitalize text-slate-500 font-medium">
                          {loc.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Warehouse */}
      {showAddWhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto touch-scroll">
            <h3 className="text-sm font-bold text-slate-900">Add New Warehouse</h3>
            <form onSubmit={handleCreateWh} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. North Distribution Hub"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Code *</label>
                <input
                  type="text"
                  required
                  value={whCode}
                  onChange={(e) => setWhCode(e.target.value)}
                  placeholder="e.g. WH3"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  placeholder="e.g. Zone 4, Cargo Complex"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#714B67] text-white rounded-lg"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Location */}
      {showAddLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto touch-scroll">
            <h3 className="text-sm font-bold text-slate-900">Add New Storage Rack / Floor</h3>
            <form onSubmit={handleCreateLoc} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Warehouse *</label>
                <select
                  value={locWhId}
                  onChange={(e) => setLocWhId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Cold Storage Bay 2"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Code *</label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  placeholder="e.g. WH1/COLD-2"
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
