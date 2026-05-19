import { StepBusiness } from "@/components/wizard/StepBusiness";

export default async function StepBusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StepBusiness locale={locale} />;
}
