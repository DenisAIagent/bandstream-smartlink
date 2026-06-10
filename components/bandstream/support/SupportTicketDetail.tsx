"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  content: string;
  isAdmin: boolean;
  authorId: string;
  author?: { id: string; name: string | null; email: string | null };
  createdAt: string;
  readAt: string | null;
}

interface Ticket {
  id: number;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  userId: string;
  user: { id: string; name: string | null; email: string | null };
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  CLOSED: "outline",
};

interface SupportTicketDetailProps {
  ticketId: number;
  isAdmin?: boolean;
  backPath?: string;
}

export default function SupportTicketDetail({
  ticketId,
  isAdmin = false,
  backPath = "/admin/support",
}: SupportTicketDetailProps) {
  const t = useTranslations("support");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });

      if (res.ok) {
        setReply("");
        fetchTicket();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

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

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">...</div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ticket not found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={backPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back_to_list")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              #{ticket.id} — {ticket.subject}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {ticket.user.name || ticket.user.email} &middot;{" "}
              {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">{t("open")}</SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    {t("in_progress")}
                  </SelectItem>
                  <SelectItem value="CLOSED">{t("closed")}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={statusVariant[ticket.status] || "default"}>
                {statusLabel(ticket.status)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Messages thread */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto p-2">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-3 ${
                    msg.isAdmin
                      ? "bg-purple-600 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.author && (
                    <p
                      className={`text-xs font-semibold mb-1 ${
                        msg.isAdmin ? "text-purple-200" : "text-muted-foreground"
                      }`}
                    >
                      {msg.author.name || msg.author.email}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isAdmin ? "text-purple-200" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          {ticket.status !== "CLOSED" && (
            <form onSubmit={handleReply} className="flex gap-2 pt-4 border-t">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t("reply")}
                required
              />
              <Button
                type="submit"
                disabled={sending || !reply.trim()}
                className="self-end"
              >
                {sending ? "..." : t("send_reply")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
