# Repository instructions

- Use pnpm for dependency and script commands.
- Write application code in strict TypeScript.
- Name non-route source files with kebab-case filenames such as `audio-player.tsx` and `time-utils.ts`.
- Keep the desktop workspace layout with the audio player on the left and transcript editor on the right.
- Prefer small feature folders over generic component layers; reusable shadcn components belong in `components/ui`.
- Do not add a test framework unless explicitly requested. Validate changes with lint, TypeScript, a production build, and a browser smoke check.
- Keep uploaded audio and transcript contents local to the browser.
