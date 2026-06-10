"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Music,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface BandCardProps {
  id: number;
  name: string;
  domainname: string;
  coverImage: string | null;
  platformCount: number;
  publishedAt?: string | null;
}

export default function BandCard({
  id,
  name,
  domainname,
  coverImage,
  platformCount,
  publishedAt,
}: BandCardProps) {
  const t = useTranslations("dashboard");
  const ts = useTranslations("stats");
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const liveUrl = `https://${domainname}.band.stream`;
  const isDraft = publishedAt === null;

  async function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore
    }
  }

  return (
    <Link href={`/dashboard/bands/${id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
        <div className="aspect-video relative bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {isDraft && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2"
            >
              {t("draft")}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>{domainname}.band.stream</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Music className="w-4 h-4" />
            <span>
              {platformCount} smartlink{platformCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-3 -mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-primary hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/dashboard/bands/${id}/smartlinks/new`);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Smartlink
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/dashboard/bands/${id}/stats`);
              }}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {ts("nav_label")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={copyLink}
              aria-label={t("copy_link")}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {!isDraft && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                aria-label={t("open_page")}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(liveUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
