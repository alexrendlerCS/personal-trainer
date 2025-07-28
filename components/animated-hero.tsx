"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedHeroProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedHero({ children, delay = 0 }: AnimatedHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}
