import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../atoms/button";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4 text-white" />;
      case "system":
        return <Monitor className="w-4 h-4 text-primary" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Current theme: ${theme}`}>
      {getIcon()}
    </Button>
  );
}
