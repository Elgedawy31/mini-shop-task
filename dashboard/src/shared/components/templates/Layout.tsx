import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms/Header";
import { Sidebar } from "../organisms/Sidebar";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LayoutProps {
  children: React.ReactNode;
  navigation?: NavigationItem[];
  title?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  headerHeight?: string;
  className?: string;
  onLogoClick?: () => void;
}

export function Layout({
  children,
  navigation = [],
  title = "Central Hub",
  showSidebar = true,
  showHeader = true,
  headerHeight = "h-16",
  className = "",
  onLogoClick,
}: LayoutProps) {
  useScrollToTop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Default logo click behavior - navigate to dashboard
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate("/dashboard");
    }
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-background pt-7 pr-7 ${className}`}>
      {/* Sidebar */}
      {showSidebar && navigation.length > 0 && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          title={title}
          onLogoClick={handleLogoClick}
        />
      )}

      {/* Main content */}
      <div className={showSidebar && navigation.length > 0 ? `lg:pl-64 ml-7` : ""}>
        {/* Header */}
        {showHeader && <Header onMenuClick={() => setSidebarOpen(true)} className={headerHeight} />}

        {/* Page content */}
        <main className="!px-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
