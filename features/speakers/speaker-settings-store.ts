import "client-only";

import {
  isSpeakerShortcut,
  SPEAKER_SHORTCUT_OPTIONS,
  type SpeakerShortcut,
} from "@/lib/shortcuts";

const STORAGE_KEY = "transcript-desk:speakers:v1";
const LEGACY_SPEAKER_SHORTCUT = /^Mod\+Alt\+([1-9])$/;

export type SpeakerDefinition = {
  id: string;
  name: string;
  shortcut: SpeakerShortcut | null;
};

function parseSpeakerDefinition(value: unknown): SpeakerDefinition | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const speaker = value as { id?: unknown; name?: unknown; shortcut?: unknown };
  if (typeof speaker.id !== "string" || typeof speaker.name !== "string") {
    return null;
  }

  if (speaker.shortcut === null || isSpeakerShortcut(speaker.shortcut)) {
    return { id: speaker.id, name: speaker.name, shortcut: speaker.shortcut };
  }

  const legacyShortcut =
    typeof speaker.shortcut === "string"
      ? LEGACY_SPEAKER_SHORTCUT.exec(speaker.shortcut)?.[1]
      : undefined;

  return legacyShortcut && isSpeakerShortcut(legacyShortcut)
    ? { id: speaker.id, name: speaker.name, shortcut: legacyShortcut }
    : null;
}

export function loadSpeakerSettings() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .flatMap((value) => {
        const speaker = parseSpeakerDefinition(value);
        return speaker ? [speaker] : [];
      })
      .slice(0, SPEAKER_SHORTCUT_OPTIONS.length);
  } catch {
    return [];
  }
}

export function saveSpeakerSettings(speakers: SpeakerDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(speakers));
}
