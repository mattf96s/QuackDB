import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

const onLoadSources = async () => {
  const root = await navigator.storage.getDirectory();
  const files: FileSystemHandle[] = [];

  for await (const entry of root.values()) {
    if (entry.kind === "file") {
      files.push(entry);
    }
  }

  return files;
};

export default function Sources() {
  const [sources, setSources] = useState<FileSystemHandle[]>([]);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      toast.error("Please select a file to upload");
      return;
    }

    // convert to file handle
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(file.name, { create: true });

    // write file
    const writable = await handle.createWritable();
    await writable.write(file);
    await writable.close();

    onLoadSources()
      .then(setSources)
      .catch((e) => {
        toast.error(e.message);
      });
  };

  useEffect(() => {
    onLoadSources()
      .then(setSources)
      .catch((e) => {
        toast.error(e.message);
      });
  }, []);
  return (
    <>
      <Separator />

      <div>
        <ul className="space-y-2">
          {sources.map((source) => {
            return (
              <li
                key={source.name}
                className="flex w-full items-center justify-between space-x-2"
              >
                <span className="text-sm font-semibold">{source.name}</span>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={async () => {
                    const root = await navigator.storage.getDirectory();
                    await root.removeEntry(source.name);
                    setSources((prev) =>
                      prev.filter((s) => s.name !== source.name),
                    );
                  }}
                >
                  <Trash size={16} />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <form
          method="post"
          action="/"
          onSubmit={onSubmit}
        >
          <div className="grid grid-cols-2 items-center">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".csv, .json, .xml, .yaml, .yml, .sql, .xlsx, .xls, .tsv, .txt, .parquet, .avro, .orc"
            />
          </div>

          <Button type="submit">Upload</Button>
        </form>
      </div>
    </>
  );
}
