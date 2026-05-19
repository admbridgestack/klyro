"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const COUNTDOWN_SECONDS = 4;

export function DoneRedirect({
  locale,
  ctaLabel,
  redirectTemplate,
}: {
  locale: string;
  ctaLabel: string;
  redirectTemplate: string;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      router.push(`/${locale}/dashboard`);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, locale, router]);

  const label = redirectTemplate.replace("{seconds}", String(seconds));

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <Button
        onClick={() => router.push(`/${locale}/dashboard`)}
        className="bg-[var(--color-violet)] text-white hover:opacity-90"
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
