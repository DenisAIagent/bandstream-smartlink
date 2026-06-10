'use client';

import React from 'react'
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
const CreatePlatformButton = () => {
    const router = useRouter();
    const ta = useTranslations('admin');

    return (
    <Button 
        onClick={() => router.push('/admin/platforms/create')}
        className="flex items-center gap-2"
    >
        <Plus className="h-4 w-4" />
        {ta('addplatform')}
    </Button>
  )
}

export default CreatePlatformButton