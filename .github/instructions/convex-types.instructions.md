---
applyTo: "**/*.ts,**/*.tsx"
---

# Convex Type False Positives

## Do NOT inline types for Convex queries

When you see ESLint errors like:

- "Unsafe assignment of an error typed value"
- "Unsafe member access on a type that cannot be resolved"

These are **false positives** caused by the editor not having regenerated Convex types yet.

### What NOT to do

Do NOT try to fix these by:

- Inlining return types from validators
- Creating manual type definitions that duplicate the query return type
- Adding type assertions

### What to do instead

1. Trust that `usePreloadedQuery` and Convex query return types work correctly
2. Run `pnpm exec convex dev --once` to regenerate types if needed
3. Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")
4. Ignore these errors during development — they resolve after type regeneration
