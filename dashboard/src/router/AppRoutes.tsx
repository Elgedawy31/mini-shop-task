import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BarChart3, Home, Package, Settings, ShoppingCart } from "lucide-react";
import { Layout } from "../shared/components/templates/Layout";
import { ProtectedRoute } from "@/shared/components/organisms/ProtectedRoute";
import { FullScreenLoader } from "@/shared/components/molecules/FullScreenLoader";

// Lazy load pages for performance
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ProductsPage = lazy(() => import("@/features/products/pages/ProductsPage"));
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage"));
const AnalyticsPage = lazy(() => import("@/features/analytics/pages/AnalyticsPage"));
const ProfileSettingsPage = lazy(() => import("@/features/settings/pages/ProfileSettingsPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SetupPage = lazy(() => import("@/features/auth/pages/SetupPage"));

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/sign-in" element={<LoginPage />} />

          {/* Protected Layout Routes */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout navigation={navigation} title="Mini Shop" showSidebar showHeader>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<ProfileSettingsPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
