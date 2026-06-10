"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Music, Trash2 } from "lucide-react";
import debounce from "lodash/debounce";
import AddPlatformDialog from "@/components/bandstream/shared/AddPlatformDialog";

interface Platform {
  id: number;
  platformId: number;
  customURL: string;
  platform: {
    id: number;
    name: string;
    logo: string | null;
    shortname: string;
  };
}

interface Band {
  id: number;
  name: string;
  domainname: string;
  album: string | null;
  coverImage: string | null;
  musicSample: string | null;
  trackingGTM: string | null;
  trackingGTAG: string | null;
  trackingMeta: string | null;
  ticketingURL: string | null;
  nextEventDate: string | null;
  nextEventType: string | null;
  nextEventLocation: string | null;
  platforms: Platform[];
}

interface FieldStatus {
  [key: string]: boolean;
}

interface BandEditFormProps {
  bandId: number;
}

export default function BandEditForm({ bandId }: BandEditFormProps) {
  const t = useTranslations("dashboard");
  const tb = useTranslations("bands");
  const tc = useTranslations("common");
  const tw = useTranslations("wizard");
  const [band, setBand] = useState<Band | null>(null);
  const [savedFields, setSavedFields] = useState<FieldStatus>({});
  const [loading, setLoading] = useState(true);
  const [deletingPlatform, setDeletingPlatform] = useState<number | null>(null);

  const fetchBand = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/bands/${bandId}`);
      if (res.ok) {
        const data = await res.json();
        setBand(data);
      }
    } catch (error) {
      console.error("Error fetching band:", error);
    } finally {
      setLoading(false);
    }
  }, [bandId]);

  useEffect(() => {
    fetchBand();
  }, [fetchBand]);

  const deletePlatform = async (platformId: number) => {
    try {
      const res = await fetch(
        `/api/dashboard/bands/${bandId}/platforms/${platformId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setBand((prev) =>
          prev
            ? { ...prev, platforms: prev.platforms.filter((p) => p.platformId !== platformId) }
            : prev
        );
        toast({ title: t("saved"), description: t("platform_deleted") });
      } else {
        toast({ title: tc("error"), description: tc("error"), variant: "destructive" });
      }
    } catch {
      toast({ title: tc("error"), description: tc("error"), variant: "destructive" });
    } finally {
      setDeletingPlatform(null);
    }
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (field: string, value: string, id: number) => {
        try {
          const response = await fetch(`/api/dashboard/bands/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
          });

          if (response.ok) {
            setSavedFields((prev) => ({ ...prev, [field]: true }));
            setTimeout(() => {
              setSavedFields((prev) => ({ ...prev, [field]: false }));
            }, 1000);
            toast({
              title: t("saved"),
              description: t("field_updated"),
              duration: 2000,
            });
          } else {
            throw new Error("Failed to update");
          }
        } catch (error) {
          console.error("Error updating band:", error);
          toast({
            title: t("error"),
            description: t("field_update_failed"),
            variant: "destructive",
          });
        }
      }, 2000),
    [t]
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const updateField = (
    field: string,
    value: string,
    immediate: boolean = false
  ) => {
    if (!band) return;
    setBand((prev) => (prev ? { ...prev, [field]: value } : null));

    if (immediate) {
      debouncedUpdate.cancel();
      fetch(`/api/dashboard/bands/${bandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
        .then((response) => {
          if (response.ok) {
            setSavedFields((prev) => ({ ...prev, [field]: true }));
            setTimeout(() => {
              setSavedFields((prev) => ({ ...prev, [field]: false }));
            }, 1000);
            toast({
              title: t("saved"),
              description: t("field_updated"),
              duration: 2000,
            });
          } else {
            throw new Error("Failed to update");
          }
        })
        .catch((error) => {
          console.error("Error updating band:", error);
          toast({
            title: t("error"),
            description: t("field_update_failed"),
            variant: "destructive",
          });
        });
    } else {
      debouncedUpdate(field, value, bandId);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">...</div>
    );
  }

  if (!band) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("band_not_found")}
      </div>
    );
  }

  const savedClass = (field: string) =>
    savedFields[field]
      ? "bg-green-100 dark:bg-green-900 transition-colors"
      : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back_to_artists")}
          </Button>
        </Link>
        <div className="ml-auto">
          <a
            href={`https://${band.domainname}.band.stream`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("preview")}
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("edit_artist")}: {band.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal">
            {tw("autosave_hint")}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="info">{tb("bandinfo")}</TabsTrigger>
              <TabsTrigger value="platforms">{tb("platforms")}</TabsTrigger>
              <TabsTrigger value="events">{t("events")}</TabsTrigger>
              <TabsTrigger value="tracking">{tb("trackinginfo")}</TabsTrigger>
            </TabsList>

            {/* Band Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="name">{tb("bandname")}</Label>
                      <Input
                        id="name"
                        value={band.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        onBlur={(e) =>
                          updateField("name", e.target.value, true)
                        }
                        className={savedClass("name")}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="album">{tb("albumname")}</Label>
                      <Input
                        id="album"
                        value={band.album || ""}
                        onChange={(e) => updateField("album", e.target.value)}
                        onBlur={(e) =>
                          updateField("album", e.target.value, true)
                        }
                        className={savedClass("album")}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="domainname">{t("subdomain")}</Label>
                      <Input
                        id="domainname"
                        value={band.domainname || ""}
                        onChange={(e) =>
                          updateField("domainname", e.target.value)
                        }
                        onBlur={(e) =>
                          updateField("domainname", e.target.value, true)
                        }
                        className={savedClass("domainname")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {tb("albumcover")}
                    </h3>
                    {band.coverImage ? (
                      <Image
                        src={band.coverImage}
                        alt="Band Cover"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] bg-muted rounded-lg flex items-center justify-center">
                        <Music className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {band.musicSample && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {tb("musicsample")}
                      </h3>
                      <audio controls className="w-full">
                        <source src={band.musicSample} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-4">
              <div className="flex justify-end">
                <AddPlatformDialog
                  apiPath={`/api/dashboard/bands/${bandId}/platforms`}
                  existingPlatformIds={band.platforms.map((p) => p.platformId)}
                  onAdded={(updated) => setBand(updated as Band)}
                />
              </div>
              {band.platforms.length === 0 ? (
                <p className="text-muted-foreground">{t("no_platforms")}</p>
              ) : (
                <div className="space-y-3">
                  {band.platforms.map((bp) => (
                    <div
                      key={bp.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="font-medium min-w-[120px]">
                        {bp.platform.name}
                      </div>
                      <a
                        href={bp.customURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate flex-1"
                      >
                        {bp.customURL}
                      </a>
                      {deletingPlatform === bp.platformId ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePlatform(bp.platformId)}
                          >
                            {tc("confirm")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingPlatform(null)}
                          >
                            {tc("cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPlatform(bp.platformId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label htmlFor="ticketingURL">{t("ticketing_url")}</Label>
                  <Input
                    id="ticketingURL"
                    value={band.ticketingURL || ""}
                    onChange={(e) =>
                      updateField("ticketingURL", e.target.value)
                    }
                    onBlur={(e) =>
                      updateField("ticketingURL", e.target.value, true)
                    }
                    placeholder="https://"
                    className={savedClass("ticketingURL")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="nextEventDate">{t("next_event_date")}</Label>
                  <Input
                    id="nextEventDate"
                    type="date"
                    value={
                      band.nextEventDate
                        ? band.nextEventDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateField(
                        "nextEventDate",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : ""
                      )
                    }
                    onBlur={(e) =>
                      updateField(
                        "nextEventDate",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : "",
                        true
                      )
                    }
                    className={savedClass("nextEventDate")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="nextEventType">{t("next_event_type")}</Label>
                  <Select
                    value={band.nextEventType || ""}
                    onValueChange={(value) => updateField("nextEventType", value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_event_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONCERT">{tc("EVENT_CONCERT")}</SelectItem>
                      <SelectItem value="SHOW">{tc("EVENT_SHOW")}</SelectItem>
                      <SelectItem value="FESTIVAL">{tc("EVENT_FESTIVAL")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="nextEventLocation">
                    {t("next_event_location")}
                  </Label>
                  <Input
                    id="nextEventLocation"
                    value={band.nextEventLocation || ""}
                    onChange={(e) =>
                      updateField("nextEventLocation", e.target.value)
                    }
                    onBlur={(e) =>
                      updateField("nextEventLocation", e.target.value, true)
                    }
                    placeholder={t("enter_location")}
                    className={savedClass("nextEventLocation")}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-4">
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label htmlFor="trackingGTAG">GTAG</Label>
                  <Input
                    id="trackingGTAG"
                    value={band.trackingGTAG || ""}
                    onChange={(e) =>
                      updateField("trackingGTAG", e.target.value)
                    }
                    onBlur={(e) =>
                      updateField("trackingGTAG", e.target.value, true)
                    }
                    placeholder={tb("entergtag")}
                    className={savedClass("trackingGTAG")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="trackingGTM">GTM</Label>
                  <Input
                    id="trackingGTM"
                    value={band.trackingGTM || ""}
                    onChange={(e) =>
                      updateField("trackingGTM", e.target.value)
                    }
                    onBlur={(e) =>
                      updateField("trackingGTM", e.target.value, true)
                    }
                    placeholder={tb("entergtm")}
                    className={savedClass("trackingGTM")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="trackingMeta">Meta Pixel</Label>
                  <Input
                    id="trackingMeta"
                    value={band.trackingMeta || ""}
                    onChange={(e) =>
                      updateField("trackingMeta", e.target.value)
                    }
                    onBlur={(e) =>
                      updateField("trackingMeta", e.target.value, true)
                    }
                    placeholder={tb("entermeta")}
                    className={savedClass("trackingMeta")}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
