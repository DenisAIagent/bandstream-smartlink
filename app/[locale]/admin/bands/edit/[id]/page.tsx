"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Trash2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import PeopleSearch from '@/components/bandstream/admin/forms/PeopleSearch';
import TemplatePicker from '@/components/bandstream/admin/forms/TemplatePicker';
import AddPlatformDialog from '@/components/bandstream/shared/AddPlatformDialog';
import SmartLinksPanel from '@/components/bandstream/dashboard/smartlinks/SmartLinksPanel';
import debounce from 'lodash/debounce';

interface Band {
    id: number;
    name: string;
    domainname: string;
    album: string;
    coverImage: string;
    musicSample: string;
    trackingGTM: string;
    trackingGTAG: string;
    template: string;
    platforms: { platformId: number; customURL: string; platformName: string; platform?: { name: string; shortname: string } }[];
}

interface AutofillSummary {
    linksCreated: string[];
    linksSkipped: string[];
    platformsCreated: string[];
    albumUpdated: boolean;
    coverUpdated: boolean;
}

interface FieldStatus {
    [key: string]: boolean;
}

interface BandMember {
    id: number;
    userId: string;
    bandId: number;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export default function EditBand() {
    const params = useParams();
    const id = params?.id;
    const { data: session } = useSession();
    const tt = useTranslations('teams');
    const tb = useTranslations('bands');
    const [band, setBand] = useState<Band | null>(null);
    const [savedFields, setSavedFields] = useState<FieldStatus>({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [autofillUrl, setAutofillUrl] = useState('');
    const [autofilling, setAutofilling] = useState(false);
    const [members, setMembers] = useState<BandMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const fetchBand = async () => {
        if (!id) return;
        const bandResponse = await fetch(`/api/admin/bands/${id}`);
        if (bandResponse.ok) {
            const data = await bandResponse.json();
            setBand(data);
        }
    };

    const fetchMembers = useCallback(async () => {
        if (!id) return;
        setLoadingMembers(true);
        try {
            const response = await fetch(`/api/admin/bands/${id}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoadingMembers(false);
        }
    }, [id]);

    const [deletingPlatform, setDeletingPlatform] = useState<number | null>(null);

    const deletePlatform = async (platformId: number) => {
        try {
            const res = await fetch(`/api/admin/bands/${id}/platforms/${platformId}`, { method: 'DELETE' });
            if (res.ok) {
                setBand((prev) =>
                    prev ? { ...prev, platforms: prev.platforms.filter((p) => p.platformId !== platformId) } : prev
                );
                toast({ title: 'Supprimé', description: 'Plateforme supprimée' });
            } else {
                toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
        } finally {
            setDeletingPlatform(null);
        }
    };

    useEffect(() => {
        fetchBand();
        fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const callerRole = useMemo(() => {
        if (!session?.user?.id || members.length === 0) return null;
        const callerMember = members.find(m => m.user.id === session.user!.id);
        return callerMember?.role ?? null;
    }, [session, members]);

    const handleAddMember = async (user: { id: string; name: string | null; email: string; image: string | null }) => {
        if (!id) return;
        try {
            const response = await fetch(`/api/admin/bands/${id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, role: 'MEMBER' }),
            });

            if (response.status === 409) {
                toast({
                    title: "Info",
                    description: tt('alreadyMember'),
                    duration: 2000,
                });
                return;
            }

            if (response.ok) {
                toast({
                    title: "Success",
                    description: tt('addedMember'),
                    duration: 2000,
                });
                await fetchMembers();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add member');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add member",
                variant: "destructive",
            });
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
        if (!id) return;
        try {
            const response = await fetch(`/api/admin/bands/${id}/members/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: tt('roleUpdated'),
                    duration: 2000,
                });
                await fetchMembers();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update role",
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!id) return;
        try {
            const response = await fetch(`/api/admin/bands/${id}/members/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: tt('removedMember'),
                    duration: 2000,
                });
                await fetchMembers();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to remove member",
                variant: "destructive",
            });
        }
    };

    const handleAutofill = async () => {
        if (!id || !autofillUrl.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez entrer un lien vers une plateforme de streaming",
                variant: "destructive",
            });
            return;
        }

        setAutofilling(true);
        try {
            const response = await fetch(`/api/admin/bands/${id}/autofill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: autofillUrl.trim() }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Autofill failed');
            }

            const data = await response.json();
            const summary: AutofillSummary = data.summary;

            // Refresh band data
            await fetchBand();
            setAutofillUrl('');

            // Build success message
            const parts: string[] = [];
            if (summary.linksCreated.length > 0) {
                parts.push(`${summary.linksCreated.length} lien(s) ajouté(s)`);
            }
            if (summary.linksSkipped.length > 0) {
                parts.push(`${summary.linksSkipped.length} lien(s) existant(s) conservé(s)`);
            }
            if (summary.albumUpdated) {
                parts.push('album mis à jour');
            }
            if (summary.coverUpdated) {
                parts.push('pochette mise à jour');
            }

            toast({
                title: "Auto-remplissage terminé",
                description: parts.join(', ') || 'Aucune modification',
                duration: 5000,
            });
        } catch (error) {
            console.error('Autofill error:', error);
            const raw = error instanceof Error ? error.message : '';
            const description = raw === 'unresolvable_url'
                ? "Ce lien n'a pas pu être résolu. Utilise un lien vers un titre ou un album — les pages artistes ne sont pas supportées par Songlink."
                : "L'auto-remplissage a échoué. Réessaie dans quelques instants.";
            toast({
                title: "Auto-remplissage impossible",
                description,
                variant: "destructive",
            });
        } finally {
            setAutofilling(false);
        }
    };

    const debouncedUpdate = useMemo(
        () =>
            debounce(async (field: string, value: string, bandId: string) => {
                try {
                    const response = await fetch(`/api/admin/bands/${bandId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ [field]: value }),
                    });

                    if (response.ok) {
                        // Show success animation
                        setSavedFields(prev => ({ ...prev, [field]: true }));
                        setTimeout(() => {
                            setSavedFields(prev => ({ ...prev, [field]: false }));
                        }, 1000);

                        // Update local state
                        setBand(prev => prev ? { ...prev, [field]: value } : null);
                        
                        toast({
                            title: "Success",
                            description: "Field updated successfully",
                            duration: 2000,
                        });
                    } else {
                        throw new Error('Failed to update');
                    }
                } catch (error) {
                    console.error('Error updating band:', error);
                    toast({
                        title: "Error",
                        description: "Failed to update field",
                        variant: "destructive",
                    });
                }
            }, 2000),
        []
    );

    // Clean up the debounced function when component unmounts
    useEffect(() => {
        return () => {
            debouncedUpdate.cancel();
        };
    }, [debouncedUpdate]);

    const updateField = (field: string, value: string, immediate: boolean = false) => {
        if (!band || !id) return;
        // Immediately update the local state for a responsive feel
        setBand(prev => prev ? { ...prev, [field]: value } : null);
        
        if (immediate) {
            // Cancel any pending debounced updates
            debouncedUpdate.cancel();
            // Perform the update immediately
            fetch(`/api/admin/bands/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: value }),
            })
            .then(response => {
                if (response.ok) {
                    setSavedFields(prev => ({ ...prev, [field]: true }));
                    setTimeout(() => {
                        setSavedFields(prev => ({ ...prev, [field]: false }));
                    }, 1000);
                    toast({
                        title: "Success",
                        description: "Field updated successfully",
                        duration: 2000,
                    });
                } else {
                    throw new Error('Failed to update');
                }
            })
            .catch(error => {
                console.error('Error updating band:', error);
                toast({
                    title: "Error",
                    description: "Failed to update field",
                    variant: "destructive",
                });
            });
        } else {
            // Trigger the debounced update
            debouncedUpdate(field, value, id.toString());
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`/api/admin/bands/${id}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const updatedBand = await response.json();
                setBand(updatedBand);
                toast({
                    title: "Success",
                    description: "Cover image updated successfully",
                    duration: 2000,
                });
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setUploadingImage(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        // Client-side duration check via Web Audio API
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            await audioContext.close();

            if (audioBuffer.duration > 30) {
                toast({
                    title: "Error",
                    description: `Audio is too long (${Math.round(audioBuffer.duration)}s). Maximum duration is 30 seconds.`,
                    variant: "destructive",
                });
                if (audioInputRef.current) audioInputRef.current.value = '';
                return;
            }
        } catch {
            // If client-side check fails, let the server validate
        }

        setUploadingAudio(true);
        try {
            const formData = new FormData();
            formData.append('audio', file);

            const response = await fetch(`/api/admin/bands/${id}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const updatedBand = await response.json();
                setBand(updatedBand);
                toast({
                    title: "Success",
                    description: "Music sample updated successfully",
                    duration: 2000,
                });
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload audio');
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload audio",
                variant: "destructive",
            });
        } finally {
            setUploadingAudio(false);
            if (audioInputRef.current) audioInputRef.current.value = '';
        }
    };

    if (!band) {
        return <p>Loading...</p>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{tb('editbandtitle', { name: band.name })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="smartlinks" className="w-full">
                        <TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-5">
                            <TabsTrigger value="smartlinks">Smartlinks</TabsTrigger>
                            <TabsTrigger value="info">{tb('bandinfo')}</TabsTrigger>
                            <TabsTrigger value="platforms">{tb('platforms')}</TabsTrigger>
                            <TabsTrigger value="appearance">{tb('appearance')}</TabsTrigger>
                            <TabsTrigger value="team">{tb('team')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="smartlinks" className="space-y-4">
                            <SmartLinksPanel
                                bandId={band.id}
                                domainname={band.domainname}
                                apiBase="/api/admin"
                                editBasePath="/admin/bands/edit"
                            />
                        </TabsContent>

                        <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-4">{tb('basicinfo')}</h3>

                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="name">{tb('bandname')}</Label>
                                            <Input
                                                id="name"
                                                value={band.name || ''}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                onBlur={(e) => updateField('name', e.target.value, true)}
                                                className={`${savedFields.name ? 'bg-green-100 dark:bg-green-900 transition-colors' : ''}`}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="album">{tb('album')}</Label>
                                            <Input
                                                id="album"
                                                value={band.album || ''}
                                                onChange={(e) => updateField('album', e.target.value)}
                                                onBlur={(e) => updateField('album', e.target.value, true)}
                                                className={`${savedFields.album ? 'bg-green-100 dark:bg-green-900 transition-colors' : ''}`}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="domainname">{tb('subdomain')}</Label>
                                            <Input
                                                id="domainname"
                                                value={band.domainname || ''}
                                                onChange={(e) => updateField('domainname', e.target.value)}
                                                onBlur={(e) => updateField('domainname', e.target.value, true)}
                                                className={`${savedFields.domainname ? 'bg-green-100 dark:bg-green-900 transition-colors' : ''}`}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="trackingGTAG">{tb('gtag')}</Label>
                                            <Input
                                                id="trackingGTAG"
                                                value={band.trackingGTAG || ''}
                                                onChange={(e) => updateField('trackingGTAG', e.target.value)}
                                                onBlur={(e) => updateField('trackingGTAG', e.target.value, true)}
                                                className={`${savedFields.trackingGTAG ? 'bg-green-100 dark:bg-green-900 transition-colors' : ''}`}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="trackingGTM">{tb('gtm')}</Label>
                                            <Input
                                                id="trackingGTM"
                                                value={band.trackingGTM || ''}
                                                onChange={(e) => updateField('trackingGTM', e.target.value)}
                                                onBlur={(e) => updateField('trackingGTM', e.target.value, true)}
                                                className={`${savedFields.trackingGTM ? 'bg-green-100 dark:bg-green-900 transition-colors' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{tb('albumcover')}</h3>
                                        {band.coverImage && (
                                            <Image
                                                src={band.coverImage}
                                                alt="Band Cover"
                                                width={200}
                                                height={200}
                                                className="rounded-lg"
                                            />
                                        )}
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            disabled={uploadingImage}
                                            onClick={() => imageInputRef.current?.click()}
                                        >
                                            {uploadingImage ? tb('uploading') : tb('changeBtn')}
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{tb('musicsample')}</h3>
                                        {band.musicSample && (
                                            <audio controls className="w-full" key={band.musicSample}>
                                                <source src={band.musicSample} type="audio/mpeg" />
                                            </audio>
                                        )}
                                        <input
                                            ref={audioInputRef}
                                            type="file"
                                            accept="audio/mpeg"
                                            className="hidden"
                                            onChange={handleAudioUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            disabled={uploadingAudio}
                                            onClick={() => audioInputRef.current?.click()}
                                        >
                                            {uploadingAudio ? tb('uploading') : tb('changeBtn')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="platforms" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Auto-remplir les liens</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Collez un lien Spotify, Apple Music, Deezer ou autre plateforme de streaming.
                                        Les liens vers toutes les autres plateformes seront automatiquement remplis.
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://open.spotify.com/album/... ou tout autre lien"
                                            value={autofillUrl}
                                            onChange={(e) => setAutofillUrl(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAutofill();
                                            }}
                                            disabled={autofilling}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleAutofill}
                                            disabled={autofilling || !autofillUrl.trim()}
                                        >
                                            {autofilling ? 'Recherche en cours...' : 'Auto-remplir les liens'}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Powered by Songlink/Odesli. Les liens existants ne seront pas écrasés.
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <AddPlatformDialog
                                        apiPath={`/api/admin/bands/${band.id}/platforms`}
                                        existingPlatformIds={(band.platforms ?? []).map((bp) => bp.platformId)}
                                        onAdded={() => fetchBand()}
                                    />
                                </div>

                                {band.platforms && band.platforms.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Liens actuels</h3>
                                        <div className="space-y-2">
                                            {band.platforms.map((bp) => (
                                                <div key={bp.platformId} className="flex items-center gap-3 p-2 rounded border">
                                                    <span className="font-medium min-w-[120px]">
                                                        {bp.platform?.name || bp.platformName || `Platform ${bp.platformId}`}
                                                    </span>
                                                    <a
                                                        href={bp.customURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1"
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
                                                                Confirmer
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeletingPlatform(null)}
                                                            >
                                                                Annuler
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
                                    </div>
                                )}

                                {(!band.platforms || band.platforms.length === 0) && (
                                    <p className="text-muted-foreground">Aucun lien de plateforme. Utilisez l&apos;auto-remplissage ci-dessus pour commencer.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-4">
                            <h3 className="text-lg font-semibold mb-2">{tb('appearance')}</h3>
                            <TemplatePicker bandId={band.id} initialTemplate={band.template ?? 'obsidian'} />
                        </TabsContent>

                        <TabsContent value="team">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {tt('teammembers')}
                                </h3>

                                {(callerRole === 'OWNER' || callerRole === 'ADMIN') && (
                                    <PeopleSearch onUserSelect={handleAddMember} />
                                )}

                                {loadingMembers ? (
                                    <p className="text-sm text-muted-foreground">Loading...</p>
                                ) : (
                                    <div className="space-y-3">
                                        {members.map((member) => {
                                            const isCurrentUser = session?.user?.id === member.user.id;
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={member.user.image || undefined}
                                                                alt={member.user.name || ''}
                                                            />
                                                            <AvatarFallback>
                                                                {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {member.user.name || 'No name'}
                                                                {isCurrentUser && (
                                                                    <span className="text-muted-foreground ml-1">({tt('you')})</span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {member.user.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {member.role === 'OWNER' && (
                                                            <Badge className="bg-green-600 hover:bg-green-700">
                                                                {tt('owner')}
                                                            </Badge>
                                                        )}
                                                        {member.role === 'ADMIN' && (
                                                            <Badge className="bg-blue-600 hover:bg-blue-700">
                                                                {tt('admin')}
                                                            </Badge>
                                                        )}
                                                        {member.role === 'MEMBER' && (
                                                            <Badge variant="secondary">
                                                                {tt('member')}
                                                            </Badge>
                                                        )}

                                                        {callerRole === 'OWNER' && member.role !== 'OWNER' && (
                                                            <>
                                                                <select
                                                                    value={member.role}
                                                                    onChange={(e) =>
                                                                        handleRoleChange(
                                                                            member.user.id,
                                                                            e.target.value as 'ADMIN' | 'MEMBER'
                                                                        )
                                                                    }
                                                                    className="bg-background border rounded-md px-2 py-1 text-sm min-w-[120px]"
                                                                >
                                                                    <option value="ADMIN">{tt('admin')}</option>
                                                                    <option value="MEMBER">{tt('member')}</option>
                                                                </select>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveMember(member.user.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}