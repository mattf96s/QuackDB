import { Moon, Sun } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

const MotionSun = motion(Sun);
const MotionMoon = motion(Moon);
const MotionButton = motion(Button);

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <MotionButton
      initial={false}
      variant="outline"
      size="icon"
      onClick={() => setTheme((s) => (s === "dark" ? "light" : "dark"))}
    >
      <AnimatePresence mode="wait">
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
            className="absolute h-[1.2rem] w-[1.2rem]"
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
            key="sun"
            className="absolute h-[1.2rem] w-[1.2rem]"
          />
        )}
      </AnimatePresence>

      <span className="sr-only">Toggle theme</span>
    </MotionButton>
  );
}
