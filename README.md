# Transcript Desk

A local-first transcription workspace with a waveform audio player on the left and a professional text editor on the right.

## Features

- Local audio playback with a waveform, timeline, 1- and 5-second seeking, two-second resume rewind, speed control, volume control, direct time entry, timestamp copying, drag-and-drop, and Media Session support.
- CodeMirror 6 transcript editing with search, undo and redo, line wrapping, spellcheck, timestamp insertion, and contextual timestamp-to-audio jumping.
- TanStack Hotkeys shortcuts that keep the player usable while editing.
- Responsive shadcn/Base UI interface with light and dark themes.
- Browser-local transcript saving with 20 previous revisions, configurable speaker shortcuts, and plain-text import and export without uploading files.

## Stack

- Next.js 16 App Router and React 19
- Strict TypeScript
- Tailwind CSS 4
- shadcn/ui with Base UI primitives
- WaveSurfer.js, CodeMirror 6, and TanStack Hotkeys
- pnpm
- Node.js 24

Geist is loaded through `next/font/google`. Next.js downloads it during the build and serves the optimized font files with the application, so the repository does not keep handwritten font assets and browsers do not make requests to Google Fonts.

## Usage

1. Open an audio recording in the left panel.
2. Create an empty transcript, restore a browser-local draft, or open an existing `.txt` file on the right.
3. Save the current transcript locally using the toolbar or the platform-specific shortcut listed in Docs.
4. Use the Export button to download a text file.

The Docs page lists every keyboard shortcut, and the About page explains the academic work that motivated the project.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```

No test framework is included. The repository intentionally uses linting, strict TypeScript, a production build, and a browser smoke check as its lean validation baseline.

## Privacy

Audio and transcript files stay in the browser. The application has no upload endpoint, database, analytics, or feedback collection.
