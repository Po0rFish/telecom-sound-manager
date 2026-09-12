# Telecom Sound Manager

A React / TypeScript portfolio application for telecom audio management across companies, departments, queues and users. It models greetings, announcements, voicemail and music on hold, with required sound configuration and readiness checks for each owner.

## Live Demo

[Open the demo](https://telecom-sound-manager.vercel.app)

No account, installation or backend setup is needed. Create, edit and delete sounds, upload audio and explore the dashboard. Changes and audio stay in your browser; the public demo makes no requests to Supabase.

## Features

- Sound creation, editing and deletion with owner/type/search and missing-audio filters.
- MP3, WAV and OGG uploads up to 5 MB each, with a 50 MB total demo audio limit.
- Audio previews, restart controls and one active player at a time.
- Dashboard and owner checklists distinguish ready, incomplete, missing-audio and inactive configurations.
- Inactive drafts for records without audio, and cleanup of unused local audio.
- Responsive list/grid views and forms.
- Persistent browser data and **Reset Demo** to restore the original samples.

Phone recording is a simulation. Owner management, authentication and a real telephone connection are not implemented. The bundled audio is a generated test tone.

Saved changes survive page refresh in the same browser. See [storage behavior and limitations](docs/DEPLOYMENT.md#browser-data).

## Screenshots

![Dashboard](docs/screenshots/dashboard.png)
![Sounds with audio previews](docs/screenshots/sounds.png)

[Grid](docs/screenshots/sounds-grid.png) | [Mobile grid](docs/screenshots/sounds-grid-mobile.png) | [Edit form](docs/screenshots/edit-sound.png) | [Owners on mobile](docs/screenshots/owners-mobile.png)

## Tech stack

React 19, TypeScript, Vite, Material UI, Sass, Redux Toolkit / RTK Query, React Router and IndexedDB. A separate Supabase Database / Storage integration remains in the source. Tests use the Node.js test runner and a Chromium browser smoke script.

## AI-assisted development

The project was developed iteratively with AI coding assistance for implementation and refactoring proposals. Architecture decisions, telecom domain rules, code review, testing and final validation remain developer-controlled.

## Local setup

Use Node.js 22.18+ (Node.js 24 recommended).

```sh
git clone https://github.com/Po0rFish/telecom-sound-manager.git
cd telecom-sound-manager
npm ci
npm run dev
```

Open the URL printed by Vite. No environment file, Supabase account or Docker is required for the browser demo. In Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

## Architecture

- `src/app`: routing, Redux store and theme.
- `src/features`: sound forms, queries, validation and owner configuration rules.
- `src/shared/api/browserDemo.ts`: IndexedDB records, audio storage and reset.
- `src/shared/api/demoSeed.ts`: fictional fixtures and generated WAV sample.
- `src/shared/ui`: reusable components and audio playback.

RTK Query provides the same interface to the UI for browser data and the optional Supabase read-only integration. Browser audio is stored as Blobs with durable IDs; playback URLs are recreated after reload. The Supabase client is loaded only when its build-time mode is selected.

## Validation

| Command | Purpose |
| --- | --- |
| `npm test` | Domain, audio-save and remote-write-guard regression tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript checks |
| `npm run build` | TypeScript checks and production build |
| `npm run preview` | Preview the production build |
| `node scripts/browser-smoke.mjs` | After build: actual IndexedDB CRUD, persistence, audio, reset and responsive UI checks |

The browser smoke script uses Chrome at its default Windows path; set `BROWSER_PATH` for another Chromium executable. It uses a fresh profile, rejects external requests and refreshes screenshots under `docs/screenshots`.

See [deployment and optional Supabase setup](docs/DEPLOYMENT.md) for hosting configuration and integration limitations.
