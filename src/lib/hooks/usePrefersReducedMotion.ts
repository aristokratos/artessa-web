"use client";

import { useEffect, useState } from "react";

/**
 * Tier R of the performance model (PRD §10.4) — it overrides every device tier.
 *
 * CSS in globals.css already neutralises transitions and animations, but CSS
 * cannot stop a requestAnimationFrame loop or a scroll-driven camera. Anything
 * that runs its own loop has to check this and refuse to start.
 */
export function usePrefersReducedMotion(): boolean {
  // Defaults to true so the first paint is the calm one: if the preference is
  // set, the user never sees a frame of motion before the check resolves.
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
