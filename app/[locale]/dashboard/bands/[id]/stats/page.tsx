import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifyBandOwnership } from "@/lib/auth/ownership";
import BandStatsView from "@/components/bandstream/dashboard/stats/BandStatsView";

export default async function BandStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bandId = parseInt(id, 10);

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || !(await verifyBandOwnership(userId, bandId))) {
    redirect("/dashboard");
  }

  const band = await prisma.band.findUnique({
    where: { id: bandId },
    select: { name: true },
  });

  if (!band) {
    redirect("/dashboard");
  }

  return <BandStatsView bandId={bandId} bandName={band.name} />;
}
