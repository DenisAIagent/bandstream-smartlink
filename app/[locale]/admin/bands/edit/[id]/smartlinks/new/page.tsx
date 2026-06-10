import SmartLinkWizard from "@/components/bandstream/wizard/SmartLinkWizard";

export default async function AdminNewSmartLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SmartLinkWizard
      bandId={parseInt(id, 10)}
      apiBase="/api/admin"
      editBasePath="/admin/bands/edit"
    />
  );
}
