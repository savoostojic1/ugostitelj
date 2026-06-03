"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteProperty } from "@/hooks/use-properties";
import { toast } from "sonner";

interface PropertyDeleteButtonProps {
  propertyId: string;
  propertyName: string;
}

export function PropertyDeleteButton({
  propertyId,
  propertyName,
}: PropertyDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deleteProperty = useDeleteProperty();

  async function handleDelete() {
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast.success("Nekretnina obrisana");
      setOpen(false);
      router.push("/dashboard/properties");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Greška pri brisanju");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Obriši
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Obriši nekretninu?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Ovo će trajno obrisati{" "}
          <span className="font-medium text-foreground">{propertyName}</span>{" "}
          zajedno sa svim kalendar feedovima i rezervacijama.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={deleteProperty.isPending}
          >
            Otkaži
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProperty.isPending}
          >
            {deleteProperty.isPending ? "Brisanje…" : "Obriši"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
