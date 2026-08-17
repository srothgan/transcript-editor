import type { EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  hoverTooltip,
  showTooltip,
  type Tooltip,
} from "@codemirror/view";

import { parseTimestamp } from "@/lib/time-utils";
import { getModifierKeyLabel } from "@/lib/platform";
import { formatShortcutLabel, SHORTCUTS } from "@/lib/shortcuts";

const TIMESTAMP_PATTERN = /\[(\d{1,2}:[0-5]\d:[0-5]\d)\]/g;

type TimestampMatch = {
  from: number;
  label: string;
  seconds: number;
  to: number;
};

function findTimestampAt(state: EditorState, position: number) {
  const safePosition = Math.min(Math.max(position, 0), state.doc.length);
  const line = state.doc.lineAt(safePosition);

  TIMESTAMP_PATTERN.lastIndex = 0;
  for (const match of line.text.matchAll(TIMESTAMP_PATTERN)) {
    const index = match.index;
    const label = match[1];

    if (index === undefined || !label) {
      continue;
    }

    const from = line.from + index;
    const to = from + match[0].length;

    if (safePosition < from || safePosition > to) {
      continue;
    }

    const seconds = parseTimestamp(label);
    if (seconds === null) {
      return null;
    }

    return { from, label, seconds, to } satisfies TimestampMatch;
  }

  return null;
}

function createJumpTooltip(
  match: TimestampMatch,
  onJumpToTime: (seconds: number) => void,
): Tooltip {
  return {
    pos: match.from,
    end: match.to,
    above: true,
    arrow: false,
    create: () => {
      const dom = document.createElement("div");
      const button = document.createElement("button");
      const shortcut = document.createElement("span");

      dom.className = "cm-timestamp-jump-tooltip";
      button.type = "button";
      button.className = "cm-timestamp-jump-button";
      button.textContent = `Jump to ${match.label}`;
      button.setAttribute("aria-label", `Jump audio to ${match.label}`);
      shortcut.className = "cm-timestamp-jump-shortcut";
      shortcut.textContent = formatShortcutLabel(
        SHORTCUTS.jumpToTimestamp,
        getModifierKeyLabel(),
      );
      button.append(shortcut);
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => onJumpToTime(match.seconds));
      dom.append(button);

      return { dom };
    },
  };
}

export function timestampJumpExtension(onJumpToTime: (seconds: number) => void): Extension {
  const cursorTooltip = showTooltip.compute(["selection", "doc"], (state) => {
    const selection = state.selection.main;
    if (!selection.empty) {
      return null;
    }

    const match = findTimestampAt(state, selection.head);
    return match ? createJumpTooltip(match, onJumpToTime) : null;
  });

  const hover = hoverTooltip(
    (view, position) => {
      const cursorMatch = findTimestampAt(view.state, view.state.selection.main.head);
      const match = findTimestampAt(view.state, position);

      if (!match || (cursorMatch && cursorMatch.from === match.from)) {
        return null;
      }

      return createJumpTooltip(match, onJumpToTime);
    },
    { hoverTime: 180, hideOnChange: true },
  );

  const modifierClick = EditorView.domEventHandlers({
    mousedown(event, view) {
      if (event.button !== 0 || (!event.ctrlKey && !event.metaKey)) {
        return false;
      }

      const position = view.posAtCoords({ x: event.clientX, y: event.clientY });
      const match = position === null ? null : findTimestampAt(view.state, position);

      if (!match) {
        return false;
      }

      event.preventDefault();
      onJumpToTime(match.seconds);
      return true;
    },
  });

  return [cursorTooltip, hover, modifierClick];
}
