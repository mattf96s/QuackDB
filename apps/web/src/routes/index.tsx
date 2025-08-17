import { createFileRoute } from "@tanstack/react-router";
import Page from "./_index/route";

export const Route = createFileRoute("/")({
	component: Page,
});
