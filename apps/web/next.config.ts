import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["@duckdb/duckdb-wasm"],
	},
};

export default nextConfig;