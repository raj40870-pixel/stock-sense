export type UserRole = 'inventory_manager' | 'warehouse_staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  warehouseId?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  isDefault?: boolean;
}

export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: 'internal' | 'vendor' | 'customer' | 'inventory_loss' | 'production';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  uom: string; // e.g. "Kg", "Units", "Pcs", "Boxes", "Meters"
  minStock: number;
  maxStock: number;
  costPrice?: number;
  description?: string;
  createdAt: string;
}

export interface StockQuant {
  productId: string;
  locationId: string;
  quantity: number;
}

export type OperationType = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface OperationItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  demandedQty: number;
  doneQty: number;
}

export interface Operation {
  id: string;
  refNo: string;
  type: OperationType;
  status: OperationStatus;
  partnerName?: string; // Vendor name for receipts, Customer name for deliveries
  sourceLocationId: string;
  sourceLocationName?: string;
  destLocationId: string;
  destLocationName?: string;
  scheduledDate: string;
  notes?: string;
  items: OperationItem[];
  createdAt: string;
  validatedAt?: string;
  performedBy: string;
}

export interface StockMove {
  id: string;
  timestamp: string;
  reference: string;
  operationType: OperationType;
  productId: string;
  productName: string;
  sku: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  uom: string;
  performedBy: string;
}

export interface DashboardKPIs {
  totalProducts: number;
  totalStockUnits: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  internalTransfersScheduledCount: number;
}
