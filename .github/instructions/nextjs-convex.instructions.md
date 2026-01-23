---
applyTo: "**/*.ts,**/*.tsx"
---

# Next.js + Convex Guidelines

## Server Rendering with Reactivity

- Use `preloadAuthQuery` in server components, NOT `fetchAuthQuery`, to retain reactivity after initial render.
- Pass the preloaded payload to a client component that calls `usePreloadedQuery`.
- `fetchAuthQuery` is non-reactive; only use it for one-time server-side data needs (e.g., auth checks).

Example pattern:

```tsx
// Server component
async function Wrapper() {
  const preloaded = await preloadAuthQuery(api.example.list, {});
  return <ClientComponent preloaded={preloaded} />;
}

// Client component
function ClientComponent({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.example.list>;
}) {
  const data = usePreloadedQuery(preloaded);
  // data is reactive
}
```

## Never Use router.refresh()

- Convex queries are reactive; data updates automatically.
- Do NOT call `router.refresh()` after mutations.
- Remove `useRouter` if only used for refresh.

## Component Boundaries

- Push `"use client"` as deep as possible in the component tree.
- Keep parent components as server components when feasible.
- Only mark a component as client when it needs interactivity (state, effects, event handlers).

## Async Components and Suspense

- Do NOT block render with async operations in high-level components.
- Move async data fetching to the lowest possible component in the tree.
- Wrap async server components with `<Suspense fallback={<Skeleton />}>`.
- Skeletons must match the layout to prevent layout shift.

Example pattern:

```tsx
// Page component (server)
export function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AsyncContent />
    </Suspense>
  );
}

// Async content (server)
async function AsyncContent() {
  const preloaded = await preloadAuthQuery(api.data.list, {});
  return <ClientTable preloaded={preloaded} />;
}
```
