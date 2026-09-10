# Demo deployment

## Vercel

1. Import this repository into Vercel and select the Vite preset.
2. Use Node.js 24, install command `npm ci`, build command `npm run build`, output `dist`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the deployment environment. Use the dedicated demo project.
4. Deploy. `vercel.json` supplies the SPA fallback for nested routes.
5. Open and refresh `/dashboard`, `/owners`, `/sounds`, `/sounds/new`, and an existing `/sounds/<id>`.
6. Add the resulting live URL and screenshots to README.

These steps prepare a deployment; no hosting account or remote project has been changed by these files.

## Supabase access model

The application now runs as an interactive read-only demo. Forms, buttons and local audio previews remain available. Save/delete actions show a demo notice, and the shared Supabase fetch wrapper rejects all methods except GET/HEAD before network access. This is a frontend behavior guard, not server authorization: direct API clients can bypass it.

Before public deployment, deny INSERT/UPDATE/DELETE and other write privileges for browser roles on owners/sounds, and deny Storage writes for the sounds bucket through the actual project grants/policies. Review callable functions and any existing broad policies too. Remote policies have not been inspected or changed by this local implementation. Do not assume the backend is protected by the frontend guard.

This application currently has no login. Browser requests use the project's public key and anonymous database permissions. A public key is expected in the browser; a secret/service-role key must never be used here.

Access options (this demo uses the first option):

- Public read-only demo: grant anonymous SELECT on demo owners/sounds; deny anonymous database writes and Storage uploads/deletes. Editing controls show a demo notice without submitting changes.
- Editable demo: explicitly accept that anonymous visitors can modify the shared sample data. Use only disposable data, limited Storage file sizes/types, and a process to reset the demo. Do not connect this mode to a real customer database.

Inspect existing RLS policies and grants before changing them. This repository does not contain the remote schema or policies, so it does not apply guessed SQL to an existing database.

Required resources: `owners` and `sounds` tables matching `src/features/*/model/dbTypes.ts`; public `sounds` Storage bucket for the current public-URL playback implementation. Public retrieval does not grant upload or deletion permissions: those operations need appropriate Storage policies.

## Audio lifecycle

Uploads use unique filenames. After a successful replacement/removal/deletion, the application attempts to remove the previous file. Failed saves attempt to clean up the new upload. Cleanup first checks database references and only manages UUID filenames in this project's `sounds` bucket. External URLs and legacy filenames are left alone.

The reference check requires visibility of all demo sound records. Do not use this client-side cleanup unchanged with tenant-filtered SELECT policies. The reference check and Storage deletion are not atomic; a production multi-user system should move cleanup to a trusted backend/job with concurrency handling. Network or permission failures may leave orphan files; the UI reports cleanup failures separately from successful saves. Inspect Storage before retrying an uncertain save.

## Verification before sharing

- `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- `node --env-file=.env.local scripts/check-supabase.mjs` checks read access and one sample audio URL without printing credentials.
- Open create/edit forms, select and preview local audio, and remove it locally. Save and confirm deletion: verify the demo notice, unchanged server records, and no outgoing write requests in the browser network panel.
- Confirm only one audio plays at a time; test an unavailable URL and an unsupported audio encoding.
- Confirm failed saves preserve the existing recording and display an error.
- Compare dashboard counts with Owners; follow missing-setup links to create/edit forms.
- Check desktop and narrow viewport layouts, keyboard operation, and refresh nested routes on the deployed host.

Sources: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [public and private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).
