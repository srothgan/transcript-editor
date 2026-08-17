import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why Simon Rothgang built Transcript Desk and how it supports academic transcription work.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">About Transcript Desk</h1>

      <div className="mt-10 grid gap-12 text-sm leading-7 text-muted-foreground">
        <section aria-labelledby="why">
          <h2 id="why" className="text-lg font-semibold text-foreground">
            Why I built it
          </h2>
          <div className="mt-4 grid gap-4">
            <p>
              I originally built Transcript Desk for my work as a student assistant and now use it for my master&apos;s thesis. The goal has stayed the same: make creating, checking, and correcting transcripts less cumbersome.
            </p>
            <p>
              I could not find a tool that combined the audio and transcript in the workflow I needed. Switching between a separate text editor and audio player made proofreading AI-generated transcripts unnecessarily complicated, so I built a side-by-side workspace instead.
            </p>
          </div>
        </section>

        <section aria-labelledby="author">
          <h2 id="author" className="text-lg font-semibold text-foreground">
            Who I am
          </h2>
          <p className="mt-4">
            My name is Simon Rothgang, and I am a student from Münster, Germany. For interview transcription I have used{" "}
            <Link
              href="https://github.com/JuergenFleiss/aTrain"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              aTrain
            </Link>
            , but I still needed an efficient way to proofread and verify its generated transcripts against the source audio. Transcript Desk grew out of that practical need.
          </p>
        </section>

        <section aria-labelledby="features">
          <h2 id="features" className="text-lg font-semibold text-foreground">
            What it does
          </h2>
          <div className="mt-5 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-foreground">Audio player</h3>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5">
                <li>Displays a navigable waveform and timeline.</li>
                <li>Supports play, pause, seeking, speed, and volume controls.</li>
                <li>Copies or inserts the current playback timestamp.</li>
                <li>Keeps audio files on the local device.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Transcript editor</h3>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5">
                <li>Creates, opens, renames, saves, and exports text files.</li>
                <li>Provides line numbers, search and replace, undo, and redo.</li>
                <li>Keeps the editor usable alongside playback shortcuts.</li>
                <li>Stores saved drafts locally in the browser.</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="disclaimer">
          <h2 id="disclaimer" className="text-lg font-semibold text-foreground">
            Disclaimer
          </h2>
          <p className="mt-4">
            This application is provided as is, without warranty of any kind. The author is not responsible for inaccuracies, omissions, data loss, or the contents of transcripts created with it.
          </p>
        </section>
      </div>
    </main>
  );
}
