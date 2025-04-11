export type LogLine = {
	id: string;
	text: string;
	timestamp?: Date;
	backgroundColor?: string;
};

export const LogLines = (props: { lines: LogLine[] }) => {
	return props.lines.map((line, i) => {
		return (
			<div
				style={{
					backgroundColor: line.backgroundColor,
				}}
				key={line.id}
				className="h-7 overflow-hidden w-full text-ellipsis whitespace-nowrap text-sm inline-flex items-baseline-last space-y-0.5"
			>
				<span className="inline-flex h-full w-5 text-gray-500 border-r border-gray-500 text-[0.7em] items-baseline-last">
					{props.lines.length - i}
				</span>
				<span>
					{line.timestamp && (
						<span className="text-[0.7em] px-0.5 mr-1">
							{line.timestamp.toISOString().substring(11, 23)}
						</span>
					)}
					<span>{line.text}</span>
				</span>
			</div>
		);
	});
};
