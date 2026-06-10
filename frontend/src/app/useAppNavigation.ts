import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export type AppView = "events" | "customers" | "import";

export function useAppNavigation() {
  const [activeView, setActiveView] = useState<AppView>("events");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const selectView = useCallback((view: AppView) => {
    setIsDrawerOpen(false);
    if (view === activeView) return;

    setActiveView(view);
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion === true ? "auto" : "smooth"
      });
    });
  }, [activeView, shouldReduceMotion]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isDrawerOpen]);

  return {
    activeView,
    closeDrawer,
    isDrawerOpen,
    openDrawer,
    selectView
  };
}
