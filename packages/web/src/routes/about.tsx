import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, LockIcon, LucideBird } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="bg-white py-12 sm:py-24 md:py-32">
      <main className="relative isolate mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-2xl font-semibold leading-7 text-indigo-600">
            QuackDB
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            An online DuckDB playground and file viewer. WIP.
          </p>
          <p className="text-md mt-6 leading-8 text-gray-600">
            Made by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/mattf96s"
            >
              Matt Fainman
            </a>
            .
          </p>
          <div>
            <Button className="mt-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/mattf96s/quackdb"
              >
                View code
                <GitHubLogoIcon
                  className="ml-2 inline-block size-5"
                  aria-hidden="true"
                />
              </a>
            </Button>
          </div>
        </div>

        <Features />

        {/* Swirling background */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </main>
    </div>
  );
}

const featureItems = [
  {
    name: "Privacy first",
    description:
      "Run queries on your own machine. No data is sent to the server.",
    icon: LockIcon,
  },
  {
    name: "Data Viewer",
    description: "View your data in a table or chart.",
    icon: BarChart3,
  },
  {
    name: "DuckDB",
    description: "Powered by DuckDB.",
    icon: LucideBird,
  },
];

function Features() {
  return (
    <dl className="mx-auto mt-6 flex max-w-xs flex-col justify-center gap-8 py-12 md:max-w-sm">
      {featureItems.map((feature) => (
        <div
          key={feature.name}
          className="flex max-w-xs flex-col items-center justify-center text-center md:max-w-sm"
        >
          <dt className="flex items-center justify-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
            <feature.icon
              className="h-5 w-5 flex-none text-indigo-600"
              aria-hidden="true"
            />
            {feature.name}
          </dt>
          <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
            <p className="flex-auto">{feature.description}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
