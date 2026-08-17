import type { ModifierKeyLabel } from "@/lib/platform";

export const SHORTCUT_GROUPS = [
  { id: "files", label: "Files" },
  { id: "playback", label: "Playback" },
  { id: "editor", label: "Editor" },
] as const;

export type ShortcutGroupId = (typeof SHORTCUT_GROUPS)[number]["id"];

export type ShortcutDisplay =
  | {
      hotkey: string;
      macHotkey?: string;
    }
  | {
      hotkey: null;
      keys: readonly string[];
    };

export type ShortcutDefinition = ShortcutDisplay & {
  description: string;
  group: ShortcutGroupId | null;
};

export const SHORTCUTS = {
  openTranscript: {
    description: "Open transcript",
    group: "files",
    hotkey: "Mod+O",
  },
  openAudio: {
    description: "Open audio",
    group: "files",
    hotkey: "Mod+Shift+O",
  },
  saveTranscript: {
    description: "Save transcript locally",
    group: "files",
    hotkey: "Mod+S",
  },
  exportTranscript: {
    description: "Export text file",
    group: "files",
    hotkey: "Mod+Shift+S",
  },
  togglePlayback: {
    description: "Play or pause",
    group: "playback",
    hotkey: "Mod+Enter",
  },
  chooseSpeaker: {
    description: "Choose speaker",
    group: "editor",
    hotkey: "Mod+Shift+Enter",
  },
  seekBackFive: {
    description: "Back five seconds",
    group: "playback",
    hotkey: "Mod+Shift+ArrowLeft",
  },
  seekForwardFive: {
    description: "Forward five seconds",
    group: "playback",
    hotkey: "Mod+Shift+ArrowRight",
  },
  insertTimestamp: {
    description: "Insert current timestamp",
    group: "playback",
    hotkey: "Mod+J",
  },
  findAndReplace: {
    description: "Find and replace",
    group: "editor",
    hotkey: "Mod+F",
  },
  undoEdit: {
    description: "Undo edit",
    group: "editor",
    hotkey: "Mod+Z",
  },
  redoEdit: {
    description: "Redo edit",
    group: "editor",
    hotkey: "Mod+Y",
    macHotkey: "Mod+Shift+Z",
  },
  openDocumentation: {
    description: "Open documentation",
    group: "editor",
    hotkey: "Mod+/",
  },
  jumpToTimestamp: {
    description: "Jump audio to timestamp",
    group: null,
    hotkey: null,
    keys: ["Mod", "Click"],
  },
} as const satisfies Record<string, ShortcutDefinition>;

export type ShortcutId = keyof typeof SHORTCUTS;

export type SpeakerShortcut = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export const SPEAKER_SHORTCUT_OPTIONS = Array.from({ length: 9 }, (_, index) => {
  const number = index + 1;
  return {
    hotkey: `${number}` as SpeakerShortcut,
    number,
  } satisfies ShortcutDisplay & { hotkey: SpeakerShortcut; number: number };
});

export function isSpeakerShortcut(value: unknown): value is SpeakerShortcut {
  return SPEAKER_SHORTCUT_OPTIONS.some((option) => option.hotkey === value);
}

export function getSpeakerShortcut(shortcut: SpeakerShortcut | null) {
  return SPEAKER_SHORTCUT_OPTIONS.find((option) => option.hotkey === shortcut) ?? null;
}

export function getPlatformShortcutKeys(shortcut: ShortcutDisplay, modifierKey: ModifierKeyLabel) {
  const isApplePlatform = modifierKey === "⌘";
  const keys = shortcut.hotkey === null
    ? shortcut.keys
    : (isApplePlatform && shortcut.macHotkey ? shortcut.macHotkey : shortcut.hotkey).split("+");

  return keys.map((key) => {
    if (key === "Mod") {
      return modifierKey;
    }
    if (key === "Alt" && isApplePlatform) {
      return "Option";
    }
    if (key === "ArrowLeft") {
      return "←";
    }
    if (key === "ArrowRight") {
      return "→";
    }
    return key;
  });
}

export function formatShortcutLabel(shortcut: ShortcutDisplay, modifierKey: ModifierKeyLabel) {
  return getPlatformShortcutKeys(shortcut, modifierKey).join(" + ");
}
