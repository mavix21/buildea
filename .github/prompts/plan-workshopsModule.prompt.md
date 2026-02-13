## Plan: Workshops Module MVP

**TL;DR** — Build the core workshops system: CRUD with lifecycle management, hybrid registration (open/capped/approval/level-gated), resource hosting (files, links, rich-text), assignments with per-deadline submissions (quizzes, file uploads, link submissions), attendance check-in via secret code + manual override, and XP awards for attendance + assignment completion. The live session stays external (Zoom/Meet); Buildea is the before/after hub with check-in verification. Discovery via a global feed + community-scoped listing.

**Steps**

### Phase 1: Schema Design

1. **Update the workshops table** in `packages/convex/convex/tables/workshops.ts`:
   - Extend `publicationState` union to add `v.literal("live")`, `v.literal("ended")`, and `v.literal("archived")`
   - Add `registrationMode` field as a discriminated union: `open{}`, `capped{maxCapacity, waitlistEnabled}`, `approval{maxCapacity?}`, `levelGated{minLevel, maxCapacity?}`
   - Add `checkInCode: v.optional(v.string())` for attendance verification
   - Add `tags: v.array(v.string())` for discovery/filtering
   - **Remove** the `quizzes` array field (assignments table will replace this)
   - **Remove** `recentRegistrations` (separate registrations table will handle this)
   - Keep `registrationCount` as a denormalized counter for performance
   - Add index `by_publicationState` on `["publicationState.type"]`

2. **Create `workshopResources` table** in a new file `packages/convex/convex/tables/workshopResources.ts`:
   - Fields: `workshopId: v.id("workshops")`, `title: v.string()`, `description: v.optional(v.string())`, `order: v.number()`
   - Discriminated union `content`: `file{fileId, fileName, fileSize, mimeType?}`, `link{url}`, `richtext{body}` (body is markdown)
   - Index: `by_workshopId` on `["workshopId"]`

3. **Create `workshopRegistrations` table** in `packages/convex/convex/tables/workshopRegistrations.ts`:
   - Fields: `workshopId`, `userId`, `status` (union: `registered`, `waitlisted`, `pending_approval`, `approved`, `rejected`, `cancelled`), `registeredAt: v.number()`
   - Indexes: `by_workshopId` on `["workshopId"]`, `by_userId` on `["userId"]`, `by_workshopId_and_userId` on `["workshopId", "userId"]`, `by_workshopId_and_status` on `["workshopId", "status"]`

4. **Create `workshopAttendance` table** in `packages/convex/convex/tables/workshopAttendance.ts`:
   - Fields: `workshopId`, `userId`, `checkedInAt: v.number()`, `method: v.union(v.literal("code"), v.literal("manual"))`
   - Indexes: `by_workshopId` on `["workshopId"]`, `by_workshopId_and_userId` on `["workshopId", "userId"]`

5. **Create `workshopAssignments` table** in `packages/convex/convex/tables/workshopAssignments.ts`:
   - Fields: `workshopId`, `title`, `description: v.string()`, `order: v.number()`, `deadline: v.number()`, `xpReward: v.number()`
   - Discriminated union `type`: `quiz{quizId}`, `file_upload{acceptedFormats?, maxFileSizeMb?}`, `link_submission{placeholder?}`
   - Index: `by_workshopId` on `["workshopId"]`

6. **Create `assignmentSubmissions` table** in `packages/convex/convex/tables/assignmentSubmissions.ts`:
   - Fields: `assignmentId: v.id("workshopAssignments")`, `workshopId` (denormalized), `userId`, `submittedAt: v.number()`
   - Discriminated union `content`: `quiz{quizSubmissionId}`, `file_upload{fileId, fileName}`, `link_submission{url}`
   - Fields: `status` (union: `submitted`, `approved`, `rejected`), `feedback: v.optional(v.string())`, `reviewedAt: v.optional(v.number())`, `reviewedBy: v.optional(v.id("users"))`, `xpAwarded: v.number()`
   - Indexes: `by_assignmentId` on `["assignmentId"]`, `by_workshopId_and_userId` on `["workshopId", "userId"]`, `by_userId` on `["userId"]`, `by_assignmentId_and_userId` on `["assignmentId", "userId"]`

7. **Register all new tables** in `packages/convex/convex/schema.ts` — import and add `workshopResources`, `workshopRegistrations`, `workshopAttendance`, `workshopAssignments`, `assignmentSubmissions`

### Phase 2: Backend — Core Workshop CRUD

8. **Create `packages/convex/convex/workshops.ts`** with:
   - `create` (mutation) — creates a workshop in `draft` state, validates the caller is a community member, sets `registrationCount: 0`
   - `update` (mutation) — updates mutable fields, only allowed by creator/co-hosts, only while in `draft` or `published` state
   - `get` (query) — returns workshop with resolved creator name/avatar, community info, and registration count
   - `publish` (mutation) — transitions `draft → published`, validates required fields are complete
   - `archive` (mutation) — transitions `ended → archived`
   - `delete` (mutation) — only in `draft` state, cascades delete to resources/assignments
   - `listByCommunity` (query) — lists workshops for a community, ordered by `startDate`, paginated
   - `listUpcoming` (query) — global feed of `published` workshops where `startDate > now`, ordered by `startDate`
   - `search` (query) — uses existing `search_workshops` search index on title
   - `addCoHost` / `removeCoHost` (mutations) — manage co-host list

9. **Create an auth helper** (or add to existing helpers) — a reusable function `assertWorkshopOrganizer(ctx, workshopId)` that checks if the current user is the creator or a co-host, used across all management mutations.

### Phase 3: Backend — Registration

10. **Create `packages/convex/convex/workshopRegistrations.ts`** with:
    - `register` (mutation) — handles all 4 modes:
      - `open`: immediately sets status `registered`
      - `capped`: checks count vs `maxCapacity`, places in `waitlisted` if full (when `waitlistEnabled`), rejects otherwise
      - `approval`: sets status `pending_approval`
      - `levelGated`: calls existing `getUserLevelInfo` logic from `packages/convex/convex/xp.ts`, rejects if user level < `minLevel`, then applies capacity logic
    - Increments `registrationCount` on the workshop doc for active registrations
    - `cancelRegistration` (mutation) — sets status `cancelled`, decrements count, promotes from waitlist if applicable
    - `approveRegistration` / `rejectRegistration` (mutations) — for approval mode, organizer-only
    - `getMyRegistration` (query) — returns current user's registration for a workshop (or null)
    - `listRegistrations` (query) — organizer view, filterable by status, paginated

### Phase 4: Backend — Resources

11. **Create `packages/convex/convex/workshopResources.ts`** with:
    - `generateUploadUrl` (mutation) — wraps `ctx.storage.generateUploadUrl()`, validates organizer permission
    - `addFileResource` (mutation) — creates resource with `content.type = "file"`, validates freemium file count limit
    - `addLinkResource` (mutation) — creates resource with `content.type = "link"`
    - `addRichTextResource` (mutation) — creates resource with `content.type = "richtext"`
    - `updateResource` (mutation) — updates title, description, content, order
    - `deleteResource` (mutation) — deletes resource, also deletes from storage if file type
    - `listResources` (query) — returns resources for a workshop ordered by `order`, accessible to registered builders
    - `reorderResources` (mutation) — batch update order values

### Phase 5: Backend — Assignments & Submissions

12. **Create `packages/convex/convex/workshopAssignments.ts`** with:
    - `create` (mutation) — creates assignment, organizer-only
    - `update` (mutation) — updates assignment fields
    - `delete` (mutation) — deletes assignment and associated submissions
    - `list` (query) — returns assignments for a workshop ordered by `order`, enriched with submission status for current user

13. **Create `packages/convex/convex/assignmentSubmissions.ts`** with:
    - `submit` (mutation) — validates: user is registered + attended, deadline not passed, no existing approved submission; handles file/link submissions. For quiz-type, links to existing `quizSubmissions` record
    - `getMySubmission` (query) — returns current user's submission for a specific assignment
    - `listForAssignment` (query) — organizer view: all submissions for an assignment, paginated
    - `listMyWorkshopSubmissions` (query) — builder view: all their submissions in a workshop
    - `review` (mutation) — organizer approves/rejects with feedback; on approval, awards XP via patching `users.totalXp` and creating an `xpTransactions` record (fixing the current gap where xpTransactions is never written to)

### Phase 6: Backend — Attendance & Check-in

14. **Create `packages/convex/convex/workshopAttendance.ts`** with:
    - `generateCheckInCode` (mutation) — organizer generates a random 6-char alphanumeric code, stored on workshop doc, only allowed when workshop is live
    - `refreshCheckInCode` (mutation) — generates a new code (invalidates old)
    - `checkIn` (mutation) — builder submits code, validates it matches, creates attendance record with `method: "code"`
    - `manualCheckIn` (mutation) — organizer marks a user as attended with `method: "manual"`
    - `removeAttendance` (mutation) — organizer removes an attendance record (corrections)
    - `listAttendees` (query) — organizer view, returns attended users with check-in time and method
    - `getMyAttendance` (query) — returns whether current user has checked in
    - Award attendance XP on check-in (configurable amount, e.g., from a constant or future `xpConfig` extension)

### Phase 7: Backend — XP Integration

15. **Extend XP system** in `packages/convex/convex/xp.ts`:
    - Add a helper `awardXp(ctx, { userId, amount, source })` that both patches `users.totalXp` AND creates an `xpTransactions` record — use this across attendance check-in, assignment approval, and quiz submissions
    - Add `"workshop_attendance"` and `"workshop_assignment"` to the `xpTransactions.source` union in `packages/convex/convex/tables/xpTransactions.ts` (currently only supports `quiz`, `module`, `dailyTask`)
    - Extend the source union to optionally include `workshopId` for traceability

### Phase 8: Frontend — Pages & Components

16. **Create workshop discovery page** at `apps/web/app/(app)/[locale]/(app)/(dashboard)/workshops/page.tsx`:
    - Server component with `preloadAuthQuery` for `api.workshops.listUpcoming`
    - Client component showing a grid/list of workshop cards (title, image, date, community, registration count, tags)
    - Search bar using `api.workshops.search`

17. **Create workshop detail page** at `apps/web/app/(app)/[locale]/(app)/(dashboard)/workshops/[workshopId]/page.tsx`:
    - Tabs or sections: **Overview** (description, date, location, organizer), **Resources**, **Assignments**
    - Registration CTA button (state-aware: register / waitlisted / pending / registered / cancelled)
    - Check-in code input (shown when workshop is `live` and user is registered)

18. **Create workshop management page** at `.../workshops/[workshopId]/manage/page.tsx`:
    - Sub-navigation: Settings, Resources, Assignments, Registrations, Attendance, Submissions
    - Each sub-page is a client component with relevant queries and mutation forms

19. **Create workshop creation page** at `.../workshops/new/page.tsx`:
    - Multi-step form: Basic info → Location → Registration mode → Review & create as draft

20. **Page component files** follow the existing pattern: thin route files in the Next.js app directory, actual page components in `apps/web/app/_pages/dashboard/workshops/`

21. **Shared components** in `packages/features/src/features/workshop/`:
    - Workshop card component
    - Resource list component (renders files, links, markdown)
    - Assignment card component (shows type, deadline, submission status)
    - Check-in widget
    - Registration button (stateful)

### Verification

- Run `pnpm exec convex dev --once` from `packages/convex` after schema changes to validate schema and regenerate types
- Write a Convex test (or manual test via dashboard) for the registration flow covering all 4 modes
- Test the check-in code flow: generate code → submit as builder → verify attendance record created
- Test assignment submission + review flow: submit → organizer approves → verify XP awarded + xpTransaction created
- Test lifecycle transitions: draft → published → live → ended → archived (ensure invalid transitions are rejected)
- Verify resource file count respects freemium limits (define limit as a constant initially)

### Key Decisions

- **Registrations as a separate table** instead of denormalized on the workshop doc: enables querying by user across workshops, status filtering, and avoids hitting the 2MB item limit for popular workshops
- **Removed `quizzes` array from workshops table**: replaced by the more flexible `workshopAssignments` table that supports quizzes, file uploads, and link submissions
- **Kept `registrationCount` denormalized** on the workshop doc for fast reads on listing pages, incremented/decremented via mutations
- **External live session only**: no real-time chat/Q&A in MVP — the platform handles check-in verification, resources, and assignments
- **XP awarded on approval** (not submission) for file/link assignments to prevent gaming; quiz XP uses existing auto-grading system
- **`xpTransactions` will actually be written to** going forward, fixing the current gap where only `users.totalXp` is patched directly
- **Badges/certificates deferred** to post-MVP — the XP infrastructure is in place, and a `workshopCompletions` tracking table can be added later
- **Freemium resource limits** tracked as a constant initially (e.g., `MAX_FILE_RESOURCES_FREE = 5`), upgradeable to a dynamic config later
