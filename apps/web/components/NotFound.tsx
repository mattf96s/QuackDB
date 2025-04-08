/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Suspense } from "react";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-sm py-24 sm:py-32 md:max-w-xl xl:max-w-6xl">
      <div className="relative z-10 max-w-sm md:max-w-lg">
        <p className="text-base font-semibold leading-8 text-accent-foreground">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-foreground">
          {`Sorry, we couldn't find the page you're looking for.`}
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-semibold leading-7 text-secondary-foreground"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
        </div>
      </div>
      <div>
        <Suspense>
          <img
            src="spaceman.webp"
            alt=""
            className="absolute inset-0 size-full object-contain"
          />
        </Suspense>
      </div>
    </div>
  );
}
