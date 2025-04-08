"use client";

import { Moon, Sun } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const MotionSun = motion.create(Sun);
const MotionMoon = motion.create(Moon);
const MotionButton = motion.create(Button);

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // see https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch

  const isDark = theme === "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MotionButton
      initial={false}
      variant="outline"
      size="icon"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <MotionMoon
            initial={{
              rotate: 90,
              opacity: 0,
            }}
            animate={{
              rotate: 0,
              opacity: 100,
              transition: {
                type: "spring",
              },
            }}
            key="moon"
            style={{
              position: "absolute",
              width: "1.2rem",
              height: "1.2rem",
            }}
          />
        ) : (
          <MotionSun
            initial={{
              rotate: -90,
              opacity: 0,
            }}
            animate={{
              rotate: 0,
              opacity: 100,
              transition: {
                type: "spring",
              },
            }}
            style={{
              position: "absolute",
              width: "1.2rem",
              height: "1.2rem",
            }}
            key="sun"
          />
        )}
      </AnimatePresence>

      <span className="sr-only">Toggle theme</span>
    </MotionButton>
  );
}
