import { type MetaFunction } from "@remix-run/node";
import NavBar from "~/components/navbar";
import ModeToggle from "~/components/theme-toggle";

export const meta: MetaFunction = () => [
  {
    title: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  { name: "theme-color", content: "#0a0a0a" },
  {
    name: "description",
    content:
      "QuackDB is an open-source in-browser DuckDB SQL editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
  },
  {
    name: "og:title",
    content: "QuackDB | Open-source in-browser DuckDB SQL editor",
  },
  {
    name: "og:description",
    content:
      "QuackDB is an open-source in-browser DuckDB SQL editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.",
  },
];

export default function Component() {
  return (
    <div className="flex size-full flex-col">
      <NavBar>
        <ModeToggle />
      </NavBar>
      <div className="relative flex grow items-start justify-center pt-20">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <div className="mx-auto max-w-prose space-y-2">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            QuackDB
          </h1>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Open-source in-browser DuckDB SQL editor
          </h2>
          <section className="w-full max-w-[80ch]"></section>
        </div>
      </div>
    </div>
  );
}
