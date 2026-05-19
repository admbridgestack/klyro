import { StepMessaging } from "@/components/wizard/StepMessaging";

export default async function StepMessagingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StepMessaging locale={locale} />;
}
