import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-3 right-4 md:top-6 md:right-8 z-50 rounded-full w-10 h-10 md:w-11 md:h-11 bg-card/80 backdrop-blur-md border-border shadow-sm hover:shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 active:scale-95 group"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] md:h-[1.4rem] md:w-[1.4rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:text-amber-600" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] md:h-[1.4rem] md:w-[1.4rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-primary" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}