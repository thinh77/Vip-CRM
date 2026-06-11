import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useLocation } from "react-router-dom";

export function useAppNavigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    setIsDrawerOpen(false);
    if (previousPathnameRef.current === location.pathname) return;

    previousPathnameRef.current = location.pathname;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion === true ? "auto" : "smooth"
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, shouldReduceMotion]);

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
    closeDrawer,
    isDrawerOpen,
    openDrawer
  };
}
