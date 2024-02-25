import Icon from "@/components/icon";
import { cn } from "@/lib/utils";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useMatchRoute } from "@tanstack/react-router";
import type { icons } from "lucide-react";
import { StyledLink } from "../ui/link/link";

type NavItem = {
  name: string;
  href: string;
  icon: keyof typeof icons;
};

const navigation = [
  {
    name: "Editor",
    href: "/",
    icon: "Code2",
  },
] as const;

export default function Sidebar() {
  return <DesktopSidebar />;
}

function DesktopSidebar() {
  return (
    <div
      className={cn(
        "hidden border-r bg-french-porcelain dark:bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-16 lg:overflow-y-auto lg:pb-4",
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
            {/* github link */}
            <li>
              <ul className="flex w-full flex-col items-center justify-center space-y-6">
                <a
                  href={`https://github.com/mattf96s/quackdb`}
                  target="_blank"
                  rel="noreferrer"
                  className="items-center justify-center px-3 text-center transition-colors duration-500 ease-in-out"
                >
                  <span className="inline-flex items-center">
                    <GitHubLogoIcon className={cn("size-6 text-inherit")} />
                  </span>
                </a>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

function NavItem(props: (typeof navigation)[number]) {
  const { href, icon: iconName } = props;
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
            ? "rounded-lg bg-foreground text-background hover:bg-background hover:text-foreground"
            : "bg-transparent hover:bg-gray-200 hover:text-black",
          "items-center justify-center px-3 text-center transition-colors duration-500 ease-in-out",
        )}
      >
        <span className="inline-flex items-center">
          <Icon
            name={iconName}
            className={cn("size-5 text-inherit")}
          />
        </span>
      </StyledLink>
    </li>
  );
}
