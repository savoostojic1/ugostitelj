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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PropertyDeleteButton({
  propertyId,
  propertyName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: PropertyDeleteButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const router = useRouter();
  const deleteProperty = useDeleteProperty();

  async function handleDelete() {
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast.success("Property deleted");
      setOpen(false);
      router.push("/dashboard/properties");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
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
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete property?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently delete{" "}
          <span className="font-medium text-foreground">{propertyName}</span>{" "}
          along with all calendar feeds and reservations.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={deleteProperty.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProperty.isPending}
          >
            {deleteProperty.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
