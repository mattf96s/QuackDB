// Inspiration: https://github.com/kiliman/remix-vite-template/blob/main/app/routes/error.tsx
import { Link } from "@remix-run/react";
import { type MetaFunction } from "@vercel/remix";
import ModeToggle from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import * as Card from "~/components/ui/card";

export const meta: MetaFunction = () => {
  // no index
  return [
    {
      name: "robots",
      content: "noindex",
    },
    {
      title: "Error | QuackDB",
    },
    {
      name: "description",
      content: "QuackDB error page for testing",
    },
  ];
};

export default function Component() {
  const handleClick = () => {
    setTimeout(() => alert("View console for error"), 1);
    throw new Error("test client error");
  };

  return (
    <div className="flex size-full flex-1 bg-background">
      <div className="container mx-auto flex flex-col gap-6 p-4">
        <div className="flex w-full items-center justify-between">
          <Link
            to="/"
            className="underline decoration-dotted"
          >
            Return Home
          </Link>
          <div>
            <ModeToggle />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Error page for testing</h1>
        <Card.Card className="bg-secondary">
          <Card.CardHeader>
            <Card.CardTitle>Throw an error</Card.CardTitle>
            <Card.CardDescription>
              This button will throw an error
            </Card.CardDescription>
          </Card.CardHeader>
          <Card.CardContent>
            <div className="mt-2 flex gap-2">
              <Button
                variant="destructive"
                onClick={handleClick}
              >
                Throw Client Error
              </Button>
              <a
                href="?type=throw"
                className="rounded bg-red-500 px-2 py-1 text-white"
              >
                Throw Server Document Error
              </a>
              <Link
                to="?type=throw"
                className="rounded bg-red-500 px-2 py-1 text-white"
              >
                Throw Server Data Error
              </Link>
            </div>
          </Card.CardContent>
        </Card.Card>
      </div>
    </div>
  );
}
