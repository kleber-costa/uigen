import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
  useFileSystem: vi.fn(() => ({ files: {}, activeFile: null })),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: vi.fn(() => ({
    messages: [],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
  })),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

afterEach(() => cleanup());

test("defaults to preview tab", () => {
  render(<MainContent />);
  const previewTab = screen.getByRole("tab", { name: /preview/i });
  expect(previewTab).toHaveAttribute("data-state", "active");
});

test("clicking Code tab activates it", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  const codeTab = screen.getByRole("tab", { name: /code/i });
  await user.click(codeTab);
  expect(codeTab).toHaveAttribute("data-state", "active");
});

test("clicking Preview tab activates it after switching to code", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  const codeTab = screen.getByRole("tab", { name: /code/i });
  const previewTab = screen.getByRole("tab", { name: /preview/i });
  await user.click(codeTab);
  await user.click(previewTab);
  expect(previewTab).toHaveAttribute("data-state", "active");
});

test("PreviewFrame stays mounted when switching to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: /code/i }));
  expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
});

test("code editor is shown when code tab is active", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: /code/i }));
  expect(screen.getByTestId("code-editor")).toBeInTheDocument();
});
