"use client";
import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Band } from '@/types/bandstream';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import AdminAlertDialog from '@/components/bandstream/admin/AlertDialog';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BandstreamLoading from '@/components/bandstream/admin/BandstreamLoading';
import { useTranslations } from "next-intl";
export default function BandsTable() {
    const router = useRouter();

    const [bands, setBands] = useState<Band[]>([]);
    const [loading, setLoading] = useState(true);

    const ta = useTranslations('admin');
    const tc = useTranslations('common');
    const tb = useTranslations('bands');

    useEffect(() => {
        async function fetchBands() {
            try {
                const response = await fetch('/api/admin/bands');
                const data = await response.json();
                setBands(data);
            } catch (error) {
                console.error('Error fetching bands:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBands();
    }, []);

    async function deleteBand(id: string | number) {
        try {
            const res = await fetch(`/api/admin/bands?id=${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                setBands((prevBands) => prevBands.filter((band) => band.id !== Number(id)));
            } else {
                console.error('Failed to delete band:', result.error);
            }
        } catch (error) {
            console.error('Error deleting band:', error);
        }
    }

    return (
        loading ? (
            <BandstreamLoading />
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{tc('bands')}</TableHead>
                        <TableHead>{ta('domainname')}</TableHead>
                        <TableHead>{tc('platforms')}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bands.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="text-center py-12 text-muted-foreground space-y-3">
                                    <p>{tb('empty_title')}</p>
                                    <Button onClick={() => router.push('/admin/bands/create')}>
                                        {tb('empty_cta')}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {bands.map((band) => (
                        <TableRow key={band.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle h-12 w-12">
                                            <Image
                                                src={band.coverImage || '/images/bandstream/emptycover.jpg'}
                                                alt={`${band.name} cover`}
                                                width={90}
                                                height={0}
                                                className="w-16 h-auto rounded"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Link href={`/admin/bands/edit/${band.id}`} className="font-bold hover:underline">
                                            {band.name}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">{band.album}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Link href={`https://${band.domainname}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'band.stream'}`}>
                                    <span className="text-sm text-muted-foreground">{band.domainname}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'band.stream'}</span>
                                </Link>
                            </TableCell>
                            <TableCell>{band.platforms.length}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/admin/bands/edit/${band.id}`)}
                                    className="h-8 w-8"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">{tc('edit')}</span>
                                </Button>
                                <AdminAlertDialog
                                    item={band.id}
                                    dialogAction={deleteBand}
                                    title={tb('delete_confirm_title', { name: band.name })}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    )
}