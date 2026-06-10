'use client';

import React, { useActionState } from 'react'
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { createInviteAction } from '@/lib/actions/invite-actions';
import { useToast } from "@/hooks/use-toast"

type InviteState = 
  | { error: string; success?: never; data?: never }
  | { error: { email?: string[] }; success?: never; data?: never }
  | { success: boolean; data: { email: string; id: number; invitedById: string; createdAt: Date }; error?: never };

const initialState: InviteState = {
  error: ""
};

const CreateInviteButton = () => {
    const [open, setOpen] = React.useState(false);
    const [state, formAction] = useActionState(createInviteAction, initialState);
    const { toast } = useToast();
    const to = useTranslations('owner');
    const tc = useTranslations('common');

    React.useEffect(() => {
      if (state.success) {
        toast({
          title: tc('success'),
          description: to('invite_sent'),
        });
        setOpen(false);
        location.reload();
      } else if (state.error) {
        toast({
          title: tc('error'),
          description: typeof state.error === 'string' ? state.error : state.error.email?.[0] || to('failed_send_invite'),
          variant: "destructive",
        });
      }
    }, [state, toast]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {to('addbeta')}
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>{to('inviteuser')}</DialogTitle>
                    <DialogDescription>
                    {to('invitemail')}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <Input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    required
                    />
                    <Button type="submit" className="w-full">
                    {to('sendinvite')}
                    </Button>
                </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default CreateInviteButton
