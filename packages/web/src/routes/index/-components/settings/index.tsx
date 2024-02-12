import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useDB } from "@/context/db/useDB";

interface Config {
  cache: boolean;
}

export default function Settings() {
  const { db } = useDB();
  const [config, setConfig] = useState<Config | null>({
    cache: false,
  });

  useEffect(() => {
    const config = db?.getConfig();
    console.log("config", config);
    setConfig({
      cache: config?.shouldCache ?? false,
    });
  }, [db]);

  const onToggleCache = (s: boolean) => {
    console.log("news", s);
    db?.toggleCache(s);
  };

  const isCacheEnabled = config?.cache;
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
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
