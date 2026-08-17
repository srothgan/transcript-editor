import type { Metadata } from "next";

import { Kbd } from "@/components/ui/kbd";

export const metadata: Metadata = {
  title: "Docs",
  description: "Keyboard shortcuts and usage notes for Transcript Desk.",
  alternates: {
    canonical: "/docs",
  },
};

const SHORTCUT_GROUPS = [
  {
    title: "Files",
    shortcuts: [
      ["Open transcript", ["Ctrl / ⌘", "O"]],
      ["Open audio", ["Ctrl / ⌘", "Shift", "O"]],
      ["Save transcript locally", ["Ctrl / ⌘", "S"]],
      ["Export text file", ["Ctrl / ⌘", "Shift", "S"]],
    ],
  },
  {
    title: "Playback",
    shortcuts: [
      ["Play or pause", ["Ctrl / ⌘", "Enter"]],
      ["Back five seconds", ["Ctrl / ⌘", "Shift", "←"]],
      ["Forward five seconds", ["Ctrl / ⌘", "Shift", "→"]],
      ["Insert timestamp", ["Ctrl / ⌘", "J"]],
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      ["Find and replace", ["Ctrl / ⌘", "F"]],
      ["Undo", ["Ctrl / ⌘", "Z"]],
      ["Open documentation", ["Ctrl / ⌘", "/"]],
    ],
  },
] as const;

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
              <div key={group.title}>
                <h3 className="text-sm font-medium">{group.title}</h3>
                <dl className="mt-3 grid gap-3">
                  {group.shortcuts.map(([label, keys]) => (
                    <div key={label} className="grid gap-1.5">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="flex flex-wrap items-center gap-1">
                        {keys.map((key) => (
                          <Kbd key={key}>{key}</Kbd>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
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
