import {
  FileIcon,
  ChevronRightIcon,
  InfoCircledIcon,
  HamburgerMenuIcon as Menu,
  DashboardIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { StyledLink } from "../ui/link";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useSidebar } from "./context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useMatchRoute } from "@tanstack/react-router";

const navigation = [
  {
    name: "Play",
    href: "/",
    icon: DashboardIcon,
  },
  {
    name: "Files",
    href: "/files",
    icon: FileTextIcon,
  },
] as const;

const MotionChevronsRight = motion(ChevronRightIcon);

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 max-w-screen-2xl items-center px-0">
          <MobileMenu />
        </div>
      </header>
    </>
  );
}

function DesktopSidebar() {
  const { isOpen, onToggleSidebar } = useSidebar();

  return (
    <motion.div
      className={cn(
        "hidden bg-french-porcelain transition-transform lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-20 lg:flex-col",
        isOpen && "lg:w-72",
      )}
    >
      <div className="flex flex-grow flex-col overflow-y-auto px-6 lg:border-r">
        <div className="flex h-16 w-full shrink-0 items-center justify-between">
          {isOpen && (
            <Link
              href="/"
              className="text-xl font-medium -tracking-wide"
            >
              QuackDB
            </Link>
          )}

          <Button
            onClick={() => onToggleSidebar(!isOpen)}
            variant="ghost"
            size="icon"
          >
            <MotionChevronsRight
              animate={{
                rotate: isOpen ? 180 : 0,
                x: isOpen ? 10 : -4, // aligns the icon with the button; also gives it a little bounce.
                transition: {
                  duration: 0.5,
                },
              }}
              className="size-7"
            />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col pt-4">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-3 space-y-3">
                {navigation.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                  />
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </motion.div>
  );
}

function NavItem({
  href,
  icon: Icon,

  name,
}: (typeof navigation)[number]) {
  const { isOpen } = useSidebar();
  const matchRoute = useMatchRoute();

  const match = matchRoute({ from: href });
  return (
    <li key={href}>
      <StyledLink
        key={href}
        to={href}
        variant="ghost"
        className={cn(
          match
            ? "bg-black text-white hover:bg-black hover:text-white"
            : "bg-transparent hover:bg-gray-200 hover:text-black",
          "w-full items-center justify-start text-left transition-colors duration-500 ease-in-out",
        )}
      >
        <span className="inline-flex items-center gap-x-2">
          <Icon className={cn("h-5 w-5 text-inherit", isOpen && "mr-3")} />
          {isOpen ? name : ""}
        </span>
      </StyledLink>
    </li>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full lg:hidden">
      <Sheet>
        <SheetTrigger
          className="ml-4"
          asChild
        >
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="size-24" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="pr-0"
        >
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => setOpen(!open)}
          >
            <Menu className="mr-2 h-4 w-4" />
            <span className="font-bold">BioDuck</span>
          </Button>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <MobileNavItem
                  key={item.href}
                  {...item}
                />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MobileNavItem({
  href,
  icon: Icon,

  name,
}: (typeof navigation)[number]) {
  const matchRoute = useMatchRoute();
  const { isOpen } = useSidebar();

  const match = matchRoute({ from: href });
  return (
    <StyledLink
      key={href}
      href={href}
      variant="ghost"
      className={cn(
        match
          ? "bg-black text-white hover:bg-black hover:text-white"
          : "bg-transparent hover:bg-gray-200 hover:text-black",
        "w-full items-center justify-start text-left transition-colors duration-500 ease-in-out",
      )}
    >
      <span className="inline-flex items-center gap-x-2">
        <Icon className={cn("h-5 w-5 text-inherit", isOpen && "mr-3")} />

        {isOpen ? name : ""}
      </span>
    </StyledLink>
  );
}
