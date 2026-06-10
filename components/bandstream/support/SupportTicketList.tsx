"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTicketDialog from "./CreateTicketDialog";

interface Ticket {
  id: number;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  user: { id: string; name: string | null; email: string | null };
  createdAt: string;
  messageCount: number;
  lastMessageAt: string | null;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  CLOSED: "outline",
};

interface SupportTicketListProps {
  basePath?: string;
}

export default function SupportTicketList({
  basePath = "/admin/support",
}: SupportTicketListProps) {
  const t = useTranslations("support");
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function statusLabel(status: string) {
    switch (status) {
      case "OPEN":
        return t("open");
      case "IN_PROGRESS":
        return t("in_progress");
      case "CLOSED":
        return t("closed");
      default:
        return status;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("ticket_list")}</CardTitle>
        <CreateTicketDialog onCreated={fetchTickets} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("no_tickets")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("subject")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("messages_count")}</TableHead>
                <TableHead>{t("created_at")}</TableHead>
                <TableHead>{t("last_message")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`${basePath}/${ticket.id}`)}
                >
                  <TableCell className="font-mono">{ticket.id}</TableCell>
                  <TableCell className="font-medium">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[ticket.status] || "default"}>
                      {statusLabel(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.messageCount}</TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.lastMessageAt
                      ? new Date(ticket.lastMessageAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
