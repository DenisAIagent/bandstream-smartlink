import UserOverview from "@/components/bandstream/admin/users/UserOverview";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserOverview userId={id} />;
}
