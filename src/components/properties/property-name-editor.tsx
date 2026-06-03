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
      toast.error("Naziv ne može biti prazan");
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }
    try {
      await update.mutateAsync({ id: propertyId, name: trimmed });
      toast.success("Naziv ažuriran");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Greška pri čuvanju");
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
          className="max-w-md text-lg font-semibold"
          autoFocus
          disabled={update.isPending}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={update.isPending}>
            {update.isPending ? "Čuvanje…" : "Sačuvaj"}
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
            Otkaži
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setEditing(true)}
        aria-label="Uredi naziv"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
