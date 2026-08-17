"use client";

import { Kbd } from "@/components/ui/kbd";
import { useModifierKeyLabel } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { getPlatformShortcutKeys, type ShortcutDisplay } from "@/lib/shortcuts";

export function ShortcutKeys({ className, shortcut }: { className?: string; shortcut: ShortcutDisplay }) {
  const modifierKey = useModifierKeyLabel();
  const visibleKeys = getPlatformShortcutKeys(shortcut, modifierKey);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {visibleKeys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </span>
  );
}
