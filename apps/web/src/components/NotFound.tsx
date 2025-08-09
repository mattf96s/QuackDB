import { Link } from "@tanstack/react-router";
import { Suspense } from "react";

export default function NotFound() {
	return (
		<div className="mx-auto w-full max-w-sm py-24 sm:py-32 md:max-w-xl xl:max-w-6xl">
			<div className="relative z-10 max-w-sm md:max-w-lg">
				<p className="font-semibold text-accent-foreground text-base leading-8">
					404
				</p>
				<h1 className="mt-4 font-bold text-3xl text-primary tracking-tight sm:text-5xl">
					Page not found
				</h1>
				<p className="mt-6 text-base text-foreground leading-7">
					{`Sorry, we couldn't find the page you're looking for.`}
				</p>
				<div className="mt-10">
					<Link
						to="/"
						className="font-semibold text-secondary-foreground text-sm leading-7"
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
