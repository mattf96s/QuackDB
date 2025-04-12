import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["@wasm-fmt/sql_fmt"],
	experimental: {
		optimizePackageImports: ["@duckdb/duckdb-wasm"],
	},
};

export default nextConfig;
