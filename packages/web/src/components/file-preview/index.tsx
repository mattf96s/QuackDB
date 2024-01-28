import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArchiveX, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatBytes } from "@/lib/utils/inflect";

interface FilePreviewProps {
  fileHandle: FileSystemFileHandle;
}

export default function FilePreview(props: FilePreviewProps) {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getFile = async () => {
      const file = await props.fileHandle.getFile();
      setFile(file);
    };
    getFile();
  }, [props.fileHandle]);

  const onDelete = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(props.fileHandle.name);
      toast.success("File deleted", {
        description: "Your file has been deleted successfully",
      });
      navigate({ to: "/files" });
    } catch (e) {
      toast.error("Error deleting file", {
        description: "An error occurred while deleting your file",
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log("onDuplicate");
                }}
              >
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Duplicate</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator
            orientation="vertical"
            className="mx-1 h-6"
          />
        </div>

        <Separator
          orientation="vertical"
          className="mx-2 h-6"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!file}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {file ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={file.name} />
                <AvatarFallback>
                  {file.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{file.name}</div>
                <div className="line-clamp-1 text-xs">
                  {formatBytes(file.size)}
                </div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Type:</span> {file.type}
                </div>
              </div>
            </div>
            {file.lastModified && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(file.lastModified), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            <pre>{JSON.stringify(file, null, 2)}</pre>
          </div>
          <Separator className="mt-auto" />
          {/* <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch
                      id="mute"
                      aria-label="Mute thread"
                    />{" "}
                    Mute this thread
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div> */}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
