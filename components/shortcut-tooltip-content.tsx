"use client";

import { ShortcutKeys } from "@/components/shortcut-keys";
import { TooltipContent } from "@/components/ui/tooltip";
import type { ShortcutDefinition } from "@/lib/shortcuts";

export function ShortcutTooltipContent({ shortcut }: { shortcut: ShortcutDefinition }) {
  return (
    <TooltipContent>
      <span>{shortcut.description}</span>
      <ShortcutKeys shortcut={shortcut} />
    </TooltipContent>
  );
}
