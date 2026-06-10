import SmartLinkWizard from "@/components/bandstream/wizard/SmartLinkWizard";

export default async function NewSmartLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bandId = parseInt(id, 10);

  return (
    <SmartLinkWizard
      bandId={bandId}
      apiBase="/api/dashboard"
      editBasePath="/dashboard/bands"
    />
  );
}
