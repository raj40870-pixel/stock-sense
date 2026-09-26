import React, { useState, useEffect } from 'react';
import { inventoryStore } from './services/inventoryStore';
import {
  Category,
  Location,
  Operation,
  OperationType,
  Product,
  StockMove,
  UserProfile,
  Warehouse,
} from './types';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductList } from './components/products/ProductList';
import { ProductModal } from './components/products/ProductModal';
import { CategoryManager } from './components/products/CategoryManager';
import { ReceiptsView } from './components/operations/ReceiptsView';
import { DeliveryOrdersView } from './components/operations/DeliveryOrdersView';
import { InternalTransfersView } from './components/operations/InternalTransfersView';
import { StockAdjustmentView } from './components/operations/StockAdjustmentView';
import { OperationModal } from './components/operations/OperationModal';
import { MoveHistoryView } from './components/ledger/MoveHistoryView';
import { WarehouseSettings } from './components/settings/WarehouseSettings';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Core Data State from Store
  const [user, setUser] = useState<UserProfile | null>(inventoryStore.getUser());
  const [products, setProducts] = useState<Product[]>(inventoryStore.getProducts());
  const [categories, setCategories] = useState<Category[]>(inventoryStore.getCategories());
  const [warehouses, setWarehouses] = useState<Warehouse[]>(inventoryStore.getWarehouses());
  const [locations, setLocations] = useState<Location[]>(inventoryStore.getLocations());
  const [operations, setOperations] = useState<Operation[]>(inventoryStore.getOperations());
  const [ledger, setLedger] = useState<StockMove[]>(inventoryStore.getStockLedger());
  const [kpis, setKpis] = useState(inventoryStore.getKPIs());

  // Filter State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [activeOpType, setActiveOpType] = useState<OperationType>('receipt');
  const [selectedOpToView, setSelectedOpToView] = useState<Operation | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Subscribe to store updates
  useEffect(() => {
    const syncState = () => {
      setUser(inventoryStore.getUser());
      setProducts(inventoryStore.getProducts());
      setCategories(inventoryStore.getCategories());
      setWarehouses(inventoryStore.getWarehouses());
      setLocations(inventoryStore.getLocations());
      setOperations(inventoryStore.getOperations());
      setLedger(inventoryStore.getStockLedger());
      setKpis(inventoryStore.getKPIs());
    };

    const unsubscribe = inventoryStore.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  // Filter products that are low or out of stock
  const lowStockProducts = products.filter((p) => {
    const stock = inventoryStore.getProductStock(p.id);
    return stock <= p.minStock;
  });

  // Action Handlers
  const handleValidateOperation = (opId: string) => {
    const res = inventoryStore.validateOperation(opId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleOpenNewOp = (type: OperationType) => {
    setActiveOpType(type);
    setSelectedOpToView(null);
    setIsOpModalOpen(true);
  };

  const handleSelectOperation = (op: Operation) => {
    setSelectedOpToView(op);
    setActiveOpType(op.type);
    setIsOpModalOpen(true);
  };

  const handleCreateOperation = (data: any) => {
    const newOp = inventoryStore.createOperation(data);
    showToast(`Created document ${newOp.refNo} successfully!`, 'success');
  };

  const handleSaveProduct = (
    product: Omit<Product, 'id' | 'createdAt'>,
    initialStock?: { locationId: string; quantity: number },
    id?: string
  ) => {
    if (id) {
      inventoryStore.updateProduct(id, product);
      showToast(`Product ${product.name} updated.`, 'success');
    } else {
      const newProd = inventoryStore.addProduct(product, initialStock);
      showToast(`Product ${newProd.name} created (${newProd.sku}).`, 'success');
    }
  };

  const handleDeleteProduct = (id: string) => {
    inventoryStore.deleteProduct(id);
    showToast('Product removed from catalog.', 'success');
  };

  const handleStockCountAdjustment = (
    productId: string,
    locationId: string,
    physicalCount: number,
    reason: string
  ) => {
    const res = inventoryStore.performStockCountAdjustment(productId, locationId, physicalCount, reason);
    const sign = res.difference >= 0 ? '+' : '';
    showToast(
      `Adjusted ${res.op.items[0]?.productName}: difference ${sign}${res.difference} logged in ledger!`,
      'success'
    );
  };

  if (!user) {
    return (
      <AuthPage
        onLoginSuccess={(loggedInUser) => {
          inventoryStore.login(loggedInUser);
          showToast(`Welcome, ${loggedInUser.name}!`);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={user}
        lowStockCount={lowStockProducts.length}
        onOpenProfile={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          inventoryStore.logout();
          showToast('Logged out of StockSense.');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          currentUser={user}
          onRoleChange={(role) => inventoryStore.setUserRole(role)}
          onOpenAccountSwitcher={() => setIsAuthModalOpen(true)}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          lowStockProducts={lowStockProducts}
          onSelectProduct={(p) => {
            setActiveTab('products');
            setSearchQuery(p.sku);
          }}
          onQuickAction={handleOpenNewOp}
        />

        {/* Dynamic View Panels */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Role Mode Banner for Staff vs Manager vs User */}
          {user.role === 'warehouse_staff' ? (
            <div className="bg-blue-600/10 border-b border-blue-500/20 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white text-[10px] uppercase tracking-wider">
                  📦 Warehouse Staff Mode
                </span>
                <span className="font-medium">
                  Floor Operational Access: Receipts, Picking, Packing, Internal Transfers & Physical Count Audit enabled.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => inventoryStore.setUserRole('inventory_manager')}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  Switch to Manager →
                </button>
                <button
                  onClick={() => inventoryStore.setUserRole('general_user')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  Switch to User →
                </button>
              </div>
            </div>
          ) : user.role === 'general_user' ? (
            <div className="bg-emerald-600/10 border-b border-emerald-500/20 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white text-[10px] uppercase tracking-wider">
                  👤 General User Mode
                </span>
                <span className="font-medium text-slate-700">
                  Viewer Access: Live Catalog Browsing, Stock Quant Visibility & Operational Status Tracking.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => inventoryStore.setUserRole('inventory_manager')}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                >
                  Switch to Manager →
                </button>
                <button
                  onClick={() => inventoryStore.setUserRole('warehouse_staff')}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  Switch to Staff →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-purple-900/10 border-b border-purple-500/20 px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-950">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-[#714B67] text-white text-[10px] uppercase tracking-wider">
                  👔 Inventory Manager Mode
                </span>
                <span className="font-medium text-slate-700">
                  Full Administrative Rights: Reordering Rules, Master Catalog, Multi-Warehouse Settings & Approvals.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => inventoryStore.setUserRole('warehouse_staff')}
                  className="text-[11px] font-bold text-[#714B67] hover:underline"
                >
                  Test as Staff →
                </button>
                <button
                  onClick={() => inventoryStore.setUserRole('general_user')}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Test as User →
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              operations={operations}
              products={products}
              categories={categories}
              warehouses={warehouses}
              locations={locations}
              onValidateOperation={handleValidateOperation}
              onOpenNewOp={handleOpenNewOp}
              onOpenNewProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onSelectOperation={handleSelectOperation}
              getProductStock={(pId) => inventoryStore.getProductStock(pId)}
            />
          )}

          {activeTab === 'products' && (
            <ProductList
              products={products}
              categories={categories}
              locations={locations}
              currentUser={user}
              onOpenCreateModal={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
              getProductBreakdown={(pId) => inventoryStore.getProductLocationBreakdown(pId)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              products={products}
              onAddCategory={(cat) => {
                inventoryStore.addCategory(cat);
                showToast(`Category ${cat.name} added.`, 'success');
              }}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView
              receipts={operations.filter((o) => o.type === 'receipt')}
              products={products}
              locations={locations}
              onOpenCreate={() => handleOpenNewOp('receipt')}
              onValidate={handleValidateOperation}
              onSelectReceipt={handleSelectOperation}
              getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
            />
          )}

          {activeTab === 'deliveries' && (
            <DeliveryOrdersView
              deliveries={operations.filter((o) => o.type === 'delivery')}
              products={products}
              locations={locations}
              onOpenCreate={() => handleOpenNewOp('delivery')}
              onValidate={handleValidateOperation}
              onUpdateStatus={(id, status) => inventoryStore.updateOperationStatus(id, status)}
              onSelectDelivery={handleSelectOperation}
              getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
            />
          )}

          {activeTab === 'internal' && (
            <InternalTransfersView
              transfers={operations.filter((o) => o.type === 'internal')}
              products={products}
              locations={locations}
              onOpenCreate={() => handleOpenNewOp('internal')}
              onValidate={handleValidateOperation}
              onSelectTransfer={handleSelectOperation}
              getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
            />
          )}

          {activeTab === 'adjustments' && (
            <StockAdjustmentView
              adjustments={operations.filter((o) => o.type === 'adjustment')}
              products={products}
              locations={locations}
              getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
              onPerformAdjustment={handleStockCountAdjustment}
              onSelectAdjustment={handleSelectOperation}
            />
          )}

          {activeTab === 'ledger' && <MoveHistoryView moves={ledger} />}

          {activeTab === 'settings' && (
            <WarehouseSettings
              warehouses={warehouses}
              locations={locations}
              onAddWarehouse={(wh) => {
                inventoryStore.addWarehouse(wh);
                showToast(`Warehouse ${wh.name} registered.`, 'success');
              }}
              onAddLocation={(loc) => {
                inventoryStore.addLocation(loc);
                showToast(`Location ${loc.name} added.`, 'success');
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        locations={locations}
      />

      <OperationModal
        isOpen={isOpModalOpen}
        onClose={() => {
          setIsOpModalOpen(false);
          setSelectedOpToView(null);
        }}
        operationType={activeOpType}
        onCreate={handleCreateOperation}
        products={products}
        locations={locations}
        selectedOpToView={selectedOpToView}
        onValidate={handleValidateOperation}
        getProductStock={(pId, locId) => inventoryStore.getProductStock(pId, locId)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onUpdateUser={(updated) => {
          inventoryStore.updateUser(updated);
          showToast('User profile updated successfully.', 'success');
        }}
        onLogout={() => {
          inventoryStore.logout();
          setIsAuthModalOpen(false);
          showToast('Logged out of StockSense.');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-700'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
