"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProperty } from "@/hooks/use-properties";
import { toast } from "sonner";

interface PropertyNameEditorProps {
  propertyId: string;
  name: string;
}

export function PropertyNameEditor({
  propertyId,
  name,
}: PropertyNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const update = useUpdateProperty();

  useEffect(() => {
    setValue(name);
  }, [name]);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }
    try {
      await update.mutateAsync({ id: propertyId, name: trimmed });
      toast.success("Name updated");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  if (editing) {
    return (
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full text-base font-semibold sm:max-w-md sm:text-lg"
          autoFocus
          disabled={update.isPending}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={update.isPending}
            onClick={() => {
              setValue(name);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h1 className="hostvia-dashboard-title min-w-0 truncate">{name}</h1>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setEditing(true)}
        aria-label="Edit name"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
