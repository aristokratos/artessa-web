"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface Props {
  children: React.ReactNode;
  /** Index within a group, for staggered entrances. */
  index?: number;
  className?: string;
}

/**
 * Entrance for grid and section content (CAT-10, PRD §10.2 surface 2).
 * Under reduced motion it renders the children plainly — no fade, no rise.
 */
export function Reveal({ children, index = 0, className }: Props) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
