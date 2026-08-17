"use client";

import { Kbd } from "@/components/ui/kbd";
import { useModifierKeyLabel } from "@/lib/platform";

export function ModifierKey() {
  return useModifierKeyLabel();
}

export function ShortcutKeys({ keys, macKeys }: { keys: readonly string[]; macKeys?: readonly string[] }) {
  const modifierKey = useModifierKeyLabel();
  const visibleKeys = modifierKey === "⌘" && macKeys ? macKeys : keys;

  return visibleKeys.map((key) => <Kbd key={key}>{key === "Mod" ? modifierKey : key}</Kbd>);
}
