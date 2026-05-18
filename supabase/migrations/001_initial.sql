-- Mini Shop — initial schema, RLS, and helpers
-- Run in Supabase SQL Editor or via Supabase CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active) WHERE deleted_at IS NULL;

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Role helpers for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Atomic order creation (called with authenticated user JWT)
CREATE OR REPLACE FUNCTION public.create_order_with_items(p_items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_total NUMERIC(10, 2) := 0;
  v_item JSONB;
  v_product RECORD;
  v_qty INTEGER;
  v_line_total NUMERIC(10, 2);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, price, is_active, deleted_at
    INTO v_product
    FROM public.products
    WHERE id = (v_item ->> 'productId')::UUID;

    IF NOT FOUND OR v_product.deleted_at IS NOT NULL OR NOT v_product.is_active THEN
      RAISE EXCEPTION 'Product unavailable: %', v_item ->> 'productId';
    END IF;

    v_qty := (v_item ->> 'quantity')::INTEGER;
    IF v_qty IS NULL OR v_qty < 1 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_item ->> 'productId';
    END IF;

    v_line_total := v_product.price * v_qty;
    v_total := v_total + v_line_total;
  END LOOP;

  INSERT INTO public.orders (user_id, status, total_amount)
  VALUES (v_user_id, 'pending', v_total)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_product FROM public.products
    WHERE id = (v_item ->> 'productId')::UUID;

    v_qty := (v_item ->> 'quantity')::INTEGER;

    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item ->> 'productId')::UUID,
      v_qty,
      v_product.price
    );
  END LOOP;

  RETURN jsonb_build_object('orderId', v_order_id, 'totalAmount', v_total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(JSONB) TO authenticated;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: read all, admin write
DROP POLICY IF EXISTS categories_select ON public.categories;
CREATE POLICY categories_select ON public.categories
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS categories_admin ON public.categories;
CREATE POLICY categories_admin ON public.categories
  FOR ALL USING (public.is_admin());

-- Products: public read active; admin full
DROP POLICY IF EXISTS products_select_active ON public.products;
CREATE POLICY products_select_active ON public.products
  FOR SELECT USING (
    (is_active = TRUE AND deleted_at IS NULL)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS products_admin ON public.products;
CREATE POLICY products_admin ON public.products
  FOR ALL USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS orders_insert_own ON public.orders;
CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS orders_update_admin ON public.orders;
CREATE POLICY orders_update_admin ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order items
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Realtime for orders (run after enabling replication in dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
