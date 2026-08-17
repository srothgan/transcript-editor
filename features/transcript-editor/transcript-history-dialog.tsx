"use client";

import { useState } from "react";
import { History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TranscriptRevision } from "@/lib/transcript-draft-store";

type TranscriptHistoryDialogProps = {
  disabled: boolean;
  onRestore: (revision: TranscriptRevision) => void;
  revisions: TranscriptRevision[];
};

function formatRevisionDate(savedAt: string) {
  return new Date(savedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TranscriptHistoryDialog({
  disabled,
  onRestore,
  revisions,
}: TranscriptHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" disabled={disabled} aria-label="Saved history" title="Saved history" />}
      >
        <History />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Saved history</DialogTitle>
          <DialogDescription>The previous 20 locally saved versions are kept here.</DialogDescription>
        </DialogHeader>

        {revisions.length ? (
          <div className="grid max-h-[min(26rem,65vh)] gap-1.5 overflow-y-auto pr-1">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" title={revision.fileName}>
                    {revision.fileName}
                  </p>
                  <time
                    dateTime={revision.savedAt}
                    suppressHydrationWarning
                    className="mt-0.5 block font-mono text-[0.68rem] text-muted-foreground"
                  >
                    {formatRevisionDate(revision.savedAt)}
                  </time>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRestore(revision);
                    setOpen(false);
                  }}
                >
                  <RotateCcw data-icon="inline-start" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-28 place-items-center rounded-lg border border-dashed px-6 text-center text-xs text-muted-foreground">
            Older versions appear after the transcript is changed and saved again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
