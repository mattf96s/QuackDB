import { CodeEditor } from "@/app/(app)/test/_components/code-editor";
import { Suspense } from "react";

export default function Test() {
  return (
    <div className="p-10">
      <Suspense>
        <CodeEditor />
      </Suspense>
    </div>
  );
}
