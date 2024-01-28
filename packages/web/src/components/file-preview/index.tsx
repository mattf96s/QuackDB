import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  BarChart2Icon,
  BookCopy,
  DownloadIcon,
  FileJson2,
  MoreVertical,
  TableIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatBytes } from "@/lib/utils/inflect";
import JSONPreview from "./json-preview";
import TablePreview from "./table-preview";

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

  const onDownload = async () => {
    return null;
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
                <BookCopy className="h-4 w-4" />
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
                onClick={onDownload}
              >
                <DownloadIcon className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
        </div>

        <Separator
          orientation="vertical"
          className="mx-2 h-6"
        />

        <div>
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
        </div>
        <div className="flex flex-grow justify-end">
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
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {file ? (
        <div className="flex h-full max-h-full flex-col overflow-y-auto">
          <div className="p-6">
            <Tabs
              defaultValue="table"
              className="flex h-full w-full flex-col gap-8"
            >
              <div className="flex w-full justify-between">
                <div className="flex w-full flex-col gap-1">
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-xs">
                    <span>{formatBytes(file.size)}</span>{" "}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {format(new Date(file.lastModified), "PPpp")}
                  </span>
                </div>
                <div className="flex w-full justify-end">
                  <TabsList>
                    <TabsTrigger value="table">
                      <TableIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="chart">
                      <BarChart2Icon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="json">
                      <FileJson2 className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent
                value="table"
                className="relative h-full"
              >
                <TablePreview handle={props.fileHandle} />
              </TabsContent>
              <TabsContent value="chart">
                Change your password here.
              </TabsContent>
              <TabsContent value="json">
                <JSONPreview handle={props.fileHandle} />
              </TabsContent>
            </Tabs>
          </div>
          <Separator className="mt-auto" />
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
