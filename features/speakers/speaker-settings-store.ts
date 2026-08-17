import "client-only";

const STORAGE_KEY = "transcript-desk:speakers:v1";

export type SpeakerShortcut = `Mod+Alt+${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export const SPEAKER_SHORTCUT_OPTIONS = Array.from({ length: 9 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    value: `Mod+Alt+${number}` as SpeakerShortcut,
  };
});

export type SpeakerDefinition = {
  id: string;
  name: string;
  shortcut: SpeakerShortcut | null;
};

export function isSpeakerShortcut(value: unknown): value is SpeakerShortcut {
  return SPEAKER_SHORTCUT_OPTIONS.some((option) => option.value === value);
}

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

export function getSpeakerShortcutLabel(shortcut: string | null, modifierKey: string, alternateKey: string) {
  const option = SPEAKER_SHORTCUT_OPTIONS.find((candidate) => candidate.value === shortcut);
  return option ? `${modifierKey} ${alternateKey} ${option.number}` : null;
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
