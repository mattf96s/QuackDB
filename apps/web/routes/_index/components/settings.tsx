import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useDB } from "@/context/db/useDB";
import { useEditorSettings } from "@/context/editor-settings/useEditor";
import { useSession } from "@/context/session/useSession";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Settings(props: { isOpen: boolean }) {
  const { isOpen } = props;
  const { db } = useDB();
  const [isCacheEnabled, setIsCacheEnabled] = useState(false);

  // #TODO: investigate if reactsyncexternal is appropriate here.
  useEffect(() => {
    if (isOpen) {
      const config = db?.getConfig();
      setIsCacheEnabled(config?.shouldCache ?? false);
    }
  }, [isOpen, db]);

  const onToggleCache = (s: boolean) => {
    db?.toggleCache(s);
    setIsCacheEnabled(s);
  };

  return (
    <>
      <div className="col-span-full flex flex-col space-y-1.5 py-2">
        <p className="font-semibold leading-none tracking-tight">Settings</p>
        <p className="text-sm text-muted-foreground">
          Customize the playground.
        </p>
      </div>
      <div className="grid gap-6 pt-4">
        {/* whether to use cached responses */}

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="cache" className="flex flex-col space-y-1">
            <span>Cache</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Enable caching of query results to speed up subsequent queries.
            </span>
          </Label>
          <Switch
            checked={isCacheEnabled}
            onCheckedChange={onToggleCache}
            id="cache"
          />
        </div>
        {/* format */}
        <div className="flex items-center justify-between space-x-2">
          <FormatOption />
        </div>
        <Separator />
        <ClearSession />
      </div>
    </>
  );
}

function FormatOption() {
  const { shouldFormat, toggleShouldFormat } = useEditorSettings();
  return (
    <>
      <Label htmlFor="format" className="flex flex-col space-y-1">
        <span>Format</span>
        <span className="font-normal leading-snug text-muted-foreground">
          Format SQL queries on save.
        </span>
      </Label>
      <Switch
        checked={shouldFormat}
        onCheckedChange={(v) => toggleShouldFormat(v)}
        id="format"
      />
    </>
  );
}

function ClearSession() {
  const { onBurstCache } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Clear the session cache (files, datasets, query results)
   */
  const onBurstCacheHandler = useCallback(async () => {
    setIsLoading(true);

    await onBurstCache();

    setIsLoading(false);
  }, [onBurstCache]);

  return (
    <AlertDialog>
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="cache" className="flex flex-col space-y-1">
          <span className="inline-flex items-center gap-1">Clear session</span>
          <span className="font-normal leading-snug text-muted-foreground">
            Remove files, datasets, and query results. This action is
            irreversible.
          </span>
        </Label>

        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to clear your session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              files, datasets, and query results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={onBurstCacheHandler}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
