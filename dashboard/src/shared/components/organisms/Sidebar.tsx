import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { Button } from "../atoms/button";
import { MemoizedLogo } from "../atoms/Logo";
import { cn } from "../../utils/cn";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  title?: string;
  sb?: number | string;
  className?: string;
  onLogoClick?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  navigation,
  title = "Mini Shop",
  className,
  onLogoClick,
}: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar overlay */}
      <>
        {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      </>

      {/* Mobile sidebar */}
      <>
        {isOpen && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-80 bg-surface dark:bg-surface border-r border-border dark:border-border shadow-2xl lg:hidden",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-border dark:border-border bg-surface dark:bg-surface">
              <MemoizedLogo
                size="md"
                text={title}
                showText={false}
                onClick={onLogoClick}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "h-8 w-8 rounded-full ml-2",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
                )}
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-2 overflow-y-auto h-[calc(100vh-8rem)] bg-surface dark:bg-surface">
              <div className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-4 px-3">
                Navigation
              </div>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-foreground dark:text-foreground hover:text-foreground dark:hover:text-foreground hover:bg-accent dark:hover:bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary-foreground/20"
                              : "bg-muted dark:bg-muted group-hover:bg-muted/80 dark:group-hover:bg-muted/80"
                          )}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-all duration-200",
                          isActive
                            ? "opacity-100 text-primary-foreground/80"
                            : "opacity-0 group-hover:opacity-60 text-muted-foreground"
                        )}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border dark:border-border bg-surface dark:bg-surface">
              <div className="text-xs text-muted-foreground dark:text-muted-foreground text-center font-medium">
                Mini Shop Admin
              </div>
            </div>
          </div>
        )}
      </>

      {/* Desktop sidebar */}
      <div
        className={cn(
          `hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 my-7 rounded-3xl overflow-hidden `,
          "lg:bg-surface lg:border-r lg:border-border lg:dark:border-border",
          className
        )}
      >
        <div className="flex items-center h-16 px-10 pt-14 pb-14 bg-white dark:bg-gray-900">
          <MemoizedLogo size="full" text={title} showText={false} onClick={onLogoClick} />
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
          <span className="inline-flex font-semibold pb-1 text-gray-800 dark:text-gray-100">
            Menu
          </span>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground dark:text-foreground hover:text-foreground dark:hover:text-foreground hover:bg-accent dark:hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
