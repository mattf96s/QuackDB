import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type OnCopyToClipboardProps = {
	// allow lazy initialization
	value: string | (() => string);
	timeout?: number;
	className?: string;
};

export default function CopyToClipboard(props: OnCopyToClipboardProps) {
	const [copied, setCopied] = useState(false);

	const timeout = props.timeout || 2000;

	useEffect(() => {
		let timerId: NodeJS.Timeout | undefined;
		if (copied) {
			timerId = setTimeout(() => {
				setCopied(false);
			}, timeout);
		}
		return () => {
			if (timerId) clearTimeout(timerId);
		};
	}, [copied, timeout]);

	const onCopy = useCallback(async () => {
		try {
			const content =
				typeof props.value === "function" ? props.value() : props.value;
			await navigator.clipboard.writeText(content);
			setCopied(true);
		} catch (error) {
			console.error("Failed to copy: ", error);
		}
	}, [props]);

	return (
		<button
			type="button"
			onClick={onCopy}
			className={cn(
				"group flex h-auto w-8 cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-200/60 bg-background px-3 pb-1.5 pt-2 text-[0.65rem] font-medium uppercase text-neutral-500 shadow-xs hover:text-neutral-600 focus:outline-hidden dark:bg-[#121212] dark:hover:text-neutral-400",
				props.className,
			)}
			aria-label="Copy to clipboard"
			onTouchStart={onCopy}
		>
			{!copied && (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					className="mb-1 size-5 shrink-0 stroke-current"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
					/>
				</svg>
			)}
			{copied && (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					className="mb-1 size-5 shrink-0 stroke-current text-green-500"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
					/>
				</svg>
			)}
		</button>
	);
}
