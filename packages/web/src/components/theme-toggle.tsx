"use client";

import React from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
