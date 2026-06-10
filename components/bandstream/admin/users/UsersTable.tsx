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
import { User } from '@prisma/client';
import {Link} from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import AdminAlertDialog from '@/components/bandstream/admin/AlertDialog';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BandstreamLoading from '@/components/bandstream/admin/BandstreamLoading';
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function BandsTable() {
    const router = useRouter();

    type UserWithPlan = User & { plan: 'FREE' | 'PRO' | 'LABEL' };
    const [users, setUsers] = useState<UserWithPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const to = useTranslations('owner');
    const tc = useTranslations('common');
    const locale = useLocale();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const blockUser = async (id: string | number) => {
        console.log(id);
    }

    const changePlan = async (userId: string, plan: 'FREE' | 'PRO' | 'LABEL') => {
        const previous = users;
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
        try {
            const res = await fetch(`/api/admin/users/${userId}/plan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            if (!res.ok) throw new Error('plan update failed');
            toast({ title: `Plan ${plan} activé`, duration: 2000 });
        } catch (error) {
            console.error('Error updating plan:', error);
            setUsers(previous);
            toast({ title: tc('error'), variant: 'destructive' });
        }
    }

    return (
        loading ? (
            <BandstreamLoading />
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{to('username')}</TableHead>
                        <TableHead>{to('email')}</TableHead>
                        <TableHead>{to('createdat')}</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        {user.image && (
                                            <AvatarImage src={user.image} alt="" />
                                        )}
                                        <AvatarFallback>
                                            {(user.name || user.email || '?')
                                                .split(' ')
                                                .map((part) => part[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold">{user.name}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Link href={`mailto:${user.email}`}>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleString(locale, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    }) : ''}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Select
                                    value={user.plan}
                                    onValueChange={(value) =>
                                        changePlan(user.id, value as 'FREE' | 'PRO' | 'LABEL')
                                    }
                                >
                                    <SelectTrigger className="w-28 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FREE">Free</SelectItem>
                                        <SelectItem value="PRO">Pro</SelectItem>
                                        <SelectItem value="LABEL">Label</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                    className="h-8 w-8"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">{tc('edit')}</span>
                                </Button>
                                <AdminAlertDialog
                                    item={user.id.toString()}
                                    dialogAction={blockUser}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    )
}