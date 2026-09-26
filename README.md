# StockSense | Odoo-Style Modular Inventory Management System (IMS)

StockSense is a centralized, real-time inventory management application designed to replace manual registers and scattered spreadsheets.

## 🚀 Key Features

### 1. Dashboard View
- **5 Real-Time KPIs**: Total Products in Stock, Low Stock / Out of Stock alerts, Pending Receipts, Pending Deliveries, Scheduled Internal Transfers.
- **Dynamic Filters**:
  - By Document Type (*Receipts / Delivery / Internal / Adjustments*)
  - By Status (*Draft, Waiting, Ready, Done, Canceled*)
  - By Warehouse or Location (*Main Stock, Production Rack, Rack A/B*)
  - By Product Category (*Raw Materials, Finished Goods, Hardware, Packaging*)
- **Operations Stream**: Instant validate buttons and status trackers.
- **Interactive Inventory Lifecycle Pipeline**: Visual workflow tracker from vendor incoming to customer shipment.

### 2. Products Master
- Create/update products with: **Name, SKU/Code, Category, Unit of Measure (UoM), Initial Stock, Min/Max Reordering Rules**.
- **Stock availability per location**: Interactive breakdown showing exact quantities at each rack/shelf.
- Low stock and critical out-of-stock warning triggers.

### 3. Core Operations
- **Receipts (Incoming Stock)**: Receive goods from suppliers -> click Validate -> Stock increases automatically (+X).
- **Delivery Orders (Outgoing Stock)**: Pick items -> Pack items -> Validate -> Stock decreases automatically (-X) with insufficient stock safeguards.
- **Internal Transfers**: Relocate stock inside company (e.g. *Main Store → Production Floor* or *Rack A → Rack B*). Preserves total company stock while updating location quantities.
- **Stock Adjustments (Audit)**: Fix mismatches between physical count vs recorded computer balance. Enter counted quantity -> System auto-calculates variance (e.g. -3 kg damaged steel) and updates inventory with audit reasons.

### 4. Move History (Stock Ledger / Audit Log)
- Immutable chronological transaction history tracking every single product movement: Timestamp, Reference, Operation Type, Product & SKU, Source Location, Destination Location, Quantity, and Authorized User.
- One-click CSV audit export.

### 5. Multi-Warehouse & Rack Settings
- Multi-warehouse support (e.g. WH1 Central, WH2 Logistics Hub).
- Create and assign internal storage racks, bays, and production floors.

### 6. Role Switcher & Profile
- Switch perspective anytime between **Inventory Manager** (Rules & Catalog) and **Warehouse Staff** (Transfers, Picking & Counting).
- Profile management with OTP password reset simulation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Vite.
- **Backend (BaaS)**: [InsForge](https://insforge.dev) (PostgreSQL, Auth, Real-time APIs).
- **Database Schema**: Full DDL in `schema.sql`.

## 💻 Running the App

```bash
# Start development server
npm run dev

# Build for production
npm run build
```
Live server is running on: `http://localhost:3000`
