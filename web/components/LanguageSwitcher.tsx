"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_CODES } from "@/lib/locales.mjs";

function swapLocale(pathname: string, target: string) {
  const parts = pathname.split("/");
  if (LOCALE_CODES.includes(parts[1])) parts[1] = target;
  else parts.splice(1, 0, target);
  return parts.join("/") || `/${target}`;
}

// Remember an explicit language pick so the "/" auto-redirect honors it next
// time instead of re-guessing from Accept-Language. 1 year, site-wide, Lax.
function rememberLocale(code: string) {
  document.cookie = `locale=${code};path=/;max-age=31536000;samesite=lax`;
}

export function LanguageSwitcher({ current }: { current: string }) {
  const pathname = usePathname() || `/${current}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" aria-label="Language" className="border-2 border-border"><Languages className="h-[1.1rem] w-[1.1rem]" /></Button>}
      />
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l.code} render={<Link href={swapLocale(pathname, l.code)} onClick={() => rememberLocale(l.code)} />} className={l.code === current ? "font-semibold" : ""}>
            {l.endonym}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
