'use client';

import React from 'react'
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import { createBandAction } from '@/lib/actions/band-actions';
import { useActionState } from 'react';

type BandState = 
  | { error: string; success?: never; data?: never }
  | { error: { name?: string[] }; success?: never; data?: never }
  | { success: boolean; data: { name: string; id: number }; error?: never };

const initialState: BandState = {
  error: ""
};

const CreateBandButton = () => {
    const [open, setOpen] = React.useState(false);
    const [state, formAction] = useActionState(createBandAction, initialState);
    const { toast } = useToast();
    const router = useRouter();
    const ta = useTranslations('admin');
    const tb = useTranslations('bands');
    const tc = useTranslations('common');

    React.useEffect(() => {
      if (state.success) {
        toast({
          title: tb('success'),
          description: tb('bandCreatedSuccess'),
        });
        setOpen(false);
        location.reload();
      } else if (state.error) {
        toast({
          title: tc('error'),
          description: typeof state.error === 'string' ? state.error : state.error.name?.[0] || ta('failed_create_band'),
          variant: "destructive",
        });
      }
    }, [state, toast, router]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {ta('addband')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tb('newband')}</DialogTitle>
                        <DialogDescription>
                            {tb('newbandhint')}
                        </DialogDescription>
                    </DialogHeader>
                    <form action={formAction} className="space-y-4">
                        <Input
                            type="text"
                            name="name"
                            placeholder={tb('enterbandname')}
                            required
                        />
                        <Button type="submit" className="w-full">
                            {tb('createband')}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default CreateBandButton