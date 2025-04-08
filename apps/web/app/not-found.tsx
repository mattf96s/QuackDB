import NavBar from "@/components/navbar";
import NotFound from "@/components/not-found";
import ModeToggle from "@/components/theme-toggle";
import type { Metadata } from "next";
import { Suspense } from "react";

export const meta: Metadata = {
  title: "404 | QuackDB",
  description: "Page not found",
  robots: {
    index: false,
  },
};

// Trigger error boundary from loader
export default function Page() {
  return (
    <div className="flex flex-1 size-full flex-col">
      <NavBar>
        <ModeToggle />
      </NavBar>

      <div className="relative flex grow items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <Suspense>
          <NotFound />
        </Suspense>
      </div>
    </div>
  );
}
