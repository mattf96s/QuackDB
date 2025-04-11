/// <reference lib="webworker" />

import { buildStructuredTreeFromHandle } from "@/types/tree";

// https://github.com/vercel/turborepo/issues/3643#issuecomment-2689349937
self.onmessage = async (event: MessageEvent) => {
	self.postMessage({
		type: "SET_LOADING",
		loading: true,
	});

	const { id } = event.data;

	try {
		const root = await navigator.storage.getDirectory();
		const directory = await root.getDirectoryHandle(id, { create: true });

		// list all files in the directory
		const tree = await buildStructuredTreeFromHandle(directory);

		self.postMessage({
			type: "SET_CONTENTS",
			tree,
		});
	} catch (error) {
		console.error("Error in worker: ", error);
		self.postMessage({
			type: "SET_ERROR",
			error: error instanceof Error ? error.message : String(error),
		});
		return;
	}
};
