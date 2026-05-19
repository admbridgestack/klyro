import { getLocale } from "next-intl/server";
import { StepStaff } from "@/components/wizard/StepStaff";

export default async function StepStaffPage() {
  const locale = await getLocale();
  return <StepStaff locale={locale} />;
}
