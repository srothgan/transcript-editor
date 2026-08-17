"use client";

import { useSyncExternalStore } from "react";

export type ModifierKeyLabel = "⌘" | "Ctrl";

function subscribe() {
  return () => {};
}

export function getModifierKeyLabel(): ModifierKeyLabel {
  if (typeof navigator === "undefined") {
    return "Ctrl";
  }

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform =
    (navigatorWithUserAgentData.userAgentData?.platform ?? navigator.platform) ||
    navigator.userAgent;

  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘" : "Ctrl";
}

export function useModifierKeyLabel() {
  return useSyncExternalStore(subscribe, getModifierKeyLabel, () => "Ctrl" as const);
}
