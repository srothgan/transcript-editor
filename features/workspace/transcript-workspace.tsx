"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@tanstack/react-hotkeys";
import {
  Download,
  FilePlus2,
  FileText,
  FolderOpen,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Timer,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AudioPlayer,
  type AudioPlayerHandle,
} from "@/features/audio-player/audio-player";
import {
  TranscriptEditor,
  type EditorHistoryState,
  type TranscriptEditorHandle,
} from "@/features/transcript-editor/transcript-editor";
import { TranscriptHistoryDialog } from "@/features/transcript-editor/transcript-history-dialog";
import { SpeakerMenu } from "@/features/speakers/speaker-menu";
import {
  loadSpeakerSettings,
  saveSpeakerSettings,
  type SpeakerDefinition,
} from "@/features/speakers/speaker-settings-store";
import {
  downloadTextFile,
  isTextFile,
  normalizeTextFileName,
} from "@/lib/file-utils";
import { formatTimestamp } from "@/lib/time-utils";
import { useModifierKeyLabel } from "@/lib/platform";
import {
  getTranscriptDraft,
  getTranscriptHistory,
  saveTranscriptDraft,
  type TranscriptRevision,
} from "@/lib/transcript-draft-store";

const INITIAL_FILE_NAME = "untitled.txt";

type PendingAction =
  | { type: "close" }
  | { type: "new" }
  | { type: "open"; file: File };

export function TranscriptWorkspace() {
  const modifierKey = useModifierKeyLabel();
  const router = useRouter();
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const editorRef = useRef<TranscriptEditorHandle>(null);
  const transcriptFileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [editorHistoryState, setEditorHistoryState] = useState<EditorHistoryState>({
    canRedo: false,
    canUndo: false,
  });
  const [editorSessionId, setEditorSessionId] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [revisions, setRevisions] = useState<TranscriptRevision[]>([]);
  const [savedContent, setSavedContent] = useState("");
  const [savedFileName, setSavedFileName] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<SpeakerDefinition[]>([]);
  const hasTranscript = fileName !== null;
  const isDirty = hasTranscript && (content !== savedContent || fileName !== savedFileName);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getTranscriptDraft(), getTranscriptHistory()])
      .then(([draft, storedRevisions]) => {
        if (!cancelled) {
          setDraftAvailable(Boolean(draft));
          setRevisions(storedRevisions);
        }
      })
      .catch(() => {
        // IndexedDB can be unavailable in hardened or private browser contexts.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSpeakers(loadSpeakerSettings()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const focusEditor = () => requestAnimationFrame(() => editorRef.current?.focus());
  const openTranscriptPicker = () => transcriptFileInputRef.current?.click();

  const createEmptyTranscript = () => {
    setContent("");
    setSavedContent("");
    setFileName(INITIAL_FILE_NAME);
    setSavedFileName(INITIAL_FILE_NAME);
    setEditorHistoryState({ canRedo: false, canUndo: false });
    setEditorSessionId((current) => current + 1);
    focusEditor();
  };

  const closeTranscript = () => {
    setContent("");
    setSavedContent("");
    setFileName(null);
    setSavedFileName(null);
    setEditorHistoryState({ canRedo: false, canUndo: false });
  };

  const exportTranscript = () => {
    if (!fileName) {
      toast.info("Create or open a transcript first.");
      return;
    }

    const normalizedName = normalizeTextFileName(fileName);
    downloadTextFile(normalizedName, content);
    toast.success(`Exported ${normalizedName}.`);
  };

  const saveTranscript = async () => {
    if (!fileName) {
      toast.info("Create or open a transcript first.");
      return;
    }

    const normalizedName = normalizeTextFileName(fileName);

    try {
      const nextRevisions = await saveTranscriptDraft({
        content,
        fileName: normalizedName,
        savedAt: new Date().toISOString(),
      });
      setFileName(normalizedName);
      setSavedFileName(normalizedName);
      setSavedContent(content);
      setDraftAvailable(true);
      setRevisions(nextRevisions);
    } catch {
      toast.error("The transcript could not be saved in this browser.");
    }
  };

  const restoreTranscriptDraft = async () => {
    try {
      const draft = await getTranscriptDraft();

      if (!draft) {
        setDraftAvailable(false);
        toast.info("No saved transcript was found.");
        return;
      }

      setContent(draft.content);
      setSavedContent(draft.content);
      setFileName(draft.fileName);
      setSavedFileName(draft.fileName);
      setEditorHistoryState({ canRedo: false, canUndo: false });
      setEditorSessionId((current) => current + 1);
      focusEditor();
    } catch {
      toast.error("The saved transcript could not be opened.");
    }
  };

  const insertTimestamp = () => {
    if (!hasTranscript) {
      toast.info("Create or open a transcript first.");
      return;
    }

    const timestamp = formatTimestamp(audioPlayerRef.current?.getCurrentTime() ?? 0);
    editorRef.current?.insertText(`[${timestamp}] `);
  };

  const jumpToTimestamp = useCallback((seconds: number) => {
    audioPlayerRef.current?.seekTo(seconds);
  }, []);

  const insertSpeaker = useCallback((speaker: SpeakerDefinition) => {
    editorRef.current?.insertSpeaker(speaker.name);
  }, []);

  const updateSpeakers = useCallback((nextSpeakers: SpeakerDefinition[]) => {
    try {
      saveSpeakerSettings(nextSpeakers);
      setSpeakers(nextSpeakers);
    } catch {
      toast.error("Speaker settings could not be saved in this browser.");
    }
  }, []);

  const restoreRevision = (revision: TranscriptRevision) => {
    setContent(revision.content);
    setFileName(revision.fileName);
    focusEditor();
  };

  const requestNewTranscript = () => {
    if (isDirty) {
      setPendingAction({ type: "new" });
      return;
    }

    createEmptyTranscript();
  };

  const requestCloseTranscript = () => {
    if (isDirty) {
      setPendingAction({ type: "close" });
      return;
    }

    closeTranscript();
  };

  const loadTranscript = async (file: File) => {
    try {
      const nextContent = (await file.text()).replace(/\r\n?|\n/g, "\n");
      setContent(nextContent);
      setSavedContent(nextContent);
      setFileName(file.name);
      setSavedFileName(file.name);
      setEditorHistoryState({ canRedo: false, canUndo: false });
      setEditorSessionId((current) => current + 1);
      toast.success(`Opened ${file.name}.`);
      focusEditor();
    } catch {
      toast.error("The transcript could not be read.");
    }
  };

  const requestOpenTranscript = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!isTextFile(file)) {
      toast.error("Choose a plain-text .txt file.");
      return;
    }

    if (isDirty) {
      setPendingAction({ type: "open", file });
      return;
    }

    void loadTranscript(file);
  };

  const confirmPendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);

    if (action?.type === "new") {
      createEmptyTranscript();
    } else if (action?.type === "close") {
      closeTranscript();
    } else if (action?.type === "open") {
      void loadTranscript(action.file);
    }
  };

  useHotkeys(
    [
      { hotkey: "Mod+S", callback: () => void saveTranscript() },
      { hotkey: "Mod+Shift+S", callback: exportTranscript },
      { hotkey: "Mod+O", callback: openTranscriptPicker },
      {
        hotkey: "Mod+Shift+O",
        callback: () => audioPlayerRef.current?.openFilePicker(),
      },
      {
        hotkey: "Mod+Enter",
        callback: () => audioPlayerRef.current?.togglePlayback(),
      },
      { hotkey: "Mod+J", callback: insertTimestamp },
      {
        hotkey: "Mod+Shift+ArrowLeft",
        callback: () => audioPlayerRef.current?.seekBy(-5),
      },
      {
        hotkey: "Mod+Shift+ArrowRight",
        callback: () => audioPlayerRef.current?.seekBy(5),
      },
      { hotkey: "Mod+/", callback: () => router.push("/docs") },
      ...speakers.flatMap((speaker) =>
        speaker.shortcut
          ? [{ hotkey: speaker.shortcut, callback: () => insertSpeaker(speaker) }]
          : [],
      ),
    ],
    {
      ignoreInputs: false,
      preventDefault: true,
      requireReset: true,
      stopPropagation: true,
    },
  );

  return (
    <div className="grid h-[calc(100dvh-3.25rem)] min-h-0 flex-none overflow-hidden bg-background">
      <main className="grid h-full min-h-0 overflow-auto lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] lg:overflow-hidden">
        <AudioPlayer ref={audioPlayerRef} />

        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-card">
          <input
            ref={transcriptFileInputRef}
            type="file"
            accept=".txt,text/plain"
            className="sr-only"
            onChange={(event) => {
              requestOpenTranscript(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b px-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {fileName ? (
                <div className="flex min-w-0 items-center gap-1.5">
                  <Input
                    aria-label="Transcript file name"
                    value={fileName}
                    size={Math.min(Math.max(fileName.length + 1, 8), 32)}
                    className="h-7 w-auto min-w-0 max-w-[min(16rem,40vw)] border-transparent bg-transparent px-1 text-sm font-medium shadow-none [field-sizing:content] hover:border-input focus-visible:border-ring"
                    onChange={(event) => setFileName(event.target.value)}
                  />
                  <Badge
                    variant={isDirty ? "secondary" : "outline"}
                    className="hidden shrink-0 text-[0.65rem] sm:inline-flex"
                  >
                    {isDirty ? "Modified" : "Saved"}
                  </Badge>
                </div>
              ) : (
                <h2 className="text-sm font-semibold">Transcript</h2>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" onClick={requestNewTranscript} />}
                >
                  <FilePlus2 />
                  <span className="sr-only">Create empty transcript</span>
                </TooltipTrigger>
                <TooltipContent>Create empty transcript</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" onClick={openTranscriptPicker} />}
                >
                  <FolderOpen />
                  <span className="sr-only">Open transcript</span>
                </TooltipTrigger>
                <TooltipContent>Open transcript</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-0.5 h-5 self-center" />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!hasTranscript}
                      onClick={() => editorRef.current?.openSearch()}
                    />
                  }
                >
                  <Search />
                  <span className="sr-only">Find and replace</span>
                </TooltipTrigger>
                <TooltipContent>Find and replace ({modifierKey} F)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!hasTranscript || !editorHistoryState.canUndo}
                      onClick={() => editorRef.current?.undo()}
                    />
                  }
                >
                  <Undo2 />
                  <span className="sr-only">Undo edit</span>
                </TooltipTrigger>
                <TooltipContent>Undo edit ({modifierKey} Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!hasTranscript || !editorHistoryState.canRedo}
                      onClick={() => editorRef.current?.redo()}
                    />
                  }
                >
                  <Redo2 />
                  <span className="sr-only">Redo edit</span>
                </TooltipTrigger>
                <TooltipContent>Redo edit ({modifierKey === "⌘" ? `${modifierKey} Shift Z` : `${modifierKey} Y`})</TooltipContent>
              </Tooltip>
              <TranscriptHistoryDialog
                disabled={!hasTranscript}
                revisions={revisions}
                onRestore={restoreRevision}
              />
              <SpeakerMenu
                disabled={!hasTranscript}
                speakers={speakers}
                onChange={updateSpeakers}
                onInsert={insertSpeaker}
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!hasTranscript}
                      onClick={insertTimestamp}
                    />
                  }
                >
                  <Timer />
                  <span className="sr-only">Insert timestamp</span>
                </TooltipTrigger>
                <TooltipContent>Insert current timestamp</TooltipContent>
              </Tooltip>
              {hasTranscript ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" onClick={requestCloseTranscript} />
                    }
                  >
                    <X />
                    <span className="sr-only">Close transcript</span>
                  </TooltipTrigger>
                  <TooltipContent>Close transcript</TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={!hasTranscript}
                      onClick={() => void saveTranscript()}
                    />
                  }
                >
                  <Save />
                  <span className="sr-only">Save transcript locally</span>
                </TooltipTrigger>
                <TooltipContent>Save locally</TooltipContent>
              </Tooltip>
              <Button size="sm" disabled={!hasTranscript} onClick={exportTranscript}>
                <Download data-icon="inline-start" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {hasTranscript ? (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">
                <TranscriptEditor
                  key={editorSessionId}
                  ref={editorRef}
                  value={content}
                  onChange={setContent}
                  onHistoryStateChange={setEditorHistoryState}
                  onJumpToTime={jumpToTimestamp}
                />
              </div>
              <footer className="flex h-7 shrink-0 items-center justify-between border-t bg-[var(--workspace-panel)] px-3 font-mono text-[0.65rem] text-muted-foreground">
                <span>{content.length.toLocaleString()} characters</span>
                <span>Plain text · UTF-8</span>
              </footer>
            </>
          ) : (
            <div className="grid min-h-0 flex-1 place-items-center p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="grid size-11 place-items-center rounded-full border bg-background">
                  <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-medium">No transcript open</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" onClick={createEmptyTranscript}>
                    <FilePlus2 data-icon="inline-start" />
                    Create empty
                  </Button>
                  <Button variant="outline" size="sm" onClick={openTranscriptPicker}>
                    <FolderOpen data-icon="inline-start" />
                    Open text file
                  </Button>
                  {draftAvailable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void restoreTranscriptDraft()}
                    >
                      <RotateCcw data-icon="inline-start" />
                      Restore saved
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current transcript has not been saved. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmPendingAction}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
