-- ==========================================================
-- StockSense IMS (Odoo-Style Modular Inventory Management)
-- Database Schema for InsForge PostgreSQL
-- ==========================================================

-- 1. Warehouses Table
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Locations Table (Internal racks, vendor, customer, scraps)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'internal', -- 'internal', 'production', 'vendor', 'customer', 'inventory_loss'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Master
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    uom VARCHAR(50) NOT NULL DEFAULT 'Units', -- 'Kg', 'Units', 'Pcs', 'Boxes', 'Meters'
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 10,
    max_stock NUMERIC(12, 2) NOT NULL DEFAULT 100,
    cost_price NUMERIC(12, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stock Quants (Inventory level per product & location)
CREATE TABLE IF NOT EXISTS public.stock_quants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_location UNIQUE (product_id, location_id)
);

-- 6. Operations (Receipts, Deliveries, Internal Transfers, Adjustments)
CREATE TABLE IF NOT EXISTS public.operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_no VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'receipt', 'delivery', 'internal', 'adjustment'
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'waiting', 'ready', 'done', 'canceled'
    partner_name VARCHAR(255),
    source_location_id UUID REFERENCES public.locations(id),
    dest_location_id UUID REFERENCES public.locations(id),
    scheduled_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ
);

-- 7. Operation Items
CREATE TABLE IF NOT EXISTS public.operation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES public.operations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    demanded_qty NUMERIC(12, 2) NOT NULL DEFAULT 1,
    done_qty NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Stock Ledger / Move History (Audit Log)
CREATE TABLE IF NOT EXISTS public.stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    reference VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    from_location_id UUID REFERENCES public.locations(id),
    to_location_id UUID REFERENCES public.locations(id),
    quantity NUMERIC(12, 2) NOT NULL,
    uom VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_stock_quants_product ON public.stock_quants(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_quants_location ON public.stock_quants(location_id);
CREATE INDEX IF NOT EXISTS idx_operations_type_status ON public.operations(type, status);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_prod_time ON public.stock_ledger(product_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_quants ENABLE ROW LEVEL SECURITY;

-- Default permissive read policies for authenticated and anon users
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read operations" ON public.operations FOR SELECT USING (true);
CREATE POLICY "Allow public read stock_quants" ON public.stock_quants FOR SELECT USING (true);
CREATE POLICY "Allow public read stock_ledger" ON public.stock_ledger FOR SELECT USING (true);
