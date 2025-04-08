/* eslint-disable @next/next/no-img-element */
import { Terminal } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function NavBar(props: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-4">
      <div className="flex h-full items-center justify-evenly gap-3">
        <HomeIcon />
        <h1 className="ml-1 text-xl font-semibold">QuackDB</h1>
        <Terminal name="terminal" className="size-5" />
      </div>
      <div className="ml-auto flex w-full items-center justify-end space-x-2 pr-2">
        <div className="ml-auto flex w-full items-center justify-end space-x-2">
          <Suspense>{props.children}</Suspense>
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="relative size-9 overflow-hidden rounded-full border"
    >
      <img
        src="logo-tiny.webp"
        className="relative -top-[0.5px] size-9 rounded-full bg-white object-cover"
        alt="QuackDB logo"
      />
    </Link>
  );
}
