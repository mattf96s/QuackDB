import { useEffect, useRef } from "react";
import { useMatchRoute, useRouterState } from "@tanstack/react-router";
import { Code2Icon, HistoryIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { StyledLink } from "../ui/link/link";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useSidebar } from "./hooks/useSidebar";

const navigation = [
  {
    name: "Editor",
    href: "/",
    icon: Code2Icon,
  },
  {
    name: "Files",
    href: "/files",
    icon: HistoryIcon,
  },
  // {
  //   name: "About",
  //   href: "/about",
  //   icon: InfoCircledIcon,
  // },
] as const;

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
  return (
    <div
      className={cn(
        "hidden border-r bg-french-porcelain dark:bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-16 lg:overflow-y-auto lg:pb-4",
        // "light:bg-french-porcelain hidden w-20 transition-transform dark:bg-background lg:fixed lg:inset-y-0 lg:flex lg:flex-col",
      )}
    >
      <div className="flex h-full grow flex-col overflow-y-auto px-6">
        <nav className="flex flex-1 flex-col pt-4">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="flex w-full flex-col items-center justify-center space-y-6">
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
    </div>
  );
}

function NavItem(props: (typeof navigation)[number]) {
  const { href, icon: Icon } = props;
  const matchRoute = useMatchRoute();

  const match = matchRoute({ from: href, fuzzy: true });
  return (
    <li key={href}>
      <StyledLink
        params={{}}
        to={href}
        variant="ghost"
        className={cn(
          match
            ? "rounded-lg bg-black text-white hover:bg-black hover:text-white"
            : "bg-transparent hover:bg-gray-200 hover:text-black",
          "items-center justify-center px-3 text-center transition-colors duration-500 ease-in-out",
        )}
      >
        <span className="inline-flex items-center">
          <Icon className={cn("size-5 text-inherit")} />
        </span>
      </StyledLink>
    </li>
  );
}

function MobileMenu() {
  const { isOpen, onToggleSidebar } = useSidebar();
  const initialPath = useRef(
    useRouterState({ select: (s) => s.location.pathname }),
  );

  const { pathname } = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (initialPath.current !== pathname) {
      initialPath.current = pathname;
      onToggleSidebar(false);
    }
  }, [onToggleSidebar, pathname]);

  return (
    <div className="w-full lg:hidden">
      <Sheet
        open={isOpen}
        onOpenChange={onToggleSidebar}
      >
        <div className="flex w-full items-center justify-between">
          <SheetTrigger
            className="ml-4"
            asChild
          >
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <MenuIcon className="size-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <div
            className="hidden md:block"
            id="mobile-header-portal"
          />
        </div>
        <SheetContent
          side="left"
          className="w-[350px]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>QuackDB</SheetTitle>
            <SheetDescription>
              {`Local-first DuckDB playground.`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col py-4">
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <MobileNavItem
                    key={item.href}
                    {...item}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
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

  const match = matchRoute({ from: href, fuzzy: true });
  return (
    <StyledLink
      params={{}}
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
        <Icon className={cn("size-5 text-inherit", isOpen && "mr-3")} />
        {isOpen ? name : ""}
      </span>
    </StyledLink>
  );
}
