# CLAUDE.md - Obsidian Todo.txt Plugin

## Project Overview

This is an Obsidian community plugin that enables managing and displaying todo.txt format files within Obsidian. The plugin provides a specialized view for `.txt` and `.todotxt` files with task management capabilities.

### Key Value Proposition
- **Software-agnostic**: Plain text files editable with any editor
- **Human-readable**: Content understandable without special tools
- **Sortable**: Alphabetical sorting produces meaningful order

## Tech Stack

- **Language**: TypeScript (strict mode)
- **UI Framework**: React (planned)
- **Build Tool**: esbuild
- **Package Manager**: pnpm
- **Test Framework**: Vitest
- **Linter**: ESLint with eslint-plugin-obsidianmd
- **Type Checker**: TypeScript (tsc)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (watch mode)
pnpm dev

# Production build
pnpm build

# Run tests
pnpm vitest run

# Run tests in watch mode
pnpm vitest

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit
```

## Project Structure

```
src/
├── main.ts              # Plugin entry point (keep minimal)
├── settings.ts          # Settings interface and defaults
├── view.tsx             # TodotxtView (TextFileView extension)
├── lib/
│   ├── todo.ts          # Todo data model
│   └── parser.ts        # todo.txt parser
├── ui/
│   ├── TodosView.tsx    # Main view component
│   ├── TodosList.tsx    # Task list component
│   ├── TodoItem.tsx     # Individual task component
│   └── dialogs/         # Dialog components
└── types.ts             # TypeScript interfaces
```

## todo.txt Format Reference

### Basic Structure
```
[x] [(A)] [YYYY-MM-DD] [YYYY-MM-DD] <description> [+project] [@context] [key:value]
 ↑    ↑        ↑            ↑           ↑           ↑          ↑         ↑
完了  優先度  完了日      作成日      説明文     プロジェクト コンテキスト タグ
```

### Key Rules
- **Completion**: `x ` at line start marks complete
- **Priority**: `(A)` - `(Z)` uppercase, must be at line start
- **Dates**: `YYYY-MM-DD` format
- **Project**: `+` followed by non-whitespace
- **Context**: `@` followed by non-whitespace
- **Tags**: `key:value` format (due:, t:, rec:, pri:)

## Development Guidelines

### File Organization
- Keep `main.ts` minimal - only plugin lifecycle
- Split files at ~200-300 lines
- Single responsibility per module

### TDD Workflow
Follow Red-Green-Refactor cycle:
1. **Red**: Write failing test first
2. **Green**: Minimum code to pass
3. **Refactor**: Improve structure (separate commits)

### Commit Message Format
- `test:` for Red phase commits
- `feat:` / `fix:` for Green phase commits
- `refactor:` for structural improvements

### Obsidian Plugin Conventions
- Use `this.register*` helpers for cleanup
- Store settings with `loadData()` / `saveData()`
- Stable command IDs (never rename after release)
- No network calls without user disclosure

## AI-Agentic Scrum

This project uses AI-Agentic Scrum methodology:
- **Single source of truth**: `plan.md`
- **1 Sprint = 1 PBI**
- **TDD-based subtasks** with commit tracking

### Available Agents
- `@scrum-team-product-owner` - Backlog management
- `@scrum-team-scrum-master` - Sprint facilitation
- `@scrum-team-developer` - Implementation (TDD)

### Sprint Events
- `@scrum-event-sprint-planning` - Select PBI, break into subtasks
- `@scrum-event-sprint-review` - Verify DoD
- `@scrum-event-sprint-retrospective` - Process improvement
- `@scrum-event-backlog-refinement` - Refine PBIs to ready status

## References

- [todo.txt format](https://github.com/todotxt/todo.txt)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins)
- Reference implementations in `refferencies/`
