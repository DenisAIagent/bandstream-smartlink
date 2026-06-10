import SmartLinkEditForm from "@/components/bandstream/dashboard/smartlinks/SmartLinkEditForm";

export default async function SmartLinkEditPage({
  params,
}: {
  params: Promise<{ id: string; smartlinkId: string }>;
}) {
  const { smartlinkId } = await params;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <SmartLinkEditForm smartLinkId={parseInt(smartlinkId, 10)} />
    </div>
  );
}
