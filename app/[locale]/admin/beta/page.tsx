// app/[locale]/admin/beta/page.tsx

import { getTranslations } from 'next-intl/server'
import BetaInvitesTable from '@/components/bandstream/admin/users/BetaInvitesTable';
import { getRolePermission } from "@/components/auth/RoleGuard"
import { notFound } from 'next/navigation';
import CreateInviteButton from '@/components/bandstream/admin/users/CreateInviteButton';
export default async function AdminPage() {    
    const to = await getTranslations('owner');
    const isOwner = await getRolePermission("OWNER")

    if (!isOwner) {
        notFound(); 
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{to('betainvites')}</h1>
                <CreateInviteButton />
            </div>

            <BetaInvitesTable />
        </div>
    );
}