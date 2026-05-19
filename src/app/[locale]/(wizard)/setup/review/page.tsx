import { StepReview } from "@/components/wizard/StepReview";

export default async function StepReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StepReview locale={locale} />;
}
