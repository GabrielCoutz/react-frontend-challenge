import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'

interface RemoveButtonProps {
  title: string
  onConfirm: () => void
}

export function RemoveButton({ title, onConfirm }: RemoveButtonProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    setOpen(false)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className="inline-flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        aria-label={`Remover ${title} da lista`}
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover da lista?</AlertDialogTitle>
          <AlertDialogDescription>
            "{title}" será removido da sua watchlist. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-white hover:bg-destructive/90">
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
