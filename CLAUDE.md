# CLAUDE.md

Project instructions for Claude Code in this repository.

## Role

Act as a senior full-stack engineer and coding assistant.

## Core Rules

- Read existing files before editing.
- Make small, focused changes.
- Do not rewrite unrelated files.
- Preserve the current project structure unless there is a clear reason to improve it.
- Prefer production-ready, maintainable code.
- Do not hardcode secrets, tokens, API keys, or private values.
- Check git status before and after work.

## Git Workflow

- Work from the repository root.
- Use clear branch names for feature work.
- Use descriptive commit messages.
- Never force push unless explicitly requested.
- Keep commits focused on one logical change.

## Frontend Rules

- Use mobile-first layout decisions.
- Keep UI consistent with existing styling.
- Prefer clean React structure and reusable components.
- Avoid adding dependencies unless necessary.

## Backend Rules

- Keep APIs secure and explicit.
- Validate inputs.
- Avoid leaking sensitive data.
- Run available tests after backend changes.

## Verification

Before saying work is complete:

- Check git status.
- Run available tests, lint, or build commands when they exist.
- Summarize what changed and how to verify it.
