import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms/Header";
import { Sidebar } from "../organisms/Sidebar";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";
import { cn } from "@/shared/utils/cn";

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
  title = "Mini Shop",
  showSidebar = true,
  showHeader = true,
  headerHeight = "h-16",
  className = "",
  onLogoClick,
}: LayoutProps) {
  useScrollToTop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const hasSidebar = showSidebar && navigation.length > 0;

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate("/dashboard");
    }
    setSidebarOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-background pt-7 pr-7", className)}>
      {hasSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          title={title}
          onLogoClick={handleLogoClick}
        />
      )}

      <div className={hasSidebar ? "lg:pl-64 ml-7" : ""}>
        {showHeader && (
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            className={headerHeight}
            withSidebar={hasSidebar}
          />
        )}

        <main
          className={cn(
            showHeader && "pt-[calc(1.75rem+3.5rem+0.75rem)] sm:pt-[calc(1.75rem+4rem+0.75rem)]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
