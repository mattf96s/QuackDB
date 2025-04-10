"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSqlFormatter } from "@/hooks/use-sql-formatter";
import { useCallback, useState } from "react";

export function CodeEditor() {
  const [input, setInput] = useState("SELCT * FROM users;");

  const onFormat = useCallback((formatted: string) => {
    console.log("Formatted SQL: ", formatted);
    setInput(formatted);
  }, []);

  const { formatSql } = useSqlFormatter(onFormat);

  const onSave = () => {
    console.log("onSave", input);
    formatSql(input);
  };

  return (
    <div>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value as string)}
        className="w-full h-96"
      />
      <div className="flex justify-end mt-2">
        <Button type="button" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
