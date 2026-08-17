"use client";

import { useState } from "react";
import { Settings2, Trash2, UserRoundPlus, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShortcutKeys } from "@/components/shortcut-keys";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SpeakerDefinition,
} from "./speaker-settings-store";
import {
  formatShortcutLabel,
  getSpeakerShortcut,
  isSpeakerShortcut,
  SPEAKER_SHORTCUT_OPTIONS,
} from "@/lib/shortcuts";
import { useModifierKeyLabel } from "@/lib/platform";

type SpeakerMenuProps = {
  disabled: boolean;
  onChange: (speakers: SpeakerDefinition[]) => void;
  onInsert: (speaker: SpeakerDefinition) => void;
  speakers: SpeakerDefinition[];
};

function normalizeSpeakerName(name: string) {
  return name.trim();
}

export function SpeakerMenu({ disabled, onChange, onInsert, speakers }: SpeakerMenuProps) {
  const modifierKey = useModifierKeyLabel();
  const [draftSpeakers, setDraftSpeakers] = useState<SpeakerDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openSettings = () => {
    const initialSpeakers = speakers.length
      ? speakers.map((speaker) => ({ ...speaker }))
      : [{ id: crypto.randomUUID(), name: "", shortcut: SPEAKER_SHORTCUT_OPTIONS[0]?.hotkey ?? null }];
    setDraftSpeakers(initialSpeakers);
    setError(null);
    setPopoverOpen(false);
    setSettingsOpen(true);
  };

  const addSpeaker = () => {
    const usedShortcuts = new Set(draftSpeakers.map((speaker) => speaker.shortcut));
    const shortcut =
      SPEAKER_SHORTCUT_OPTIONS.find((option) => !usedShortcuts.has(option.hotkey))?.hotkey ?? null;
    setDraftSpeakers((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", shortcut },
    ]);
    setError(null);
  };

  const updateSpeaker = (id: string, update: Partial<SpeakerDefinition>) => {
    setDraftSpeakers((current) =>
      current.map((speaker) => (speaker.id === id ? { ...speaker, ...update } : speaker)),
    );
    setError(null);
  };

  const saveSettings = () => {
    const normalizedSpeakers = draftSpeakers.map((speaker) => ({
      ...speaker,
      name: normalizeSpeakerName(speaker.name),
    }));

    if (normalizedSpeakers.some((speaker) => !speaker.name)) {
      setError("Every speaker needs a name.");
      return;
    }

    const normalizedNames = normalizedSpeakers.map((speaker) => speaker.name.toLocaleLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError("Speaker names must be unique.");
      return;
    }

    const shortcuts = normalizedSpeakers.flatMap((speaker) =>
      speaker.shortcut ? [speaker.shortcut] : [],
    );
    if (new Set(shortcuts).size !== shortcuts.length) {
      setError("Each shortcut can only be assigned once.");
      return;
    }

    onChange(normalizedSpeakers);
    setSettingsOpen(false);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label="Insert speaker"
              title="Speakers"
            />
          }
        >
          <UsersRound />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <PopoverHeader>
            <PopoverTitle>Insert speaker</PopoverTitle>
          </PopoverHeader>
          {speakers.length ? (
            <div className="grid gap-1">
              {speakers.map((speaker) => {
                const shortcut = getSpeakerShortcut(speaker.shortcut);
                return (
                  <Button
                    key={speaker.id}
                    variant="ghost"
                    className="h-8 justify-between px-2 font-normal"
                    onClick={() => {
                      onInsert(speaker);
                      setPopoverOpen(false);
                    }}
                  >
                    <span className="truncate">{speaker.name}</span>
                    {shortcut ? <ShortcutKeys shortcut={shortcut} /> : null}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="px-1 py-2 text-xs text-muted-foreground">No speakers configured.</p>
          )}
          <Button variant="outline" size="sm" className="justify-start" onClick={openSettings}>
            <Settings2 data-icon="inline-start" />
            Manage speakers
          </Button>
        </PopoverContent>
      </Popover>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Speaker text and shortcuts</DialogTitle>
            <DialogDescription>Configured text and shortcuts stay in this browser.</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[min(24rem,60vh)] gap-2 overflow-y-auto pr-1">
            {draftSpeakers.map((speaker) => (
              <div key={speaker.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_10.5rem_auto]">
                <Input
                  aria-label="Speaker name"
                  value={speaker.name}
                  placeholder="Interviewer:"
                  maxLength={60}
                  onChange={(event) => updateSpeaker(speaker.id, { name: event.target.value })}
                />
                <Select
                  value={speaker.shortcut ?? "none"}
                  onValueChange={(value) =>
                    updateSpeaker(speaker.id, {
                      shortcut: value && isSpeakerShortcut(value) ? value : null,
                    })
                  }
                >
                  <SelectTrigger aria-label={`Shortcut for ${speaker.name || "speaker"}`} className="col-span-2 row-start-2 w-full sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No shortcut</SelectItem>
                    {SPEAKER_SHORTCUT_OPTIONS.map((option) => {
                      const assignedElsewhere = draftSpeakers.some(
                        (candidate) =>
                          candidate.id !== speaker.id && candidate.shortcut === option.hotkey,
                      );
                      return (
                        <SelectItem key={option.hotkey} value={option.hotkey} disabled={assignedElsewhere}>
                          {formatShortcutLabel(option, modifierKey)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${speaker.name || "speaker"}`}
                  onClick={() => {
                    setDraftSpeakers((current) =>
                      current.filter((candidate) => candidate.id !== speaker.id),
                    );
                    setError(null);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={draftSpeakers.length >= SPEAKER_SHORTCUT_OPTIONS.length}
            onClick={addSpeaker}
          >
            <UserRoundPlus data-icon="inline-start" />
            Add speaker
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>Save speakers</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
