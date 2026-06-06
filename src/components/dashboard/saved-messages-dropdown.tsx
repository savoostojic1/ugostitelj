"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSavedMessages } from "@/hooks/use-saved-messages";

async function copyMessageText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function SavedMessagesDropdown() {
  const { data: messages = [], isLoading } = useSavedMessages();
  const [resetKey, setResetKey] = useState(0);

  if (isLoading || messages.length === 0) {
    return null;
  }

  return (
    <Select
      key={resetKey}
      onValueChange={async (id) => {
        const message = messages.find((m) => m.id === id);
        if (!message) return;

        try {
          await copyMessageText(message.body);
          toast.success(`"${message.name}" kopirano`);
        } catch {
          toast.error("Kopiranje nije uspjelo");
        } finally {
          setResetKey((k) => k + 1);
        }
      }}
    >
      <SelectTrigger className="h-9 w-auto gap-2 px-3">
        <Copy className="h-4 w-4 shrink-0" />
        <SelectValue placeholder="Poruke" />
      </SelectTrigger>
      <SelectContent align="end">
        {messages.map((message) => (
          <SelectItem key={message.id} value={message.id}>
            {message.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
