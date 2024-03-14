import { type LinksFunction } from "@remix-run/node";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ClientOnly } from "remix-utils/client-only";
import * as Card from "~/components/ui/card";
import styles from "~/styles/dockview.css?url";
import NavBar from "./components/navbar";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

/**
 * There is a bug in Safari which means FileSystemHandles are not structure cloned correctly.
 * This is route is a limited playground as a fallback.
 */
export default function Component() {
  return (
    <div className="flex size-full flex-col">
      <Suspense fallback={<PlaygroundSkeleton />}>
        {/* Could just be an SPA if we wanted. */}
        <ClientOnly fallback={<PlaygroundSkeleton />}>
          {() => (
            <>
              <NavBar />
              <Suspense fallback={<PlaygroundSkeleton />}>
                <ComingSoon />
                {/* #TODO */}
                {/* <Playground /> */}
              </Suspense>
            </>
          )}
        </ClientOnly>
      </Suspense>
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <Loader2Icon className="size-6 animate-spin" />
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="p-10">
      <Card.Card>
        <Card.CardHeader>
          <Card.CardTitle>Coming Soon</Card.CardTitle>
        </Card.CardHeader>
        <Card.CardContent>
          <p>
            We are working on a Safari playground experience. Please check back
            later.
          </p>
        </Card.CardContent>
      </Card.Card>
    </div>
  );
}
