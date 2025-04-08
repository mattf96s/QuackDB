"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 text-center pb-20"
    >
      <p className="text-base font-semibold text-secondary-foreground">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-6 text-base leading-7 text-secondary-foreground">
        {`Sorry, we couldn't find the page you're looking for.`}
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </motion.div>
  );
}
