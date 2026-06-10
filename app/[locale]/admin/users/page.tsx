// app/[locale]/admin/users/page.tsx
// translations from next server
import { getTranslations } from 'next-intl/server'
import UsersTable from '@/components/bandstream/admin/users/UsersTable';
import { auth } from '@/auth';
import { hasBandStreamPermission, BandStreamUserRole } from "@/lib/rbac/roles"
import { notFound } from 'next/navigation';

export default async function AdminPage() {    
    const to = await getTranslations('owner');
    const session = await auth();
    const userRole = session?.user?.role;

    if (!hasBandStreamPermission(userRole as BandStreamUserRole | undefined, "OWNER")) {
        notFound(); 
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{to('usersmanagement')}</h1>
                {/* <CreateBandButton /> */}
            </div>

            <UsersTable />
        </div>
    );
}