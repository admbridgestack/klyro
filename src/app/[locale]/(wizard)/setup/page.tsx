import { StepVertical } from "@/components/wizard/StepVertical";

export default async function StepVerticalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StepVertical locale={locale} />;
}
