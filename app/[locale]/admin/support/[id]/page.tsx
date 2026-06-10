import SupportTicketDetail from "@/components/bandstream/support/SupportTicketDetail";

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticketId = parseInt(id, 10);

  return (
    <div className="p-8">
      <SupportTicketDetail
        ticketId={ticketId}
        isAdmin={true}
        backPath="/admin/support"
      />
    </div>
  );
}
