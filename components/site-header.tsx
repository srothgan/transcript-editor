"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
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

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-[3.25rem] shrink-0 items-center justify-between border-b bg-card px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Transcript Desk home">
          <Image
            src="/flaticon.png"
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 rounded-md"
          />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Transcript Desk</span>
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
                    href="https://github.com/srothgan/transcriptdesk"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              />
            }
          >
            <GitHubMark />
            <span className="sr-only">Open GitHub repository</span>
          </TooltipTrigger>
          <TooltipContent>GitHub repository</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
