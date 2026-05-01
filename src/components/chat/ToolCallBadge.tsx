"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const path = args?.path as string | undefined;
  const file = path ? path.split("/").pop() || path : null;

  if (toolName === "str_replace_editor" && file) {
    const cmd = args.command as string | undefined;
    if (cmd === "create") return isDone ? `Created ${file}` : `Creating ${file}`;
    if (cmd === "str_replace" || cmd === "insert")
      return isDone ? `Edited ${file}` : `Editing ${file}`;
    if (cmd === "view") return isDone ? `Viewed ${file}` : `Viewing ${file}`;
    if (cmd === "undo_edit")
      return isDone ? `Undid edit to ${file}` : `Undoing edit to ${file}`;
  }

  if (toolName === "file_manager" && file) {
    const cmd = args.command as string | undefined;
    if (cmd === "rename") return isDone ? `Renamed ${file}` : `Renaming ${file}`;
    if (cmd === "delete") return isDone ? `Deleted ${file}` : `Deleting ${file}`;
  }

  return toolName.replace(/_/g, " ");
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone =
    toolInvocation.state === "result" &&
    (toolInvocation as { result?: unknown }).result != null;

  const label = getToolLabel(
    toolInvocation.toolName,
    (toolInvocation.args ?? {}) as Record<string, unknown>,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
