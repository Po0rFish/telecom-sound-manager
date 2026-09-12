# Deployment and optional Supabase integration

## Public browser demo on Vercel

1. Import `Po0rFish/telecom-sound-manager`, select the Vite preset, repository root and production branch `main`.
2. Use Node.js 24, install command `npm ci`, build command `npm run build`, output `dist`.
3. Leave `VITE_DATA_SOURCE` unset or set it to `browser`. Supabase variables are not needed; remove them from the browser-demo environment if previously configured.
4. Deploy. `vercel.json` supplies the SPA fallback for nested routes.
5. Open and refresh `/dashboard`, `/owners`, `/sounds`, `/sounds/new` and an existing sound route.

These repository changes do not change Vercel environment settings or remote Supabase policies. Redeploy after changing environment variables. The public URL is https://telecom-sound-manager.vercel.app.

## Browser data

The first data query initializes IndexedDB with fictional owners, sounds and a generated WAV tone. Audio uploads are stored as Blobs, never sent to a backend. The per-file limit is 5 MB; stored demo audio is capped at 50 MB. Browser quotas may be lower, and storage failures are reported to the user.

Reset Demo asks for confirmation, atomically replaces saved records and audio, and reloads the Sounds page to clear forms, playback URLs and query caches. Clearing browser site data also starts a fresh demo. Data is scoped to a browser profile and origin; it is not synced across devices. Private browsing and browser storage eviction can discard data. Unsaved form edits are not persisted. This demo is not a backup service.

## Optional Supabase read-only mode

This is a separate integration for an already configured, dedicated Supabase project. It is not needed to run or review the interactive browser demo. No database migrations or seed SQL are currently provided, so this mode is not a reproducible backend bootstrap.

Copy `.env.example` to `.env.local`, set `VITE_DATA_SOURCE=supabase`, and provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite or rebuild. Use public configuration only: `VITE_` variables are included in the browser bundle. Never put a secret/service-role key in them.

This mode reads existing `owners` and `sounds` tables matching `src/features/*/model/dbTypes.ts`, and uses a public `sounds` Storage bucket for audio playback. It retains the frontend write guard: save/delete show a notice and only GET/HEAD requests are forwarded. There is no authentication or supported writable backend mode.

The frontend guard is not server authorization. The project owner previously reported enabling RLS and removing anonymous write policies; those remote settings have not been verified by this implementation. Review effective grants, policies and callable functions for your project. Public audio retrieval does not grant upload or deletion permissions.

Run `scripts/audit-supabase-access.sql` in the project's SQL Editor for a read-only metadata audit. With `.env.local` configured, `node --env-file=.env.local scripts/check-supabase.mjs` checks table and sample audio reading without printing credentials. Neither check proves that all writes are denied.

## Retained Supabase audio lifecycle code

The retained upload/save code is guarded in Supabase mode. Its lifecycle design uses unique filenames. After a successful replacement/removal/deletion, the application attempts to remove the previous file. Failed saves attempt to clean up the new upload. Cleanup first checks database references and only manages UUID filenames in this project's `sounds` bucket. External URLs and legacy filenames are left alone.

The reference check requires visibility of all demo sound records. Do not use this client-side cleanup unchanged with tenant-filtered SELECT policies. The reference check and Storage deletion are not atomic; a production multi-user system should move cleanup to a trusted backend/job with concurrency handling. Network or permission failures may leave orphan files; the UI reports cleanup failures separately from successful saves. Inspect Storage before retrying an uncertain save.

## Verification

- Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Run `node scripts/browser-smoke.mjs` after a browser-mode build. It checks actual IndexedDB CRUD, audio persistence after navigation/reload, deletion, reset, playback and mobile overflow. External requests fail the test.
- Manually confirm filtering and dashboard/checklist updates after edits, invalid uploads, and Reset Demo cancellation.
- For a hosted browser build, verify the network panel contains no Supabase requests, including when saving, deleting or uploading audio.
- Supabase access checks are separate and are not performed by browser-demo tests.
