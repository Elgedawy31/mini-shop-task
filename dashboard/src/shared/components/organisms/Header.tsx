import { Settings, Menu, User, LogOut } from "lucide-react";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/ThemeToggle";
import { useLogout, useVerifyUser } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "../molecules/ConfirmationModal";
import { cn } from "@/shared/utils/cn";
import React from "react";

interface HeaderProps {
  onMenuClick: () => void;
  className?: string;
  /** When true, offset left edge for desktop sidebar (lg:w-64 + main ml-7) */
  withSidebar?: boolean;
}

const iconButtonClass =
  "h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground hover:bg-accent";

export function Header({ onMenuClick, className, withSidebar = false }: HeaderProps) {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const { data: user } = useVerifyUser();
  const logout = useLogout();

  const username = user?.name || user?.email?.split("@")[0] || "Admin";
  const email = user?.email || "user@example.com";

  return (
    <header
      className={cn(
        "fixed top-7 z-40 right-7 flex h-14 sm:h-16 shrink-0 items-center justify-between",
        "rounded-2xl border border-border px-3 sm:px-4 lg:px-6",
        "bg-background/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
        withSidebar ? "left-0 lg:left-[calc(16rem+1.75rem)]" : "left-7",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn("lg:hidden", iconButtonClass)}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0 px-2 gap-0.5 sm:gap-2">
        <div className="truncate">
          <p className="text-sm sm:text-base font-medium text-foreground truncate">{username}</p>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className={cn("hidden xs:flex", iconButtonClass)}
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="hidden sm:block w-px h-4 sm:h-6 bg-border mx-1 sm:mx-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className={cn("hidden sm:flex", iconButtonClass)}
          aria-label="User profile"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
          </div>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLogoutModalOpen(true)}
          className={iconButtonClass}
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      <ConfirmationModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        title="Confirm Logout"
        description="Are you sure you want to log out?"
        onConfirm={() => {
          logout();
          setIsLogoutModalOpen(false);
        }}
        confirmText="Logout"
        variant="destructive"
      />
    </header>
  );
}
