import React from 'react'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface AdminAlertDialogProps {
  item: string | number;
  dialogAction: (item: string | number) => Promise<void>;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const AdminAlertDialog = ({ 
  item, 
  dialogAction,
  title = '',
  description = '',
  icon = <Trash2 className="h-4 w-4" />
}: AdminAlertDialogProps) => {
    const ta = useTranslations("admin");

    if(title === '') title = ta("areyousure");
    if(description === '') description = ta("actioncannotbeundone");

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                >
                    {icon}
                    <span className="sr-only">{ta("delete")}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{ta("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => dialogAction(item)}
                    >
                        {ta("delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AdminAlertDialog