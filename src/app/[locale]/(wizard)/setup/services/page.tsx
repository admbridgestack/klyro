import { getLocale } from "next-intl/server";
import { StepServices } from "@/components/wizard/StepServices";

export default async function StepServicesPage() {
  const locale = await getLocale();
  return <StepServices locale={locale} />;
}
