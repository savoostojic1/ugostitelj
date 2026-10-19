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

export function SavedMessagesDropdown({
  iconOnly = false,
}: {
  iconOnly?: boolean;
}) {
  const { data: messages = [], isLoading } = useSavedMessages();

  if (isLoading || messages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={iconOnly ? "icon" : "sm"}
          aria-label="Messages"
          className={
            iconOnly
              ? "h-9 w-9 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              : "h-8 gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          }
        >
          <Copy className="h-4 w-4" />
          {iconOnly ? null : (
            <>
              Messages
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {iconOnly ? (
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Messages
          </p>
        ) : null}
        {messages.map((message) => (
          <DropdownMenuItem
            key={message.id}
            onSelect={async (event) => {
              event.preventDefault();
              try {
                await copyMessageText(message.body);
                toast.success(`"${message.name}" copied`);
              } catch {
                toast.error("Copy failed");
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
