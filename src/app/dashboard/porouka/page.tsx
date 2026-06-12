"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
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

async function copyMessageText(text: string) {
  await navigator.clipboard.writeText(text);
}

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
            toast.success("Message saved");
            closeDialog();
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : "Error"),
        }
      );
      return;
    }

    createMessage.mutate(form, {
      onSuccess: () => {
        toast.success("Message created");
        closeDialog();
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Error"),
    });
  }

  function handleDelete(message: SavedMessage) {
    if (!confirm(`Delete message "${message.name}"?`)) return;

    deleteMessage.mutate(message.id, {
      onSuccess: () => toast.success("Message deleted"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  }

  async function handleCopy(message: SavedMessage) {
    try {
      await copyMessageText(message.body);
      toast.success(`"${message.name}" copied`);
    } catch {
      toast.error("Copy failed");
    }
  }

  const isSaving = createMessage.isPending || updateMessage.isPending;

  return (
    <div className="hostvia-property-page space-y-8">
      <DashboardPageHeader
        eyebrow="Tools"
        title="Messages"
        description="Save messages for quick copy from the dashboard"
        actions={
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New message
          </Button>
        }
      />

      {!isLoading && messages.length === 0 && (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="flex flex-col items-center px-4 py-12 text-center sm:py-16">
            <p className="mb-4 text-muted-foreground">No saved messages yet.</p>
            <Button onClick={openCreate} className="w-full sm:w-auto">
              Add first message
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {messages.map((message) => (
          <Card key={message.id} className="min-w-0 overflow-hidden">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 break-words font-semibold">
                  {message.name}
                </p>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(message)}
                    aria-label={`Copy ${message.name}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(message)}
                    aria-label={`Edit ${message.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(message)}
                    disabled={deleteMessage.isPending}
                    aria-label={`Delete ${message.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="max-w-full overflow-x-auto rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] whitespace-pre-wrap break-words">
                {message.body}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit message" : "New message"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-name">Name</Label>
              <Input
                id="message-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Welcome message"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-body">Message text</Label>
              <Textarea
                id="message-body"
                value={form.body}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Enter text you want to copy with one click…"
                rows={8}
                className="min-h-[10rem] resize-y"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
