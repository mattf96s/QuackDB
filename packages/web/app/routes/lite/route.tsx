/**
 * There is a bug in Safari which means FileSystemHandles are not structure cloned correctly.
 * This is route is a limited playground as a fallback.
 */
export default function Component() {
  return (
    <div className="bg-primary/50">
      <h1>QuackDB</h1>
      <p>
        QuackDB is a user-friendly, open-source online DuckDB SQL playground and
        editor. Designed for efficient prototyping, data tasks, and data
        visualization, it respects your privacy with a no-tracking policy.
      </p>
    </div>
  );
}
