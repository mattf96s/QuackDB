import { Await } from "@remix-run/react";
import DOMPurify from "dompurify";
import { Suspense } from "react";
import { useTheme } from "remix-themes";
import { type CodeToHastOptionsCommon, type HighlighterCore } from "shiki/core";
import { getHighlighter } from "~/components/code-highlighter";

let shiki: HighlighterCore | undefined;

type CreateHighlighterProps = {
  text: string;
  lang: CodeToHastOptionsCommon["lang"];
};

const createHighlighter = async (
  props: CreateHighlighterProps & { isDark: boolean },
) => {
  try {
    if (!shiki) shiki = await getHighlighter();

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
  const [theme] = useTheme();
  const isDark = theme === "dark";

  return (
    <Suspense>
      <HighlightContent
        {...props}
        isDark={isDark}
      />
    </Suspense>
  );
}

function HighlightContent(
  props: CreateHighlighterProps & { isDark: boolean },
): JSX.Element {
  const html = createHighlighter(props);

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
