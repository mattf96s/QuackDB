import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useDB } from "@/context/db/useDB";

export default function Settings() {
  const { db } = useDB();
  const [isCacheEnabled, setIsCacheEnabled] = useState(true);

  useEffect(() => {
    if (!db) return;
    const config = db?.getConfig();
    setIsCacheEnabled(config?.shouldCache ?? false);
  }, [db]);

  const onToggleCache = (s: boolean) => {
    db?.toggleCache(s);
    setIsCacheEnabled(s);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <Settings2 size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Seetings</h4>
            <p className="text-sm text-muted-foreground">
              Customize the playground.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-baseline gap-4">
              <Label htmlFor="width">Cache</Label>
              <div className="col-span-2 h-8">
                <Switch
                  checked={isCacheEnabled}
                  onCheckedChange={onToggleCache}
                  id="cache"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
