/// <reference lib="webworker" />

// https://github.com/vercel/turborepo/issues/3643#issuecomment-2689349937
self.onmessage = async (event: MessageEvent) => {
	const { contents, id } = event.data;

	console.log("save: ", {
		contents,
		id,
	});

	postMessage({
		type: "SET_LOADING",
		loading: true,
	});

	let draftHandle: FileSystemFileHandle | undefined;

	try {
		const directory = await navigator.storage.getDirectory();

		draftHandle = await directory.getFileHandle(`${id}`, {
			create: true,
		});

		const syncHandle = await draftHandle.createSyncAccessHandle();

		const textEncoder = new TextEncoder();

		const buffer = textEncoder.encode(contents);

		syncHandle.truncate(0); // clear the file

		syncHandle.write(buffer, {
			at: 0,
		});

		syncHandle.flush();
		syncHandle.close();

		postMessage({
			type: "SAVED_FILE_COMPLETE",
		});
	} catch (error) {
		console.error(`Error saving file: ${id}: `, error);

		postMessage({
			type: "SAVE_ERROR",
			error: error instanceof Error ? error.message : String(error),
		});
	}
};
