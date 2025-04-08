import { createHighlighter } from "@/components/code-highlighter";
import DOMPurify from "dompurify";
import { useTheme } from "next-themes";
import { type JSX, Suspense } from "react";
import type { CodeToHastOptionsCommon, HighlighterCore } from "shiki/core";

let shiki: HighlighterCore | undefined;

type CreateHighlighterProps = {
  text: string;
  lang: CodeToHastOptionsCommon["lang"];
};

const createHighlighterFn = async (
  props: CreateHighlighterProps & { isDark: boolean }
) => {
  try {
    if (!shiki) shiki = await createHighlighter();

    const html = shiki.codeToHtml(props.text, {
      lang: props.lang,
      theme: props.isDark ? "vitesse-dark" : "github-light",
    });
    if (!html) throw new Error("Failed to create highlighter");
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error("Failed to create highlighter: ", e);
    return "";
  }
};

export default function Highlighter(props: CreateHighlighterProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return <HighlightContent {...props} isDark={isDark} />;
}

function HighlightContent(
  props: CreateHighlighterProps & { isDark: boolean }
): JSX.Element {
  const htmlPromise = createHighlighterFn(props);

  return (
    <Suspense>
      <div
        // wrapping is applied in global styles (otherwise it doesn't work)
        className="overflow-x-auto font-mono text-sm"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: docs
        dangerouslySetInnerHTML={{ __html: htmlPromise }}
      />
    </Suspense>
  );
}
