# Transcript Editor

A local-first transcription workspace with a waveform audio player on the left and a professional text editor on the right.

## Features

- Local audio playback with a waveform, timeline, drag seeking, speed control, volume control, direct time entry, timestamp copying, drag-and-drop, and Media Session support.
- CodeMirror 6 transcript editing with search, history, line wrapping, spellcheck, and timestamp insertion.
- TanStack Hotkeys shortcuts that keep the player usable while editing.
- Responsive shadcn/Base UI interface with light and dark themes.
- Browser-local transcript saving plus plain-text import and export without uploading files.

## Stack

- Next.js 16 App Router and React 19
- Strict TypeScript
- Tailwind CSS 4
- shadcn/ui with Base UI primitives
- WaveSurfer.js, CodeMirror 6, and TanStack Hotkeys
- pnpm

Geist is loaded through `next/font/google`. Next.js downloads it during the build and serves the optimized font files with the application, so the repository does not keep handwritten font assets and browsers do not make requests to Google Fonts.

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

## Docker

```bash
docker build -t transcript-editor .
docker run --rm -p 3000:3000 transcript-editor
```

## Privacy

Audio and transcript files stay in the browser. The application has no upload endpoint, database, analytics, or feedback collection.
