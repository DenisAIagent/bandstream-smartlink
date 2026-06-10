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
import { UserInvite } from '@/types/invites';
import {Link} from '@/i18n/routing';
import AdminAlertDialog from '@/components/bandstream/admin/AlertDialog';
import BandstreamLoading from '@/components/bandstream/admin/BandstreamLoading';
import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Ban } from 'lucide-react';

export default function BetaInvitesTable() {
    const [invites, setInvites] = useState<UserInvite[]>([]);
    const [loading, setLoading] = useState(true);

    const to = useTranslations('owner');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch('/api/admin/users/beta');
                const data = await response.json();
                setInvites(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const deleteInvite = async (inviteId: number) => {
        try {
            const response = await fetch('/api/admin/users/beta', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inviteId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete invite');
            }

            setInvites(prevInvites => prevInvites.filter(invite => invite.id !== inviteId));
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error deleting invite:', error);
            throw error;
        }
    };

    return (
        loading ? (
            <BandstreamLoading />
        ) : invites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">{to('no_beta_invites')}</p>
            </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{to('email')}</TableHead>
                        <TableHead>{to('createdat')}</TableHead>
                        <TableHead>{to('invitedby')}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invites.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell>
                                <Link href={`mailto:${invite.email}`}>
                                    <span className="text-sm text-muted-foreground">{invite.email}</span>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {invite.createdAt ? new Date(invite.createdAt).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    }) : ''}
                                </span>
                            </TableCell>
                            <TableCell>{invite.invitedBy.name}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <AdminAlertDialog
                                    item={invite.id.toString()}
                                    dialogAction={() => deleteInvite(invite.id)}
                                    icon={<Ban className="h-4 w-4" />}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    )
}