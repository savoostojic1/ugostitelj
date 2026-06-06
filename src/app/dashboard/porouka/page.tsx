"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSavedMessage,
  useDeleteSavedMessage,
  useSavedMessages,
  useUpdateSavedMessage,
} from "@/hooks/use-saved-messages";
import type { SavedMessage } from "@/types/database";
import { toast } from "sonner";

type MessageFormState = {
  name: string;
  body: string;
};

const emptyForm: MessageFormState = { name: "", body: "" };

export default function PoroukaPage() {
  const { data: messages = [], isLoading } = useSavedMessages();
  const createMessage = useCreateSavedMessage();
  const updateMessage = useUpdateSavedMessage();
  const deleteMessage = useDeleteSavedMessage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedMessage | null>(null);
  const [form, setForm] = useState<MessageFormState>(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(message: SavedMessage) {
    setEditing(message);
    setForm({ name: message.name, body: message.body });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit() {
    if (editing) {
      updateMessage.mutate(
        { id: editing.id, name: form.name, body: form.body },
        {
          onSuccess: () => {
            toast.success("Poruka sačuvana");
            closeDialog();
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : "Greška"),
        }
      );
      return;
    }

    createMessage.mutate(form, {
      onSuccess: () => {
        toast.success("Poruka kreirana");
        closeDialog();
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Greška"),
    });
  }

  function handleDelete(message: SavedMessage) {
    if (!confirm(`Obriši poruku "${message.name}"?`)) return;

    deleteMessage.mutate(message.id, {
      onSuccess: () => toast.success("Poruka obrisana"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Brisanje nije uspjelo"),
    });
  }

  const isSaving = createMessage.isPending || updateMessage.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Porouka</h1>
          <p className="text-muted-foreground">
            Sačuvaj poruke za brzo kopiranje sa dashboarda
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova poruka
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      )}

      {!isLoading && messages.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="mb-4 text-muted-foreground">
              Još nema sačuvanih poruka.
            </p>
            <Button onClick={openCreate}>Dodaj prvu poruku</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="font-semibold">{message.name}</p>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {message.body}
                </pre>
              </div>
              <div className="flex shrink-0 gap-1 self-end sm:self-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(message)}
                  aria-label={`Uredi ${message.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(message)}
                  disabled={deleteMessage.isPending}
                  aria-label={`Obriši ${message.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Uredi poruku" : "Nova poruka"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-name">Naziv</Label>
              <Input
                id="message-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="npr. Dobrodošlica"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-body">Tekst poruke</Label>
              <Textarea
                id="message-body"
                value={form.body}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Unesi tekst koji želiš da kopiraš jednim klikom…"
                rows={8}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeDialog}>
              Otkaži
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Čuvanje…" : editing ? "Sačuvaj" : "Kreiraj"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
