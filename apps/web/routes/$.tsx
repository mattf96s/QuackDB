import NavBar from "@/components/navbar";
import ModeToggle from "@/components/theme-toggle";
import { StyledLink } from "@/components/ui/link";
import { type MetaFunction } from "@vercel/remix";
import { motion } from "framer-motion";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export const meta: MetaFunction = () => {
  return [
    {
      name: "robots",
      content: "noindex",
    },
    {
      title: "404 | QuackDB",
    },
    {
      name: "description",
      content: "404 | QuackDB",
    },
    {
      name: "og:title",
      content: "404 | QuackDB",
    },
    {
      name: "og:description",
      content: "404 | QuackDB",
    },
  ];
};

// Trigger error boundary from loader
export function ErrorBoundary() {
  return (
    <div className="flex size-full flex-col">
      <NavBar>
        <ModeToggle />
      </NavBar>

      <div className="relative flex grow items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 text-center"
        >
          <p className="text-base font-semibold text-secondary-foreground">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-secondary-foreground">
            {`Sorry, we couldn't find the page you're looking for.`}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <StyledLink to="/">Go back home</StyledLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Component() {
  return null;
}
