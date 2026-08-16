import type { Metadata } from "next";

import { TranscriptWorkspace } from "@/features/workspace/transcript-workspace";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <TranscriptWorkspace />;
}
