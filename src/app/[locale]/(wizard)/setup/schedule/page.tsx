import { getLocale } from "next-intl/server";
import { StepSchedule } from "@/components/wizard/StepSchedule";

export default async function StepSchedulePage() {
  const locale = await getLocale();
  return <StepSchedule locale={locale} />;
}
