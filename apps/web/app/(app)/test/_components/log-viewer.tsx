"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
	AlertCircle,
	AlertTriangle,
	ChevronDown,
	ChevronRight,
	Clock,
	Copy,
	Filter,
	Info,
	RefreshCw,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";

// Sample log data - replace with your actual log fetching logic
const SAMPLE_LOGS = [
	{
		id: 1,
		timestamp: new Date().toISOString(),
		level: "info",
		message: "Application started",
		source: "server.js",
		requestId: "req_123",
	},
	{
		id: 2,
		timestamp: new Date(Date.now() - 30000).toISOString(),
		level: "info",
		message: "User logged in",
		source: "auth.js",
		requestId: "req_123",
		data: { userId: "user_1" },
	},
	{
		id: 3,
		timestamp: new Date(Date.now() - 60000).toISOString(),
		level: "warning",
		message: "High memory usage detected",
		source: "monitor.js",
		requestId: "req_124",
	},
	{
		id: 4,
		timestamp: new Date(Date.now() - 120000).toISOString(),
		level: "error",
		message: "Failed to connect to database",
		source: "db.js",
		requestId: "req_125",
		error: "Connection timeout",
	},
	{
		id: 5,
		timestamp: new Date(Date.now() - 180000).toISOString(),
		level: "info",
		message: "Cache cleared",
		source: "cache.js",
		requestId: "req_126",
	},
	{
		id: 6,
		timestamp: new Date(Date.now() - 240000).toISOString(),
		level: "error",
		message: "API rate limit exceeded",
		source: "api.js",
		requestId: "req_127",
	},
];

type Log = {
	id: number;
	timestamp: string;
	level: "info" | "warning" | "error";
	message: string;
	source: string;
	requestId: string;
	data?: any;
	error?: string;
};

/**
 *
 * @example
 *
 * 	<div className="container mx-auto">
 *    <LogViewer />
 *  </div>
 */
export default function LogViewer() {
	const [logs, setLogs] = useState<Log[]>([]);
	const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [levelFilter, setLevelFilter] = useState<string>("all");
	const [timeRange, setTimeRange] = useState<string>("hour");
	const [isLive, setIsLive] = useState(true);
	const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});

	// Filter logs based on search term and level
	useEffect(() => {
		let filtered = logs;

		if (searchTerm) {
			filtered = filtered.filter(
				(log) =>
					log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
					log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
					log.requestId.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (levelFilter !== "all") {
			filtered = filtered.filter((log) => log.level === levelFilter);
		}

		setFilteredLogs(filtered);
	}, [logs, searchTerm, levelFilter]);

	// Simulate live log updates
	useEffect(() => {
		if (!isLive) return;

		const interval = setInterval(() => {
			const newLog = {
				id: Date.now(),
				timestamp: new Date().toISOString(),
				level: ["info", "warning", "error"][Math.floor(Math.random() * 3)] as
					| "info"
					| "warning"
					| "error",
				message: `Log entry at ${new Date().toLocaleTimeString()}`,
				source: ["server.js", "api.js", "auth.js", "db.js"][
					Math.floor(Math.random() * 4)
				],
				requestId: `req_${Math.floor(Math.random() * 1000)}`,
			};
			setLogs((prev) => [newLog, ...prev]);
		}, 5000);

		return () => clearInterval(interval);
	}, [isLive]);

	const toggleLogExpansion = (id: number) => {
		setExpandedLogs((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const copyLogToClipboard = (log: Log) => {
		navigator.clipboard.writeText(JSON.stringify(log, null, 2));
	};

	const refreshLogs = () => {
		// In a real app, this would fetch fresh logs from your backend
		setLogs([]);
	};

	const getLevelIcon = (level: string) => {
		switch (level) {
			case "info":
				return <Info className="h-3 w-3 text-blue-500" />;
			case "warning":
				return <AlertTriangle className="h-3 w-3 text-amber-500" />;
			case "error":
				return <AlertCircle className="h-3 w-3 text-red-500" />;
			default:
				return <Info className="h-3 w-3" />;
		}
	};

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString();
	};

	return (
		<div className="border rounded-lg bg-background shadow-sm text-xs">
			<div className="p-2 border-b flex items-center gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
					<Input
						placeholder="Search logs..."
						className="pl-7 h-7 text-xs"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Select value={levelFilter} onValueChange={setLevelFilter}>
					<SelectTrigger className="w-[100px] h-7 text-xs">
						<Filter className="mr-1 h-3.5 w-3.5" />
						<SelectValue placeholder="Level" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Levels</SelectItem>
						<SelectItem value="info">Info</SelectItem>
						<SelectItem value="warning">Warning</SelectItem>
						<SelectItem value="error">Error</SelectItem>
					</SelectContent>
				</Select>

				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger className="w-[90px] h-7 text-xs">
						<Clock className="mr-1 h-3.5 w-3.5" />
						<SelectValue placeholder="Time" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="hour">Hour</SelectItem>
						<SelectItem value="day">Day</SelectItem>
						<SelectItem value="week">Week</SelectItem>
						<SelectItem value="custom">Custom</SelectItem>
					</SelectContent>
				</Select>

				<Button
					variant={isLive ? "default" : "outline"}
					size="sm"
					onClick={() => setIsLive(!isLive)}
					className={cn(
						"h-7 px-2 text-xs",
						isLive && "bg-green-600 hover:bg-green-700",
					)}
				>
					<RefreshCw
						className={cn("mr-1 h-3.5 w-3.5", isLive && "animate-spin")}
					/>
					{isLive ? "Live" : "Paused"}
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={refreshLogs}
					className="h-7 w-7"
				>
					<RefreshCw className="h-3.5 w-3.5" />
					<span className="sr-only">Refresh logs</span>
				</Button>
			</div>

			<Tabs defaultValue="all">
				<div className="px-2 border-b">
					<TabsList className="h-8">
						<TabsTrigger value="all" className="text-xs px-2 py-1">
							All Logs
						</TabsTrigger>
						<TabsTrigger value="requests" className="text-xs px-2 py-1">
							Requests
						</TabsTrigger>
						<TabsTrigger value="errors" className="text-xs px-2 py-1">
							Errors
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="all" className="p-0">
					<div className="overflow-auto max-h-[500px]">
						<table className="w-full">
							<thead className="bg-muted/50 sticky top-0">
								<tr>
									<th className="text-left p-1 pl-2 text-xs font-medium text-muted-foreground">
										Time
									</th>
									<th className="text-left p-1 text-xs font-medium text-muted-foreground w-16">
										Level
									</th>
									<th className="text-left p-1 text-xs font-medium text-muted-foreground">
										Message
									</th>
									<th className="text-left p-1 text-xs font-medium text-muted-foreground">
										Source
									</th>
									<th className="text-left p-1 text-xs font-medium text-muted-foreground">
										Request ID
									</th>
									<th className="text-right p-1 pr-2 text-xs font-medium text-muted-foreground w-8">
										Copy
									</th>
								</tr>
							</thead>
							<tbody className="text-xs">
								{filteredLogs.length > 0 ? (
									filteredLogs.map((log) => (
										<tr
											key={log.id}
											className={cn(
												"border-b hover:bg-muted/50 transition-colors",
												expandedLogs[log.id] && "bg-muted/30",
											)}
										>
											<td className="p-1 pl-2 text-xs text-muted-foreground whitespace-nowrap">
												{formatTimestamp(log.timestamp)}
											</td>
											<td className="p-1">
												<div className="flex items-center gap-1">
													{getLevelIcon(log.level)}
													<span
														className={cn(
															"text-xs",
															log.level === "error" && "text-red-600",
															log.level === "warning" && "text-amber-600",
															log.level === "info" && "text-blue-600",
														)}
													>
														{log.level}
													</span>
												</div>
											</td>
											<td className="p-1 font-mono text-xs">
												<div className="flex items-center">
													<button
														type="button"
														onClick={() => toggleLogExpansion(log.id)}
														className="mr-1 focus:outline-none"
													>
														{expandedLogs[log.id] ? (
															<ChevronDown className="h-3 w-3 text-muted-foreground" />
														) : (
															<ChevronRight className="h-3 w-3 text-muted-foreground" />
														)}
													</button>
													{log.message}
												</div>
												{expandedLogs[log.id] && (log.data || log.error) && (
													<div className="mt-1 ml-4 p-1 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
														{log.data && (
															<div>
																Data: {JSON.stringify(log.data, null, 2)}
															</div>
														)}
														{log.error && (
															<div className="text-red-500">
																Error: {log.error}
															</div>
														)}
													</div>
												)}
											</td>
											<td className="p-1 text-xs text-muted-foreground">
												{log.source}
											</td>
											<td className="p-1 text-xs font-mono text-muted-foreground">
												{log.requestId}
											</td>
											<td className="p-1 pr-2 text-right">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => copyLogToClipboard(log)}
													className="h-5 w-5"
												>
													<Copy className="h-3 w-3" />
													<span className="sr-only">Copy log</span>
												</Button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={6}
											className="p-2 text-center text-muted-foreground"
										>
											No logs found matching your filters
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</TabsContent>

				<TabsContent value="requests" className="p-2">
					<div className="text-center text-muted-foreground">
						Request logs view - Group logs by request ID
					</div>
				</TabsContent>

				<TabsContent value="errors" className="p-2">
					<div className="text-center text-muted-foreground">
						Error logs view - Show only errors and warnings
					</div>
				</TabsContent>
			</Tabs>

			<div className="p-1 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
				<div>
					{filteredLogs.length} of {logs.length} logs
				</div>
				<div>{isLive ? "Live updates enabled" : "Live updates paused"}</div>
			</div>
		</div>
	);
}
