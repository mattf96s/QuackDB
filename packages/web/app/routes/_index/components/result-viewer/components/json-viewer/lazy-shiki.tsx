import { Await } from "@remix-run/react";
import DOMPurify from "dompurify";
import { Suspense } from "react";
import { type HighlighterCore } from "shiki/core";
import { getHighlighter } from "~/components/code-highlighter";

let shiki: HighlighterCore | undefined;

const createHighlighter = async (json: string, isDark: boolean) => {
  try {
    if (!shiki) shiki = await getHighlighter();

    const html = shiki.codeToHtml(json, {
      lang: "json",
      theme: isDark ? "vitesse-dark" : "github-light",
    });
    if (!html) throw new Error("Failed to create highlighter");
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error("Failed to create highlighter: ", e);
    return "";
  }
};

export default function Highlighter(props: {
  json: string;
  isDark: boolean;
}): JSX.Element {
  const html = createHighlighter(props.json, props.isDark);

  return (
    <Suspense>
      <Await resolve={html}>
        {(p) => (
          <div
            // wrapping is applied in global styles (otherwise it doesn't work)
            className="overflow-x-auto font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: p }}
          />
        )}
      </Await>
    </Suspense>
  );
}
