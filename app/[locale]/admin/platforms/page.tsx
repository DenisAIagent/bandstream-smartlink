// app/admin/platforms/page.tsx
import CreatePlatformButton from '@/components/bandstream/admin/platforms/CreatePlatformButton';
import PlatformsTable from '@/components/bandstream/admin/platforms/PlatformsTable';
import { useTranslations } from "next-intl";
export default function PlatformPage() {
    const ta = useTranslations('admin');

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{ta('platformmanagement')}</h1>
                <CreatePlatformButton />
            </div>
            
            <PlatformsTable />
        </div>
    );
}