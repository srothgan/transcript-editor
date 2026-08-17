import "client-only";

import {
  isSpeakerShortcut,
  SPEAKER_SHORTCUT_OPTIONS,
  type SpeakerShortcut,
} from "@/lib/shortcuts";

const STORAGE_KEY = "transcript-desk:speakers:v1";

export type SpeakerDefinition = {
  id: string;
  name: string;
  shortcut: SpeakerShortcut | null;
};

function isSpeakerDefinition(value: unknown): value is SpeakerDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const speaker = value as Partial<SpeakerDefinition>;
  return (
    typeof speaker.id === "string" &&
    typeof speaker.name === "string" &&
    (speaker.shortcut === null || isSpeakerShortcut(speaker.shortcut))
  );
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

    return parsedValue.filter(isSpeakerDefinition).slice(0, SPEAKER_SHORTCUT_OPTIONS.length);
  } catch {
    return [];
  }
}

export function saveSpeakerSettings(speakers: SpeakerDefinition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(speakers));
}
