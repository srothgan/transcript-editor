import type { Metadata } from "next";

import { ShortcutKeys } from "@/components/shortcut-keys";
import { SHORTCUT_GROUPS, SHORTCUTS } from "@/lib/shortcuts";

export const metadata: Metadata = {
  title: "Docs",
  description: "Keyboard shortcuts and usage notes for Transcript Desk.",
  alternates: {
    canonical: "/docs",
  },
};

const DOCUMENTED_SHORTCUTS = Object.values(SHORTCUTS).filter((shortcut) => shortcut.group !== null);

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>

      <div className="mt-10 grid gap-12">
        <section aria-labelledby="getting-started">
          <h2 id="getting-started" className="text-lg font-semibold">
            Getting started
          </h2>
          <ol className="mt-4 grid list-decimal gap-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Open an audio recording in the left panel.</li>
            <li>Type directly in the editor or open an existing plain-text transcript.</li>
            <li>Use the transport controls, waveform, or shortcuts while editing.</li>
            <li>Export the transcript as a UTF-8 text file when you are done.</li>
          </ol>
        </section>

        <section aria-labelledby="shortcuts">
          <h2 id="shortcuts" className="text-lg font-semibold">
            Keyboard shortcuts
          </h2>
          <div className="mt-5 grid gap-8 md:grid-cols-3">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-medium">{group.label}</h3>
                <dl className="mt-3 grid gap-3">
                  {DOCUMENTED_SHORTCUTS.filter((shortcut) => shortcut.group === group.id).map((shortcut) => (
                    <div key={shortcut.description} className="grid gap-1.5">
                      <dt className="text-xs text-muted-foreground">{shortcut.description}</dt>
                      <dd className="flex flex-wrap items-center gap-1">
                        <ShortcutKeys shortcut={shortcut} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="editing-workflow">
          <h2 id="editing-workflow" className="text-lg font-semibold">
            Editing workflow
          </h2>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Hover a timestamp or place the cursor inside it to reveal a jump action. <ShortcutKeys shortcut={SHORTCUTS.jumpToTimestamp} /> jumps immediately.</li>
            <li>Find and replace opens from the transcript toolbar or its keyboard shortcut. Undo and redo work on individual editor changes.</li>
            <li>Saving keeps the previous 20 local versions under Saved history.</li>
            <li>Speaker text is inserted exactly as configured, with an optional shortcut set from the Speakers control in the transcript toolbar.</li>
            <li>Playback resumes two seconds before the paused position. The transport controls provide separate 1- and 5-second jumps in both directions.</li>
          </ul>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy" className="text-lg font-semibold">
            Files and privacy
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Audio and transcript files stay in your browser. The app does not upload or store them. Transcript export uses plain UTF-8 text, and playback support depends on the audio formats available in your browser.
          </p>
        </section>
      </div>
    </main>
  );
}
