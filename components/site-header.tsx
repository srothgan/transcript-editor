"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitFork, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Workspace" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-[3.25rem] shrink-0 items-center justify-between border-b bg-card px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Transcript Editor home">
          <Image
            src="/flaticon.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 rounded-md"
          />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Transcript Editor</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm",
                  isActive && "bg-accent text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              />
            }
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle color theme</span>
          </TooltipTrigger>
          <TooltipContent>Toggle color theme</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a
                    href="https://github.com/srothgan/transcript-editor"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              />
            }
          >
            <GitFork />
            <span className="sr-only">Open GitHub repository</span>
          </TooltipTrigger>
          <TooltipContent>GitHub repository</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
