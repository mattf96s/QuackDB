import { createFileRoute } from "@tanstack/react-router";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ecosystemData } from "./-data";

export const Route = createFileRoute("/ecosystem")({
  component: EcoSystem,
});

function EcoSystem() {
  return (
    <div className="flex h-full flex-col">
      <div className="container flex max-w-none flex-row items-center justify-between space-y-2 py-4 sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">Ecosystem</h2>
      </div>
      <Separator />
      <div className="container max-w-none">
        <ScrollArea>
          <Features />
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
}

function Features() {
  return (
    <div className="py-4">
      {Object.entries(ecosystemData).map(([key, projects]) => {
        // capitalize the first letter of the key
        const sectionTitle = key.charAt(0).toUpperCase() + key.slice(1);
        return (
          <ul
            key={key}
            role="list"
            className="py-4"
          >
            <div>
              <h3 className="text-lg font-semibold">{sectionTitle}</h3>
            </div>
            {projects.map((project) => {
              const { name, description, href } = project;
              return (
                <li
                  key={name}
                  className="flex gap-x-4 py-5"
                >
                  <div className="flex-auto">
                    <div className="flex items-baseline justify-between gap-x-4">
                      <a
                        href={href}
                        target="_blank"
                        className="text-sm font-semibold leading-6 text-gray-900"
                        rel="noreferrer"
                      >
                        {name}
                      </a>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}
