import { getHighlighter } from "@/components/code-highlighter";
import DOMPurify from "dompurify";

const shiki = await getHighlighter();

export default function Highlighter(props: {
  json: string;
  isDark: boolean;
}): JSX.Element {
  const { json, isDark } = props;
  const html = shiki.codeToHtml(json, {
    lang: "json",
    theme: isDark ? "vitesse-dark" : "github-light",
  });

  return (
    <div
      // wrapping is applied in global styles (otherwise it doesn't work)
      className="overflow-x-auto font-mono text-sm"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
