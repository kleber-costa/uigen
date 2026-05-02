# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude uses tool calls to create/edit files in a virtual file system; an iframe renders the result using Babel + an import map.

## Commands

```bash
npm run setup        # First-time setup: install + prisma generate + migrate
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest (watch mode)
npm test -- --run    # Vitest single run
npm test -- <file>   # Run one test file
npm run db:reset     # Force reset SQLite database
```

## Architecture

### Request Flow

1. User types in `ChatInterface` → POST `/api/chat`
2. `route.ts` calls Claude with a system prompt + VirtualFileSystem context; max 40 tool steps
3. Claude calls `str_replace_editor` / `file_manager` tools to create/modify files
4. Tool results update `FileSystemContext` in the client
5. `PreviewFrame` compiles files with Babel standalone and renders in an iframe via import map

### Key Directories

- `src/app/` — Next.js App Router pages (`/` auth screen, `/[projectId]` workspace)
- `src/app/api/chat/` — Streaming AI endpoint with prompt caching
- `src/actions/` — Server actions for auth (`signUp`, `signIn`, `signOut`, `getUser`) and projects (`getProjects`, `createProject`, etc.)
- `src/components/` — UI split into `chat/`, `editor/`, `preview/`, `auth/`, and Radix-based `ui/` primitives
- `src/lib/` — Core logic:
  - `file-system.ts` — `VirtualFileSystem` class (in-memory tree, serializes to JSON for DB storage)
  - `provider.ts` — `getLanguageModel()` returns Claude or a `MockLanguageModel` fallback when no valid API key is set
  - `tools/` — Claude tool definitions (`str_replace_editor`, `file_manager`)
  - `transform/jsx-transformer.ts` — Babel-based JSX compilation + import map generation for iframe
  - `contexts/` — `FileSystemContext` and `ChatContext` (wraps Vercel AI SDK `useChat`)
  - `prompts/` — System prompt sent to Claude
- `prisma/` — SQLite schema (`prisma/schema.prisma`):
  - `User` — id (cuid), email (unique), bcrypt password, timestamps; has many Projects
  - `Project` — id (cuid), name, nullable userId (cascade deletes on User), `messages` (JSON string, default `[]`), `data` (JSON string holding serialized VirtualFileSystem, default `{}`), timestamps

### State Management

- `FileSystemContext` — owns `VirtualFileSystem` state and applies tool call results
- `ChatContext` — wraps `@ai-sdk/react`'s `useChat`; connects tool call stream to `FileSystemContext`
- Both contexts are composed in `MainContent` and passed to the three-panel layout (Chat | Editor+FileTree | Preview)

### Authentication

- JWT in httpOnly cookies; `src/middleware.ts` guards protected routes
- `src/lib/auth.ts` — token creation/verification with `jose`
- Anonymous users can use the app; state is only persisted to DB for logged-in users

### Development best Practices

- Use comments sparingly. Only comment complex code

## Environment

Requires an `.env` file:

```
ANTHROPIC_API_KEY=your_key_here
```

Without a valid key, the app falls back to `MockLanguageModel` (canned demo responses). Do not run `npm audit fix` — dependencies are intentionally pinned.

## Testing

Tests live in `src/**/__tests__/`. Coverage includes `VirtualFileSystem`, JSX transformer, both React contexts, and all major UI components. Uses Vitest + jsdom + React Testing Library.

### Database

The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database. 
