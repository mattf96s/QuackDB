// scripts/build-worker.js
import { build } from "esbuild";
import glob from "fast-glob";

const entryDir = "workers";
const outDir = "public/worker-dist";

// Only match files like xxx.worker.ts
const entries = await glob(`${entryDir}/**/*.worker.ts`);

if (entries.length === 0) {
	console.warn("⚠️ No worker files found matching *.worker.ts");
	process.exit(0);
}

await build({
	entryPoints: entries,
	bundle: true,
	format: "esm",
	platform: "browser",
	target: "es2020",
	sourcemap: true,
	outdir: outDir,
	entryNames: "[dir]/[name]", // Keeps relative paths
	outbase: entryDir, // Ensures output mirrors src/workers/ structure
});

console.log(`✅ Bundled ${entries.length} worker(s) to ${outDir}`);
