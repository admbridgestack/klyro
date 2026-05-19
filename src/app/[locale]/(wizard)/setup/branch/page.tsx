import { getLocale } from "next-intl/server";
import { StepBranch } from "@/components/wizard/StepBranch";

export default async function StepBranchPage() {
  const locale = await getLocale();
  return <StepBranch locale={locale} />;
}
