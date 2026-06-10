import ArtistSpace from "@/components/bandstream/dashboard/ArtistSpace";

export default async function DashboardArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bandId = parseInt(id, 10);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <ArtistSpace bandId={bandId} />
    </div>
  );
}
