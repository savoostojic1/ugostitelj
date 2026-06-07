"use client";

import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSavedMessages } from "@/hooks/use-saved-messages";

async function copyMessageText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function SavedMessagesDropdown() {
  const { data: messages = [], isLoading } = useSavedMessages();

  if (isLoading || messages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Copy className="h-4 w-4" />
          Poruke
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {messages.map((message) => (
          <DropdownMenuItem
            key={message.id}
            onSelect={async (event) => {
              event.preventDefault();
              try {
                await copyMessageText(message.body);
                toast.success(`"${message.name}" kopirano`);
              } catch {
                toast.error("Kopiranje nije uspjelo");
              }
            }}
          >
            {message.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
