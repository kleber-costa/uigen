import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeCall(
  toolName: string,
  args: Record<string, unknown>
): ToolInvocation {
  return { state: "call", toolCallId: "test-id", toolName, args };
}

function makeResult(
  toolName: string,
  args: Record<string, unknown>
): ToolInvocation {
  return { state: "result", toolCallId: "test-id", toolName, args, result: "ok" };
}

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create pending", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "Button.tsx" }, false)).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "Button.tsx" }, true)).toBe("Created Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace pending", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "App.tsx" }, false)).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "App.tsx" }, true)).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor insert pending", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "utils.ts" }, false)).toBe("Editing utils.ts");
});

test("getToolLabel: str_replace_editor view pending", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "README.md" }, false)).toBe("Viewing README.md");
});

test("getToolLabel: str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "README.md" }, true)).toBe("Viewed README.md");
});

test("getToolLabel: str_replace_editor undo_edit pending", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "index.ts" }, false)).toBe("Undoing edit to index.ts");
});

test("getToolLabel: str_replace_editor undo_edit done", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "index.ts" }, true)).toBe("Undid edit to index.ts");
});

test("getToolLabel: file_manager rename pending", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "Card.tsx" }, false)).toBe("Renaming Card.tsx");
});

test("getToolLabel: file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "Card.tsx" }, true)).toBe("Renamed Card.tsx");
});

test("getToolLabel: file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "OldFile.tsx" }, true)).toBe("Deleted OldFile.tsx");
});

test("getToolLabel: extracts basename from nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/components/ui/Button.tsx" }, false)).toBe("Creating Button.tsx");
});

test("getToolLabel: unknown tool falls back to formatted name", () => {
  expect(getToolLabel("some_custom_tool", {}, false)).toBe("some custom tool");
});

test("getToolLabel: str_replace_editor with no path falls back", () => {
  expect(getToolLabel("str_replace_editor", {}, false)).toBe("str replace editor");
});

// --- ToolCallBadge component tests ---

test("ToolCallBadge shows spinner when state is call", () => {
  render(<ToolCallBadge toolInvocation={makeCall("str_replace_editor", { command: "create", path: "Button.tsx" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge shows green dot when state is result", () => {
  render(<ToolCallBadge toolInvocation={makeResult("str_replace_editor", { command: "create", path: "Button.tsx" })} />);
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner for partial-call state", () => {
  const invocation: ToolInvocation = {
    state: "partial-call",
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "Button.tsx" },
  };
  render(<ToolCallBadge toolInvocation={invocation} />);
  expect(document.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge renders file_manager rename result", () => {
  render(<ToolCallBadge toolInvocation={makeResult("file_manager", { command: "rename", path: "Card.tsx" })} />);
  expect(screen.getByText("Renamed Card.tsx")).toBeDefined();
});

test("ToolCallBadge renders unknown tool fallback", () => {
  render(<ToolCallBadge toolInvocation={makeCall("some_custom_tool", {})} />);
  expect(screen.getByText("some custom tool")).toBeDefined();
});
