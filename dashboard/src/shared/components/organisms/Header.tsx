import { Settings, Menu, User, LogOut } from "lucide-react";
import { Button } from "../atoms/button";
import { ThemeToggle } from "../molecules/ThemeToggle";
import { useLogout, useVerifyUser } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "../molecules/ConfirmationModal";
import React from "react";

interface HeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  // Get verified user data
  const { data: user } = useVerifyUser();
  const logout = useLogout();

  const username = user?.name || user?.email?.split("@")[0] || "Admin";
  const email = user?.email || "user@example.com";
  return (
    <header
      className={`top-7 z-40 flex h-14 sm:h-16 px-3 sm:px-4 lg:px-6 p-10 rounded-2xl items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm ${className || ""}`}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* User Info */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0 px-2 gap-0.5 sm:gap-2">
        <div className="truncate">
          <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white truncate">
            {username}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="hidden xs:flex text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="hidden sm:block w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1 sm:mx-2"></div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10"
          aria-label="User profile"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
        </Button>
      </div>
      <div className="flex items-center gap-1">
        {/* logout button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLogoutModalOpen(true)}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10"
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
