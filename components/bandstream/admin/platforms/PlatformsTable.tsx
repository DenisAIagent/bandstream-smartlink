'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { hasBandStreamPermission, BandStreamUserRole } from "@/lib/rbac/roles";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import {Link} from '@/i18n/routing';
import Image from 'next/image';
import { Platform } from '@/types/bandstream';
import { getPlatformIcon } from '@/components/bandstream/landingpages/PlatformIcons';
import AdminAlertDialog from '@/components/bandstream/admin/AlertDialog';

const PlatformsTable = () => {
    const ta = useTranslations('admin');
    const tc = useTranslations('common');
    const router = useRouter();
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const { theme } = useTheme();
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.role || !hasBandStreamPermission(session.user.role as BandStreamUserRole, 'OWNER')) {
            router.push('/admin');
        }
    }, [session, router]);

    useEffect(() => {
        async function fetchPlatforms() {
            try {
                const response = await fetch('/api/admin/platforms');
                const data = await response.json();
                setPlatforms(data);
            } catch (error) {
                console.error('Error fetching platforms:', error);
            }
        }
        fetchPlatforms();
    }, []);

    async function deletePlatform(id: string | number) {
        try {
            const response = await fetch(`/api/admin/platforms/?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setPlatforms((prevPlatforms) => prevPlatforms.filter((platform) => platform.id !== id));
            } else {
                console.error('Failed to delete platform');
            }
        } catch (error) {
            console.error('Error deleting platform:', error);
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{ta('platformname')}</TableHead>
                    <TableHead>{ta('platformurl')}</TableHead>
                    <TableHead>{tc('actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {platforms.map((platform) => (
                    <TableRow key={platform.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                {platform.logo ? (
                                    <Image
                                        src={platform.logo}
                                        alt=""
                                        width={90}
                                        height={0}
                                        className="w-16 h-auto rounded"
                                        style={{
                                            filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none'
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: getPlatformIcon(platform.shortname).bgColor,
                                            border: getPlatformIcon(platform.shortname).border ? '1px solid #2a2a2a' : undefined,
                                        }}
                                    >
                                        {getPlatformIcon(platform.shortname).icon}
                                    </div>
                                )}
                                <span className="font-medium">{platform.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Link href={`https://${platform.URL}`}>
                                <span className="text-sm text-muted-foreground">{platform.URL}</span>
                            </Link>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/platforms/edit/${platform.id}`)}
                                className="h-8 w-8"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">{tc('edit')}</span>
                            </Button>
                            <AdminAlertDialog
                                    item={platform.id}
                                    dialogAction={deletePlatform}
                                />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default PlatformsTable