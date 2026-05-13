# Telecom Sound Manager

Telecom Sound Manager is a React + TypeScript admin dashboard for managing telecom audio records, owner-based sound assignment, and required audio setup workflows.

The project simulates a telecom administration interface where companies, departments, queues, and users can have assigned audio records such as greetings, announcements, queue messages, voicemail messages, and music on hold.

## Overview

The goal of this project is to demonstrate a practical frontend architecture for a telecom-related admin tool.

The application allows users to:

- manage telecom sound records
- assign sounds to owners
- upload and remove audio files
- filter sounds by owner, type, search, and missing audio
- track required audio setup for each owner type
- navigate directly from missing setup hints to create or edit the required sound

This is not just a CRUD demo. The project includes business logic for checking whether each owner has the required audio configuration.

## Features

### Sound Management

- Create new sound records
- Edit existing sound records
- Delete sound records
- Upload audio files
- Replace or remove audio files
- Automatically mark sounds without audio as inactive
- Assign sounds to specific owners
- Filter sounds by:
  - search
  - sound type
  - owner
  - missing audio files

### Owner Setup Overview

- View owners with setup status
- Track total, active, inactive, and missing audio records
- Display owner setup progress
- Navigate from an owner directly to filtered sounds
- Detect incomplete setup, missing audio, inactive records, and ready owners

### Required Sound Setup

Each owner type has its own required sound setup.


Company:
- Main greeting
- Company announcement
- Music on hold

Department:
- Department greeting
- Department announcement

Queue:
- Queue message
- Music on hold
- Queue announcement

User:
- Voicemail greeting


The app checks whether required sounds:

- exist
- have an audio file
- are active

Possible owner setup statuses:


No sounds
Needs audio
Incomplete
Inactive
Ready


### Required Setup Hint

Sound cards display a required setup hint when the related owner still needs required audio records.

If a required sound is not created yet, clicking the hint opens the create form with the owner and sound type preselected.

If a required sound already exists but is missing an audio file or is inactive, clicking the hint opens the edit form for that sound.

## Tech Stack

- React
- TypeScript
- Vite
- Material UI
- Redux Toolkit
- RTK Query
- Supabase Database
- Supabase Storage
- React Router

## Project Architecture

The project uses a feature-based structure.


src/
├── app/
├── features/
│   ├── sounds/
│   ├── owners/
│   └── ui/
├── lib/
└── shared/


## Data Flow

The project separates form state, frontend models, database rows, and Supabase payloads.


FormState
↓
SoundFormPayload
↓
SoundPayloadRow
↓
Supabase insert/update
↓
SoundRow
↓
Sound


This keeps UI state, domain models, and database structure independent from each other.

## Important Files

### API layer


src/features/sounds/api/adminApiSlice.ts


Contains RTK Query endpoints for loading owners, loading sounds, creating sounds, updating sounds, and deleting sounds.

### Mappers


src/features/sounds/model/mappers.ts


Maps Supabase rows to frontend models and form payloads to Supabase payload rows.

### Sound model


src/features/sounds/model/types.ts
src/features/sounds/model/formTypes.ts
src/features/sounds/model/dbTypes.ts


Separates domain types, form types, and database row types.

### Owner setup logic


src/features/owners/model/ownerSetup.ts


Contains required sound setup rules and owner status calculation logic.

### Required setup tooltip


src/features/sounds/components/RequiredSetupTooltip.tsx


Displays required setup hints and allows navigation to create or edit the required sound.

### Sounds page


src/features/sounds/pages/SoundsPage.tsx


Displays sound records, filters, sound cards, delete confirmation, and required setup navigation.

### Owners page


src/features/owners/pages/OwnersPage.tsx


Displays owners, setup statistics, filters, and navigation to owner-specific sounds.

## Getting Started

### 1. Clone the repository


git clone <repository-url>
cd telecom-sound-manager


### 2. Install dependencies


npm install


### 3. Create environment file

Create a `.env.local` file in the project root.

env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


### 4. Start the development server


npm run dev


## Available Scripts

### Start development server


npm run dev


### Build project


npm run build


### Preview production build


npm run preview


## Environment Variables

The app uses Supabase environment variables.

env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=


These variables are used in:


src/lib/supabase.ts


## Project Status

Current status:


MVP completed


Implemented:

- Sounds CRUD
- Owner-based sound filtering
- Audio upload flow
- Required sound setup logic
- Owner setup dashboard
- Required setup hints
- RTK Query server state management
- Supabase Database integration
- Supabase Storage integration
- Feature-based architecture

## Future Improvements

Possible future improvements:

- Owner CRUD
- Audio preview player
- Dashboard statistics
- Role-based access control
- Supabase Row Level Security policies
- Store required setup rules in the database
- Deployment to Vercel or Netlify

## Portfolio Notes

This project demonstrates:

- Building a domain-specific admin dashboard
- React + TypeScript application architecture
- RTK Query for server state management
- Supabase database and storage integration
- Feature-based project structure
- Separation of domain models, form state, database rows, and API payloads
- Business logic for telecom audio setup workflows
