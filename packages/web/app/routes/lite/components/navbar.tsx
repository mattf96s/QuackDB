import { Link } from "@remix-run/react";
import { Loader2, Terminal } from "lucide-react";
import { Suspense } from "react";
import ModeToggle from "~/components/theme-toggle";

export default function NavBar() {
  return (
    <div className="hidden h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-2 md:flex">
      <div className="flex h-full items-center justify-evenly gap-3">
        <HomeIcon />
        <h1 className="ml-1 text-xl font-semibold">QuackDB</h1>
        <Terminal
          name="terminal"
          className="size-5"
        />
      </div>
      <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
        <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
          <p>Query</p>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <Link
      to="/"
      className="relative size-9 overflow-hidden rounded-full border bg-foreground dark:bg-white"
    >
      <Suspense
        fallback={
          <span className="m-auto size-9 rounded-full">
            <Loader2 className="size-5 animate-spin" />
          </span>
        }
      >
        <img
          src="logo.webp"
          className="relative -top-[0.5px] size-9 rounded-full bg-white object-cover"
          alt="QuackDB logo"
        />
      </Suspense>
    </Link>
  );
}
