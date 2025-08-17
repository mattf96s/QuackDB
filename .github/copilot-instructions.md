

# Patterns and Best Practices
  - Only add comments when the code is unintuitive or requires additional context.
  - Prefer functional programming principles: immutability, pure functions, and avoiding uncontrolled side effects.
  - Clever code is fine if interesting.
  - This is a side project: experimental, clever, or unusual code is encouraged if it explores interesting ideas.
  - Include usage examples in comments if a function is non-obvious.

# Experimentation Guidelines
  - Copilot should suggest modern or experimental language features (e.g., Proxy, AsyncIterator, Temporal, advanced TypeScript utility types).
  - It’s fine to generate code that explores non-standard approaches, but add minimal inline docs when doing something novel.
  - Suggest performance tricks, creative algorithms, or unusual patterns if they make sense in context.

# Readability & Style
  - Prefer concise, readable code over overly terse one-liners when clarity would suffer.

# Project Specifics (since this is a side project)
	•	Assume no legacy constraints — Copilot can ignore “enterprise safety” concerns.
	•	Copilot should optimize for developer fun and speed of iteration, not long-term maintainability.


# Copilot Instructions — vite-duckdb (Side Project)

## Purpose
Guide Copilot on the preferred style for this repository. This is a side project, so exploration and clever solutions are welcome.

## TL;DR
- Optimize for readability and developer speed.
- Experimental, clever, or unusual code is encouraged when it explores interesting ideas.
- Prefer functional programming and keep side effects controlled.
- Add examples or brief notes only when code is non-obvious.

## Project Context
- Tech focus: Vite + DuckDB + TypeScript (ES modules).
- No legacy constraints; treat this as a playground for ideas.

## Generation Rules

### Readability & Style
- Prefer concise, readable code over overly terse one-liners when clarity would suffer.
- Only add comments when the code is unintuitive or requires additional context.

### Patterns & Best Practices
- Prefer functional programming principles: immutability, pure functions, and avoiding uncontrolled side effects.
- Include usage examples in comments if a function is non-obvious.

### Experimentation Guidelines
- Suggest modern or experimental language features (e.g., `Proxy`, `AsyncIterator`, `Temporal`, advanced TypeScript utility types).
- It’s fine to generate code that explores non-standard approaches; add minimal inline docs when doing something novel.
- Suggest performance tricks, creative algorithms, or unusual patterns if they make sense in context.

### Project-Specific Notes
- This is a side project: experimental, clever, or unusual code is encouraged if it explores interesting ideas.
- Assume no legacy constraints — Copilot can ignore “enterprise safety” concerns.
- Copilot should optimize for developer fun and speed of iteration, not long-term maintainability.

## Examples (for Copilot to follow)

**Example: Include a short usage snippet for non-obvious functions**
```ts
// Usage: parseQuery("a=1&b=2") -> { a: 1, b: 2 }
const result = parseQuery("a=1&b=2")
```

**Example: Minimal inline docs for novel techniques**
```ts
// Using Proxy to lazily compute derived fields; avoids upfront cost until accessed.
const model = new Proxy(base, {
  get(target, key) {
    if (key === 'derived') return expensiveCompute(target)
    return Reflect.get(target, key)
  },
})
```

## When In Doubt
- Prefer simple, readable solutions. Reach for clever/experimental approaches when they materially improve ergonomics, performance, or expressiveness.