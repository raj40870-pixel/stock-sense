import {
  Category,
  DashboardKPIs,
  Location,
  Operation,
  OperationItem,
  OperationStatus,
  OperationType,
  Product,
  StockMove,
  StockQuant,
  UserProfile,
  Warehouse,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'stocksense_products',
  CATEGORIES: 'stocksense_categories',
  WAREHOUSES: 'stocksense_warehouses',
  LOCATIONS: 'stocksense_locations',
  QUANTS: 'stocksense_quants',
  OPERATIONS: 'stocksense_operations',
  LEDGER: 'stocksense_ledger',
  USER: 'stocksense_current_user',
  ACCOUNTS: 'stocksense_accounts',
};

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  warehouseId?: string;
}

const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'usr-k69117842',
    name: 'Kamaljit Singh',
    email: 'k69117842@gmail.com',
    password: 'password123',
    role: 'inventory_manager',
    warehouseId: 'wh-1',
  },
];

// Initial Seed Data
const DEFAULT_WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Main Central Warehouse', code: 'WH1', address: 'Plot 42, Industrial Area, Phase 1', isDefault: true },
  { id: 'wh-2', name: 'Secondary Store & Distribution', code: 'WH2', address: 'Sector 9, Logistics Hub', isDefault: false },
];

const DEFAULT_LOCATIONS: Location[] = [
  { id: 'loc-wh1-stock', warehouseId: 'wh-1', name: 'Main Stock Area (WH1/Stock)', code: 'WH1/STOCK', type: 'internal' },
  { id: 'loc-wh1-prod', warehouseId: 'wh-1', name: 'Production Floor Rack (WH1/Prod)', code: 'WH1/PROD', type: 'production' },
  { id: 'loc-wh1-racka', warehouseId: 'wh-1', name: 'High-Density Rack A (WH1/RackA)', code: 'WH1/RACK-A', type: 'internal' },
  { id: 'loc-wh1-rackb', warehouseId: 'wh-1', name: 'High-Density Rack B (WH1/RackB)', code: 'WH1/RACK-B', type: 'internal' },
  { id: 'loc-wh2-stock', warehouseId: 'wh-2', name: 'Branch Storage (WH2/Stock)', code: 'WH2/STOCK', type: 'internal' },
  { id: 'loc-vendor', warehouseId: 'wh-1', name: 'Vendors / Suppliers', code: 'PARTNER/VENDORS', type: 'vendor' },
  { id: 'loc-customer', warehouseId: 'wh-1', name: 'Customers / Outgoing', code: 'PARTNER/CUSTOMERS', type: 'customer' },
  { id: 'loc-scraps', warehouseId: 'wh-1', name: 'Scraps & Damaged Adjustments', code: 'VIRTUAL/SCRAP', type: 'inventory_loss' },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-raw', name: 'Raw Materials', description: 'Metals, sheets, rods, and primary materials' },
  { id: 'cat-finished', name: 'Finished Goods', description: 'Completed assembly products ready for sales' },
  { id: 'cat-hardware', name: 'Hardware & Fasteners', description: 'Bolts, nuts, brackets, and accessories' },
  { id: 'cat-packaging', name: 'Packaging Supplies', description: 'Boxes, bubble wrap, labels' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Steel Rods (10mm)',
    sku: 'STL-101',
    categoryId: 'cat-raw',
    categoryName: 'Raw Materials',
    uom: 'Kg',
    minStock: 25,
    maxStock: 250,
    costPrice: 65,
    description: 'High-grade structural steel reinforcement bars',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Ergonomic Office Chairs',
    sku: 'CHR-202',
    categoryId: 'cat-finished',
    categoryName: 'Finished Goods',
    uom: 'Units',
    minStock: 10,
    maxStock: 60,
    costPrice: 2800,
    description: 'Black mesh back with adjustable lumbar support',
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 'prod-3',
    name: 'Aluminium Alloy Plates',
    sku: 'ALM-303',
    categoryId: 'cat-raw',
    categoryName: 'Raw Materials',
    uom: 'Pcs',
    minStock: 15,
    maxStock: 120,
    costPrice: 420,
    description: '5mm aircraft grade aluminium alloy sheets',
    createdAt: '2026-09-05T14:15:00Z',
  },
  {
    id: 'prod-4',
    name: 'Hex Metric Bolts M8',
    sku: 'BLT-404',
    categoryId: 'cat-hardware',
    categoryName: 'Hardware & Fasteners',
    uom: 'Boxes',
    minStock: 12,
    maxStock: 100,
    costPrice: 150,
    description: '100 pcs per box, zinc plated steel',
    createdAt: '2026-09-10T09:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Heavy Duty Cardboard Box',
    sku: 'PKG-505',
    categoryId: 'cat-packaging',
    categoryName: 'Packaging Supplies',
    uom: 'Pcs',
    minStock: 40,
    maxStock: 500,
    costPrice: 35,
    description: 'Corrugated dual-wall shipping container',
    createdAt: '2026-09-12T16:45:00Z',
  },
];

const DEFAULT_QUANTS: StockQuant[] = [
  { productId: 'prod-1', locationId: 'loc-wh1-stock', quantity: 97 },
  { productId: 'prod-1', locationId: 'loc-wh1-prod', quantity: 25 },
  { productId: 'prod-2', locationId: 'loc-wh1-stock', quantity: 25 },
  { productId: 'prod-3', locationId: 'loc-wh1-racka', quantity: 8 }, // Low stock: min 15
  { productId: 'prod-4', locationId: 'loc-wh1-rackb', quantity: 5 }, // Low stock: min 12
  { productId: 'prod-5', locationId: 'loc-wh1-stock', quantity: 0 }, // Out of stock: min 40
];

const DEFAULT_OPERATIONS: Operation[] = [
  {
    id: 'op-1',
    refNo: 'REC-2026-001',
    type: 'receipt',
    status: 'done',
    partnerName: 'Tata Steel Industrial',
    sourceLocationId: 'loc-vendor',
    sourceLocationName: 'Vendors / Suppliers',
    destLocationId: 'loc-wh1-stock',
    destLocationName: 'Main Stock Area (WH1/Stock)',
    scheduledDate: '2026-09-20',
    notes: 'Initial bulk vendor shipment for steel bars',
    items: [
      { id: 'item-1', productId: 'prod-1', productName: 'Steel Rods (10mm)', sku: 'STL-101', uom: 'Kg', demandedQty: 100, doneQty: 100 }
    ],
    createdAt: '2026-09-20T09:00:00Z',
    validatedAt: '2026-09-20T10:15:00Z',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'op-2',
    refNo: 'INT-2026-001',
    type: 'internal',
    status: 'done',
    partnerName: 'Internal Transfer',
    sourceLocationId: 'loc-wh1-stock',
    sourceLocationName: 'Main Stock Area (WH1/Stock)',
    destLocationId: 'loc-wh1-prod',
    destLocationName: 'Production Floor Rack (WH1/Prod)',
    scheduledDate: '2026-09-22',
    notes: 'Shifted raw material to production floor',
    items: [
      { id: 'item-2', productId: 'prod-1', productName: 'Steel Rods (10mm)', sku: 'STL-101', uom: 'Kg', demandedQty: 25, doneQty: 25 }
    ],
    createdAt: '2026-09-22T11:00:00Z',
    validatedAt: '2026-09-22T11:45:00Z',
    performedBy: 'Warehouse Staff',
  },
  {
    id: 'op-3',
    refNo: 'DEL-2026-001',
    type: 'delivery',
    status: 'done',
    partnerName: 'Apex Innovations Pvt Ltd',
    sourceLocationId: 'loc-wh1-stock',
    sourceLocationName: 'Main Stock Area (WH1/Stock)',
    destLocationId: 'loc-customer',
    destLocationName: 'Customers / Outgoing',
    scheduledDate: '2026-09-24',
    notes: 'Sales order dispatch for chairs',
    items: [
      { id: 'item-3', productId: 'prod-2', productName: 'Ergonomic Office Chairs', sku: 'CHR-202', uom: 'Units', demandedQty: 10, doneQty: 10 }
    ],
    createdAt: '2026-09-24T14:00:00Z',
    validatedAt: '2026-09-24T15:30:00Z',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'op-4',
    refNo: 'ADJ-2026-001',
    type: 'adjustment',
    status: 'done',
    partnerName: 'Physical Audit Check',
    sourceLocationId: 'loc-wh1-stock',
    sourceLocationName: 'Main Stock Area (WH1/Stock)',
    destLocationId: 'loc-scraps',
    destLocationName: 'Scraps & Damaged Adjustments',
    scheduledDate: '2026-09-25',
    notes: '3 Kg steel damaged in transit, deducted from recorded balance',
    items: [
      { id: 'item-4', productId: 'prod-1', productName: 'Steel Rods (10mm)', sku: 'STL-101', uom: 'Kg', demandedQty: 3, doneQty: 3 }
    ],
    createdAt: '2026-09-25T16:00:00Z',
    validatedAt: '2026-09-25T16:20:00Z',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'op-5',
    refNo: 'REC-2026-002',
    type: 'receipt',
    status: 'waiting',
    partnerName: 'Durafit Global Furniture',
    sourceLocationId: 'loc-vendor',
    sourceLocationName: 'Vendors / Suppliers',
    destLocationId: 'loc-wh1-stock',
    destLocationName: 'Main Stock Area (WH1/Stock)',
    scheduledDate: '2026-09-27',
    notes: 'Incoming fresh batch of ergonomic chairs',
    items: [
      { id: 'item-5', productId: 'prod-2', productName: 'Ergonomic Office Chairs', sku: 'CHR-202', uom: 'Units', demandedQty: 20, doneQty: 0 }
    ],
    createdAt: '2026-09-26T08:00:00Z',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'op-6',
    refNo: 'DEL-2026-002',
    type: 'delivery',
    status: 'ready',
    partnerName: 'Zenith Tech Systems',
    sourceLocationId: 'loc-wh1-racka',
    sourceLocationName: 'High-Density Rack A (WH1/RackA)',
    destLocationId: 'loc-customer',
    destLocationName: 'Customers / Outgoing',
    scheduledDate: '2026-09-26',
    notes: 'Pending packing & shipping confirmation',
    items: [
      { id: 'item-6', productId: 'prod-3', productName: 'Aluminium Alloy Plates', sku: 'ALM-303', uom: 'Pcs', demandedQty: 5, doneQty: 5 }
    ],
    createdAt: '2026-09-26T08:30:00Z',
    performedBy: 'Warehouse Staff',
  },
  {
    id: 'op-7',
    refNo: 'INT-2026-002',
    type: 'internal',
    status: 'draft',
    partnerName: 'Rack Rebalancing',
    sourceLocationId: 'loc-wh1-racka',
    sourceLocationName: 'High-Density Rack A (WH1/RackA)',
    destLocationId: 'loc-wh1-rackb',
    destLocationName: 'High-Density Rack B (WH1/RackB)',
    scheduledDate: '2026-09-28',
    notes: 'Scheduled internal warehouse re-shelving',
    items: [
      { id: 'item-7', productId: 'prod-4', productName: 'Hex Metric Bolts M8', sku: 'BLT-404', uom: 'Boxes', demandedQty: 2, doneQty: 0 }
    ],
    createdAt: '2026-09-26T09:15:00Z',
    performedBy: 'Warehouse Staff',
  },
];

const DEFAULT_MOVES: StockMove[] = [
  {
    id: 'move-1',
    timestamp: '2026-09-20T10:15:00Z',
    reference: 'REC-2026-001',
    operationType: 'receipt',
    productId: 'prod-1',
    productName: 'Steel Rods (10mm)',
    sku: 'STL-101',
    fromLocationId: 'loc-vendor',
    fromLocationName: 'Vendors / Suppliers',
    toLocationId: 'loc-wh1-stock',
    toLocationName: 'Main Stock Area (WH1/Stock)',
    quantity: 100,
    uom: 'Kg',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'move-2',
    timestamp: '2026-09-22T11:45:00Z',
    reference: 'INT-2026-001',
    operationType: 'internal',
    productId: 'prod-1',
    productName: 'Steel Rods (10mm)',
    sku: 'STL-101',
    fromLocationId: 'loc-wh1-stock',
    fromLocationName: 'Main Stock Area (WH1/Stock)',
    toLocationId: 'loc-wh1-prod',
    toLocationName: 'Production Floor Rack (WH1/Prod)',
    quantity: 25,
    uom: 'Kg',
    performedBy: 'Warehouse Staff',
  },
  {
    id: 'move-3',
    timestamp: '2026-09-24T15:30:00Z',
    reference: 'DEL-2026-001',
    operationType: 'delivery',
    productId: 'prod-2',
    productName: 'Ergonomic Office Chairs',
    sku: 'CHR-202',
    fromLocationId: 'loc-wh1-stock',
    fromLocationName: 'Main Stock Area (WH1/Stock)',
    toLocationId: 'loc-customer',
    toLocationName: 'Customers / Outgoing',
    quantity: 10,
    uom: 'Units',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
  {
    id: 'move-4',
    timestamp: '2026-09-25T16:20:00Z',
    reference: 'ADJ-2026-001',
    operationType: 'adjustment',
    productId: 'prod-1',
    productName: 'Steel Rods (10mm)',
    sku: 'STL-101',
    fromLocationId: 'loc-wh1-stock',
    fromLocationName: 'Main Stock Area (WH1/Stock)',
    toLocationId: 'loc-scraps',
    toLocationName: 'Scraps & Damaged Adjustments',
    quantity: 3,
    uom: 'Kg',
    performedBy: 'Kamaljit (Inventory Manager)',
  },
];

const DEFAULT_USER: UserProfile = {
  id: 'usr-k69117842',
  name: 'Kamaljit Singh',
  email: 'k69117842@gmail.com',
  role: 'inventory_manager',
  warehouseId: 'wh-1',
};

class InventoryStore {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.WAREHOUSES)) {
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(DEFAULT_WAREHOUSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUANTS)) {
      localStorage.setItem(STORAGE_KEYS.QUANTS, JSON.stringify(DEFAULT_QUANTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OPERATIONS)) {
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(DEFAULT_OPERATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) {
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(DEFAULT_MOVES));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- User Profile & Role ---
  public getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) return null;
      const user: UserProfile = JSON.parse(data);
      // Clean up old fake accounts in current session
      const fakeEmails = ['manager@stocksense.io', 'staff@stocksense.io', 'kamaljit.manager@stocksense.io', 'kamaljit444501@gmail.com'];
      if (user.email && fakeEmails.includes(user.email.toLowerCase())) {
        user.email = 'k69117842@gmail.com';
        user.name = 'Kamaljit Singh';
        user.role = 'inventory_manager';
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  }

  public login(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.notify();
  }

  public logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.notify();
  }

  public setUserRole(role: 'inventory_manager' | 'warehouse_staff') {
    const user = this.getUser();
    if (user) {
      user.role = role;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.notify();
    }
  }

  public updateUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.notify();
  }

  // --- Real User Accounts & Auth ---
  public getAccounts(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      let accounts: StoredUserAccount[] = data ? JSON.parse(data) : [];

      // Filter out any fake demo accounts
      const fakeEmails = [
        'manager@stocksense.io',
        'staff@stocksense.io',
        'kamaljit.manager@stocksense.io',
        'kamaljit444501@gmail.com',
      ];
      accounts = accounts.filter(a => !fakeEmails.includes(a.email.toLowerCase()));

      // Ensure the real user k69117842@gmail.com is present
      const realAccIndex = accounts.findIndex(a => a.email.toLowerCase() === 'k69117842@gmail.com');
      if (realAccIndex === -1) {
        accounts.unshift({
          id: 'usr-k69117842',
          name: 'Kamaljit Singh',
          email: 'k69117842@gmail.com',
          password: 'password123',
          role: 'inventory_manager',
          warehouseId: 'wh-1',
        });
      }

      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      return accounts;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  public registerAccount(name: string, email: string, password: string): { success: boolean; message: string; user?: UserProfile } {
    const accounts = this.getAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === normalizedEmail);
    const isStaff = normalizedEmail.includes('staff');
    const role: UserRole = isStaff ? 'warehouse_staff' : 'inventory_manager';

    if (existingIndex !== -1) {
      accounts[existingIndex].password = password;
      accounts[existingIndex].name = name;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      const user: UserProfile = {
        id: accounts[existingIndex].id,
        name: accounts[existingIndex].name,
        email: accounts[existingIndex].email,
        role: accounts[existingIndex].role,
        warehouseId: accounts[existingIndex].warehouseId,
      };
      this.login(user);
      return { success: true, message: 'Account updated and logged in!', user };
    }

    const newAcc: StoredUserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      password,
      role,
      warehouseId: 'wh-1',
    };

    accounts.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

    const user: UserProfile = {
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      role: newAcc.role,
      warehouseId: newAcc.warehouseId,
    };
    this.login(user);
    return { success: true, message: 'Account registered successfully!', user };
  }

  public authenticate(email: string, password?: string): { success: boolean; message: string; user?: UserProfile } {
    const accounts = this.getAccounts();
    const normalizedEmail = (email || 'k69117842@gmail.com').trim().toLowerCase();
    const acc = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (acc) {
      if (password) {
        acc.password = password;
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
      const user: UserProfile = {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        warehouseId: acc.warehouseId,
      };
      this.login(user);
      return { success: true, message: 'Login successful!', user };
    }

    // Seamlessly register and log in any email entered
    const isStaff = normalizedEmail.includes('staff');
    const rawName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    return this.registerAccount(formattedName || 'Inventory User', normalizedEmail, password || 'password123');
  }

  public resetPassword(email: string, newPassword: string): { success: boolean; message: string; user?: UserProfile } {
    const accounts = this.getAccounts();
    const normalizedEmail = email.trim().toLowerCase();
    const acc = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (acc) {
      acc.password = newPassword;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      const user: UserProfile = {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        warehouseId: acc.warehouseId,
      };
      this.login(user);
      return { success: true, message: `Password for ${acc.email} reset and saved successfully!`, user };
    } else {
      const isStaff = normalizedEmail.includes('staff');
      const rawName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      return this.registerAccount(formattedName, normalizedEmail, newPassword);
    }
  }

  // --- Warehouses & Locations ---
  public getWarehouses(): Warehouse[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      return data ? JSON.parse(data) : DEFAULT_WAREHOUSES;
    } catch {
      return DEFAULT_WAREHOUSES;
    }
  }

  public addWarehouse(wh: Omit<Warehouse, 'id'>): Warehouse {
    const warehouses = this.getWarehouses();
    const newWh: Warehouse = {
      ...wh,
      id: `wh-${Date.now()}`,
    };
    warehouses.push(newWh);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));

    // Also auto-create default Stock area for this warehouse
    this.addLocation({
      warehouseId: newWh.id,
      name: `${newWh.code} Main Stock`,
      code: `${newWh.code}/STOCK`,
      type: 'internal',
    });

    this.notify();
    return newWh;
  }

  public getLocations(warehouseId?: string): Location[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      const locs: Location[] = data ? JSON.parse(data) : DEFAULT_LOCATIONS;
      if (warehouseId) {
        return locs.filter(l => l.warehouseId === warehouseId || l.type === 'vendor' || l.type === 'customer' || l.type === 'inventory_loss');
      }
      return locs;
    } catch {
      return DEFAULT_LOCATIONS;
    }
  }

  public addLocation(loc: Omit<Location, 'id'>): Location {
    const locations = this.getLocations();
    const newLoc: Location = {
      ...loc,
      id: `loc-${Date.now()}`,
    };
    locations.push(newLoc);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notify();
    return newLoc;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
    return newCat;
  }

  // --- Products & Quants ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  public getQuants(): StockQuant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUANTS);
      return data ? JSON.parse(data) : DEFAULT_QUANTS;
    } catch {
      return DEFAULT_QUANTS;
    }
  }

  public getProductStock(productId: string, locationId?: string): number {
    const quants = this.getQuants();
    const internalLocIds = new Set(this.getLocations().filter(l => l.type === 'internal' || l.type === 'production').map(l => l.id));

    if (locationId) {
      const quant = quants.find(q => q.productId === productId && q.locationId === locationId);
      return quant ? quant.quantity : 0;
    }

    // Total stock in internal & production locations
    return quants
      .filter(q => q.productId === productId && internalLocIds.has(q.locationId))
      .reduce((sum, q) => sum + q.quantity, 0);
  }

  public getProductLocationBreakdown(productId: string): { location: Location; quantity: number }[] {
    const locations = this.getLocations().filter(l => l.type === 'internal' || l.type === 'production');
    const quants = this.getQuants().filter(q => q.productId === productId);

    return locations.map(loc => {
      const q = quants.find(item => item.locationId === loc.id);
      return {
        location: loc,
        quantity: q ? q.quantity : 0,
      };
    });
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>, initialStock?: { locationId: string; quantity: number }): Product {
    const products = this.getProducts();
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    products.push(newProd);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (initialStock && initialStock.quantity > 0) {
      this.updateStockQuant(newProd.id, initialStock.locationId, initialStock.quantity);
      // Log in ledger
      const loc = this.getLocations().find(l => l.id === initialStock.locationId);
      this.addStockMove({
        reference: `INIT-${newProd.sku}`,
        operationType: 'receipt',
        productId: newProd.id,
        productName: newProd.name,
        sku: newProd.sku,
        fromLocationId: 'loc-vendor',
        fromLocationName: 'Inventory Opening Balance',
        toLocationId: initialStock.locationId,
        toLocationName: loc ? loc.name : 'Main Stock',
        quantity: initialStock.quantity,
        uom: newProd.uom,
        performedBy: this.getUser().name,
      });
    }

    this.notify();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
    return products[index];
  }

  public deleteProduct(id: string) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  private updateStockQuant(productId: string, locationId: string, delta: number) {
    const quants = this.getQuants();
    const index = quants.findIndex(q => q.productId === productId && q.locationId === locationId);

    if (index !== -1) {
      quants[index].quantity = Math.max(0, quants[index].quantity + delta);
    } else if (delta > 0) {
      quants.push({ productId, locationId, quantity: delta });
    }
    localStorage.setItem(STORAGE_KEYS.QUANTS, JSON.stringify(quants));
  }

  private setExactStockQuant(productId: string, locationId: string, exactQty: number) {
    const quants = this.getQuants();
    const index = quants.findIndex(q => q.productId === productId && q.locationId === locationId);

    if (index !== -1) {
      quants[index].quantity = Math.max(0, exactQty);
    } else {
      quants.push({ productId, locationId, quantity: Math.max(0, exactQty) });
    }
    localStorage.setItem(STORAGE_KEYS.QUANTS, JSON.stringify(quants));
  }

  // --- Operations (Receipts, Deliveries, Transfers, Adjustments) ---
  public getOperations(typeFilter?: OperationType): Operation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      const ops: Operation[] = data ? JSON.parse(data) : DEFAULT_OPERATIONS;
      if (typeFilter) {
        return ops.filter(o => o.type === typeFilter);
      }
      return ops;
    } catch {
      return DEFAULT_OPERATIONS;
    }
  }

  public createOperation(data: {
    type: OperationType;
    partnerName?: string;
    sourceLocationId: string;
    destLocationId: string;
    scheduledDate: string;
    notes?: string;
    items: { productId: string; demandedQty: number; doneQty?: number }[];
  }): Operation {
    const ops = this.getOperations();
    const products = this.getProducts();
    const locations = this.getLocations();

    const prefix =
      data.type === 'receipt'
        ? 'REC'
        : data.type === 'delivery'
        ? 'DEL'
        : data.type === 'internal'
        ? 'INT'
        : 'ADJ';

    const count = ops.filter(o => o.type === data.type).length + 1;
    const refNo = `${prefix}-2026-${String(count).padStart(3, '0')}`;

    const srcLoc = locations.find(l => l.id === data.sourceLocationId);
    const dstLoc = locations.find(l => l.id === data.destLocationId);

    const items: OperationItem[] = data.items.map((it, idx) => {
      const prod = products.find(p => p.id === it.productId);
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
        uom: prod ? prod.uom : 'Units',
        demandedQty: it.demandedQty,
        doneQty: it.doneQty !== undefined ? it.doneQty : 0,
      };
    });

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      refNo,
      type: data.type,
      status: 'draft',
      partnerName: data.partnerName || (data.type === 'receipt' ? 'Vendor' : data.type === 'delivery' ? 'Customer' : 'Internal'),
      sourceLocationId: data.sourceLocationId,
      sourceLocationName: srcLoc ? srcLoc.name : 'Source',
      destLocationId: data.destLocationId,
      destLocationName: dstLoc ? dstLoc.name : 'Destination',
      scheduledDate: data.scheduledDate,
      notes: data.notes,
      items,
      createdAt: new Date().toISOString(),
      performedBy: this.getUser().name,
    };

    ops.unshift(newOp);
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
    this.notify();
    return newOp;
  }

  public updateOperationStatus(opId: string, status: OperationStatus) {
    const ops = this.getOperations();
    const op = ops.find(o => o.id === opId);
    if (!op) return;

    op.status = status;
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
    this.notify();
  }

  /**
   * Validate Operation:
   * - If 'receipt': items arrive from vendor -> stock increases (+doneQty) in destLocation
   * - If 'delivery': items ship to customer -> stock decreases (-doneQty) from sourceLocation
   * - If 'internal': items move from sourceLocation to destLocation -> total stock unchanged, location balances transfer
   * - If 'adjustment': counted quantity discrepancy is matched -> updates exact count and logs difference to scraps/loss
   * Logs everything into the Stock Ledger!
   */
  public validateOperation(opId: string, customDoneQtys?: Record<string, number>): { success: boolean; message: string } {
    const ops = this.getOperations();
    const op = ops.find(o => o.id === opId);
    if (!op) return { success: false, message: 'Operation not found' };
    if (op.status === 'done') return { success: false, message: 'Operation already validated' };

    const locations = this.getLocations();
    const srcLoc = locations.find(l => l.id === op.sourceLocationId);
    const dstLoc = locations.find(l => l.id === op.destLocationId);

    // Apply done quantities
    op.items.forEach(item => {
      if (customDoneQtys && customDoneQtys[item.id] !== undefined) {
        item.doneQty = customDoneQtys[item.id];
      } else if (item.doneQty === 0) {
        item.doneQty = item.demandedQty; // default auto-fulfill
      }
    });

    const now = new Date().toISOString();
    const currentUser = this.getUser().name;

    // Execute physical stock movement
    for (const item of op.items) {
      const qty = item.doneQty;
      if (qty <= 0) continue;

      if (op.type === 'receipt') {
        // Incoming from vendor -> destination stock increases
        this.updateStockQuant(item.productId, op.destLocationId, qty);
        this.addStockMove({
          reference: op.refNo,
          operationType: 'receipt',
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          fromLocationId: op.sourceLocationId,
          fromLocationName: srcLoc?.name || 'Vendors',
          toLocationId: op.destLocationId,
          toLocationName: dstLoc?.name || 'Stock Area',
          quantity: qty,
          uom: item.uom,
          performedBy: currentUser,
        });
      } else if (op.type === 'delivery') {
        // Outgoing to customer -> source stock decreases
        const available = this.getProductStock(item.productId, op.sourceLocationId);
        if (available < qty) {
          return {
            success: false,
            message: `Insufficient stock for ${item.productName} in ${srcLoc?.name}. Available: ${available}, Demanded: ${qty}`,
          };
        }
        this.updateStockQuant(item.productId, op.sourceLocationId, -qty);
        this.addStockMove({
          reference: op.refNo,
          operationType: 'delivery',
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          fromLocationId: op.sourceLocationId,
          fromLocationName: srcLoc?.name || 'Stock Area',
          toLocationId: op.destLocationId,
          toLocationName: dstLoc?.name || 'Customer Location',
          quantity: qty,
          uom: item.uom,
          performedBy: currentUser,
        });
      } else if (op.type === 'internal') {
        // Internal transfer -> move between locations
        const available = this.getProductStock(item.productId, op.sourceLocationId);
        if (available < qty) {
          return {
            success: false,
            message: `Insufficient stock for ${item.productName} in ${srcLoc?.name} to transfer. Available: ${available}, Requested: ${qty}`,
          };
        }
        this.updateStockQuant(item.productId, op.sourceLocationId, -qty);
        this.updateStockQuant(item.productId, op.destLocationId, qty);
        this.addStockMove({
          reference: op.refNo,
          operationType: 'internal',
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          fromLocationId: op.sourceLocationId,
          fromLocationName: srcLoc?.name || 'Source Rack',
          toLocationId: op.destLocationId,
          toLocationName: dstLoc?.name || 'Destination Rack',
          quantity: qty,
          uom: item.uom,
          performedBy: currentUser,
        });
      } else if (op.type === 'adjustment') {
        // Stock adjustment -> item.demandedQty is the adjustment quantity
        this.updateStockQuant(item.productId, op.sourceLocationId, -qty);
        this.addStockMove({
          reference: op.refNo,
          operationType: 'adjustment',
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          fromLocationId: op.sourceLocationId,
          fromLocationName: srcLoc?.name || 'Audited Location',
          toLocationId: op.destLocationId,
          toLocationName: dstLoc?.name || 'Adjustment Scrap/Loss',
          quantity: qty,
          uom: item.uom,
          performedBy: currentUser,
        });
      }
    }

    op.status = 'done';
    op.validatedAt = now;
    op.performedBy = currentUser;
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
    this.notify();

    return { success: true, message: `Successfully validated ${op.refNo}. Stock ledger updated!` };
  }

  // --- Perform Direct Physical Count Adjustment ---
  public performStockCountAdjustment(productId: string, locationId: string, physicalCount: number, reason: string): { difference: number; op: Operation } {
    const currentStock = this.getProductStock(productId, locationId);
    const difference = physicalCount - currentStock; // e.g. 10 recorded, 7 counted -> diff = -3
    const prod = this.getProducts().find(p => p.id === productId);
    const loc = this.getLocations().find(l => l.id === locationId);

    const ops = this.getOperations();
    const count = ops.filter(o => o.type === 'adjustment').length + 1;
    const refNo = `ADJ-2026-${String(count).padStart(3, '0')}`;

    // Apply exact quantity directly
    this.setExactStockQuant(productId, locationId, physicalCount);

    const op: Operation = {
      id: `op-adj-${Date.now()}`,
      refNo,
      type: 'adjustment',
      status: 'done',
      partnerName: 'Physical Audit Count',
      sourceLocationId: locationId,
      sourceLocationName: loc?.name || 'Location',
      destLocationId: 'loc-scraps',
      destLocationName: difference < 0 ? 'Scrap / Loss' : 'Inventory Found',
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: reason || `Counted ${physicalCount} vs System ${currentStock} (${difference >= 0 ? '+' : ''}${difference} ${prod?.uom})`,
      items: [
        {
          id: `item-adj-${Date.now()}`,
          productId,
          productName: prod?.name || 'Product',
          sku: prod?.sku || 'SKU',
          uom: prod?.uom || 'Units',
          demandedQty: Math.abs(difference),
          doneQty: Math.abs(difference),
        },
      ],
      createdAt: new Date().toISOString(),
      validatedAt: new Date().toISOString(),
      performedBy: this.getUser().name,
    };

    ops.unshift(op);
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));

    // Stock move
    this.addStockMove({
      reference: refNo,
      operationType: 'adjustment',
      productId,
      productName: prod?.name || 'Product',
      sku: prod?.sku || 'SKU',
      fromLocationId: difference < 0 ? locationId : 'loc-scraps',
      fromLocationName: difference < 0 ? (loc?.name || 'Location') : 'Inventory Surplus',
      toLocationId: difference < 0 ? 'loc-scraps' : locationId,
      toLocationName: difference < 0 ? 'Scraps & Damaged' : (loc?.name || 'Location'),
      quantity: Math.abs(difference),
      uom: prod?.uom || 'Units',
      performedBy: this.getUser().name,
    });

    this.notify();
    return { difference, op };
  }

  // --- Move History / Stock Ledger ---
  public getStockLedger(): StockMove[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEDGER);
      return data ? JSON.parse(data) : DEFAULT_MOVES;
    } catch {
      return DEFAULT_MOVES;
    }
  }

  private addStockMove(move: Omit<StockMove, 'id' | 'timestamp'>) {
    const ledger = this.getStockLedger();
    const newMove: StockMove = {
      ...move,
      id: `move-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    ledger.unshift(newMove);
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }

  // --- Dashboard Analytics & KPIs ---
  public getKPIs(): DashboardKPIs {
    const products = this.getProducts();
    const ops = this.getOperations();

    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const current = this.getProductStock(p.id);
      totalUnits += current;
      if (current === 0) {
        outOfStockCount++;
      } else if (current <= p.minStock) {
        lowStockCount++;
      }
    });

    const pendingReceipts = ops.filter(o => o.type === 'receipt' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;
    const pendingDeliveries = ops.filter(o => o.type === 'delivery' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;
    const scheduledTransfers = ops.filter(o => o.type === 'internal' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;

    return {
      totalProducts: products.length,
      totalStockUnits: totalUnits,
      lowStockItemsCount: lowStockCount,
      outOfStockItemsCount: outOfStockCount,
      pendingReceiptsCount: pendingReceipts,
      pendingDeliveriesCount: pendingDeliveries,
      internalTransfersScheduledCount: scheduledTransfers,
    };
  }

  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(DEFAULT_WAREHOUSES));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.QUANTS, JSON.stringify(DEFAULT_QUANTS));
    localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(DEFAULT_OPERATIONS));
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(DEFAULT_MOVES));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    this.notify();
  }
}

export const inventoryStore = new InventoryStore();
