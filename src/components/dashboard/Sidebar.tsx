"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Scissors,
  Settings,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "agenda", href: "/agenda", icon: Calendar },
  { key: "team", href: "/team", icon: Users },
  { key: "branches", href: "/branches", icon: MapPin },
  { key: "services", href: "/services", icon: Scissors },
  { key: "links", href: "/links", icon: LinkIcon },
  { key: "settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  locale: string;
  userEmail?: string;
  userInitial?: string;
}

function NavLinks({ locale, closeSheet }: { locale: string; closeSheet?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
        const fullHref = `/${locale}${href}`;
        const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);
        return (
          <Link
            key={key}
            href={fullHref}
            onClick={closeSheet}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-violet)]/15 text-[var(--color-violet-soft)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-[var(--color-violet-soft)]" : ""
              )}
            />
            {t(key as Parameters<typeof t>[0])}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  locale,
  userEmail,
  userInitial,
  closeSheet,
}: SidebarProps & { closeSheet?: () => void }) {
  const t = useTranslations("dashboard.nav");

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Logo */}
      <div className="flex h-14 items-center px-1">
        <Logo variant="lockup" theme="dark" className="h-7" />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <NavLinks locale={locale} closeSheet={closeSheet} />
      </div>

      {/* User + logout */}
      <div className="border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-violet)]/20 text-xs font-bold text-[var(--color-violet-soft)]">
            {userInitial ?? "?"}
          </div>
          <span className="flex-1 truncate text-xs text-[var(--color-text-muted)]">
            {userEmail}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label={t("signOut")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ locale, userEmail, userInitial }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="flex h-14 items-center border-b border-[var(--border-subtle)] bg-[var(--color-bg-surface)] px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--color-text-muted)]"
              />
            }
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-r border-[var(--border-subtle)] bg-[var(--color-bg-surface)] p-0"
          >
            <SidebarContent
              locale={locale}
              userEmail={userEmail}
              userInitial={userInitial}
              closeSheet={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="ml-3">
          <Logo variant="lockup" theme="dark" className="h-6" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--color-bg-surface)] lg:flex lg:flex-col">
        <SidebarContent
          locale={locale}
          userEmail={userEmail}
          userInitial={userInitial}
        />
      </aside>
    </>
  );
}
