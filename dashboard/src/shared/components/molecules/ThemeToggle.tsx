import { Moon, Sun } from "lucide-react";
import { Button } from "../atoms/button";
import { useTheme } from "../../hooks/useTheme";
const iconButtonClass =
  "h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground hover:bg-accent";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={iconButtonClass}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </Button>
  );
}
