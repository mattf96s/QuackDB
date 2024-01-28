import {
  forwardRef,
  type ReactNode,
  useCallback,
  useState,
  useTransition,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/inflect";
import { type TreeNode, type TreeNodeData } from "../../context/types";
import useDelete from "./hooks/useDelete";
import { useDownloadFile } from "./hooks/useDownload";
import useDuplicateWorker from "./hooks/useDuplicate";

type UseOnCopyProps = {
  timeout?: number;
  value: string;
};

const defaultTimeout = 2000;
/**
 * Copy file name to clipboard
 */
const useOnCopy = ({ timeout: timeoutRaw, value }: UseOnCopyProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeout = timeoutRaw ?? defaultTimeout;

  const onCopyHandler = useCallback(() => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    const timerId = setTimeout(() => {
      setIsCopied(false);
    }, timeout);
    return () => {
      clearTimeout(timerId);
    };
  }, [timeout, value]);

  useHotkeys("mod+c", onCopyHandler);

  return { isCopied, onCopyHandler };
};

type ContextWrapperProps = {
  children: ReactNode;
  node: TreeNode<TreeNodeData>;
};

function ContextMenuWrapper(props: ContextWrapperProps) {
  const { isCopied, onCopyHandler } = useOnCopy({
    value: props.node.name,
    timeout: 2000,
  });

  const { node } = props;
  const { name } = node;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuItem
          inset
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopyHandler();
          }}
          className="truncate hover:cursor-copy"
        >
          <ContextMenuLabel className="inline-flex items-center pl-0">
            <span
              className={cn(
                "max-w-48 shrink truncate",
                isCopied && "max-w-40 transition-transform",
              )}
            >
              {name}
            </span>
            {isCopied && (
              <span className={cn("shrink-0", isCopied && "text-green-600")}>
                <CheckCircledIcon className="ml-2 size-4" />
              </span>
            )}
          </ContextMenuLabel>
        </ContextMenuItem>

        <ContextMenuSeparator />
        <DownloadContextItem node={node} />
        <DuplicateContextItem node={node} />
        <DeleteContextItem node={node} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

type ContextItemProps = {
  node: TreeNode<TreeNodeData>;
};

function DuplicateContextItem(props: ContextItemProps) {
  const { onDuplicate, status } = useDuplicateWorker();

  useHotkeys(
    "mod+d",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDuplicate(props.node.data.handle);
    },
    [onDuplicate],
  );

  return (
    <ContextMenuItem
      disabled={status !== "idle"}
      onSelect={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDuplicate(props.node.data.handle);
      }}
      inset
    >
      Duplicate
      <ContextMenuShortcut>⌘D</ContextMenuShortcut>
    </ContextMenuItem>
  );
}

function DeleteContextItem(props: ContextItemProps) {
  const { onDelete } = useDelete();

  useHotkeys(
    "ctrl+d",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(props.node.name);
    },
    [onDelete],
  );

  return (
    <ContextMenuItem
      onSelect={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(props.node.name);
      }}
      inset
    >
      Delete
      <ContextMenuShortcut>ctrl + D</ContextMenuShortcut>
    </ContextMenuItem>
  );
}

/**
 * Download file
 * Includes hotkey support (cmd+s).
 * NB. We break the component out to avoid the hotkey being run on every render.
 */
function DownloadContextItem(props: ContextItemProps) {
  const { isLoading, onDownloadFileHandler } = useDownloadFile({
    node: props.node,
  });
  return (
    <ContextMenuItem
      inset
      disabled={isLoading}
      onSelect={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDownloadFileHandler();
      }}
    >
      Download
      <ContextMenuShortcut>⌘S</ContextMenuShortcut>
    </ContextMenuItem>
  );
}

type ContentsProps = {
  node: TreeNode<TreeNodeData>;
};

const FileListItem = forwardRef<HTMLButtonElement, ContentsProps>(
  function Contents(props, _ref) {
    const matchRoot = useMatchRoute();
    const { node } = props;
    const lastModified = new Date(node.data.lastModified);

    const isMatched = matchRoot({
      from: "/files/$fileId",
      params: {
        fileId: node.id,
      },
    });

    const [isPending, _startTransition] = useTransition();

    //const isSelected = state.selected?.id === node.id;
    const isActive = !!isMatched || isPending;

    const safeId = encodeURIComponent(node.id);

    const filesize = node.data.fileSize;
    const filesizeLabel = formatBytes(filesize);

    return (
      <Link
        key={node.id}
        className="flex h-[84px] max-h-[84px] w-full px-4 py-1 @container" // NB. Don't use flex gap in the container above as it messes up scrolling. Rather use padding on the button. Set the estimated size in the virtualizer to the same height. Use max-height to improve scroll performance.
        to={`/files/$fileId`}
        params={{ fileId: safeId }}
      >
        <ContextMenuWrapper
          key={node.id}
          node={node}
        >
          <div
            className={cn(
              "flex h-[76px] w-full flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm hover:bg-accent",
              isActive && "bg-muted",
              // target the open state of the context menu
              "date-[state=open]:ring-2 data-[state=open]:outline data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
            )}
          >
            <div className="min-w-0 max-w-full">
              <div className="flex max-w-full items-center gap-x-3">
                <p className="shrink-0 truncate text-sm font-semibold leading-6 text-gray-900">
                  {node.name}
                </p>
                <Badge
                  className={cn(
                    "hidden py-0 text-center text-xs font-light @sm:inline-block",
                    filesize === 0 && "bg-red-500 text-white hover:bg-red-600",
                  )}
                >
                  {filesizeLabel}
                </Badge>
              </div>
              <div
                className={cn(
                  "mt-1 flex items-center gap-x-2 text-xs leading-5 text-muted-foreground",
                  isActive && "text-foreground",
                )}
              >
                <p className="whitespace-nowrap">
                  Modified{" "}
                  <time dateTime={lastModified.toISOString()}>
                    {format(lastModified, "PPp")}
                  </time>
                </p>
                <svg
                  viewBox="0 0 2 2"
                  className="size-0.5 fill-current"
                >
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                  />
                </svg>
                <p className="truncate">{node.data.fileType}</p>
              </div>
            </div>
            {/* <div className="flex flex-none items-center gap-x-2">
                    <FileActions
                        name={node.name}
                        {...node.data}
                    />
                </div> */}
          </div>
        </ContextMenuWrapper>
      </Link>
    );
  },
);

export default FileListItem;

// function FileActions(props: TreeNodeData & { name: string }) {
// 	const [isCopied, setIsCopied] = useState(false)

// 	const onCopyHandler = useCallback(() => {
// 		navigator.clipboard.writeText(props.name)
// 		setIsCopied(true)
// 		const timeout = setTimeout(() => {
// 			setIsCopied(false)
// 		}, 2000)
// 		return () => {
// 			clearTimeout(timeout)
// 		}
// 	}, [props.name])

// 	const onDownloadHandler = useCallback(async () => {
// 		try {
// 			const save = await window.showSaveFilePicker({
// 				suggestedName: props.name,
// 			})
// 			const writable = await save.createWritable()

// 			const file = await props.handle.getFile()

// 			const blob = await file.arrayBuffer()
// 			await writable.write(blob)

// 			await writable.close()

// 			toast.success(`Successfully downloaded ${file.name}`)
// 		} catch (error) {
// 			// don't show error if user cancels
// 			if (error instanceof DOMException && error.name === 'AbortError') return
// 			toast.warning('Failed to download file', {
// 				description: error instanceof Error ? error.message : undefined,
// 			})
// 		}
// 	}, [props])

// 	return (
// 		<DropdownMenu>
// 			<DropdownMenuTrigger asChild>
// 				<Button
// 					size="icon"
// 					variant="outline"
// 				>
// 					<DotsVerticalIcon className="size-4" />
// 				</Button>
// 			</DropdownMenuTrigger>
// 			<DropdownMenuContent
// 				side="bottom"
// 				className="w-56"
// 			>
// 				<DropdownMenuLabel
// 					onClick={onCopyHandler}
// 					className="inline-flex items-center gap-2 hover:cursor-copy"
// 				>
// 					{props.name}
// 					{isCopied && <CopyCheck className="ml-2 size-4 text-green-900" />}
// 				</DropdownMenuLabel>
// 				<DropdownMenuSeparator />
// 				<DropdownMenuGroup>
// 					<DropdownMenuItem onClick={onDownloadHandler}>
// 						Download
// 						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
// 					</DropdownMenuItem>
// 					<DropdownMenuItem>
// 						Duplicate
// 						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
// 					</DropdownMenuItem>
// 					<DropdownMenuItem>
// 						Rename
// 						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
// 					</DropdownMenuItem>
// 				</DropdownMenuGroup>
// 				<DropdownMenuSeparator />

// 				<DropdownMenuSeparator />
// 				<DropdownMenuItem>
// 					Delete
// 					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
// 				</DropdownMenuItem>
// 			</DropdownMenuContent>
// 		</DropdownMenu>
// 	)
// }
