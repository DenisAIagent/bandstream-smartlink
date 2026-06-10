// app/admin/bands/page.tsx
import BandsTable from '@/components/bandstream/admin/bands/BandsTable';
import CreateBandButton from '@/components/bandstream/admin/bands/CreateBandButton';
import { useTranslations } from "next-intl";

export default function AdminPage() {    
    const to = useTranslations('admin');

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{to('bandmanagement')}</h1>
                <CreateBandButton />
            </div>

            <BandsTable />
        </div>
    );
}