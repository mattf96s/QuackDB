export type File = {
	type: "file";
	name: string;
};

export type Folder = {
	type: "folder";
	name: string;
	contents: TreeItem[];
};

export type TreeItem = File | Folder;

export type Tree = TreeItem[];

export async function buildStructuredTreeFromHandle(
	dirHandle: FileSystemDirectoryHandle,
): Promise<Tree> {
	const tree: Tree = [];

	for await (const [name, handle] of dirHandle.entries()) {
		if (handle.kind === "file") {
			tree.push({
				type: "file",
				name,
			});
		} else if (handle.kind === "directory") {
			const subTree = await buildStructuredTreeFromHandle(handle);
			tree.push({
				type: "folder",
				name,
				contents: subTree,
			});
		}
	}

	return tree;
}
