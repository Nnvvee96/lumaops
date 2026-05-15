"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

const STORAGE_KEY = "lumaops-theme";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable in private mode; theme still
      // works for the active session.
    }
  }

  // Render the same DOM on server + first client paint to keep
  // hydration stable; the icon swap happens after mount.
  const Icon = mounted && theme === "light" ? Sun : Moon;
  const label = mounted && theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={toggle}
      className="text-ink-mid hover:text-ink"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
