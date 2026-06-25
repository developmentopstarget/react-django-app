---
name: bug-hunter
description: Systematically find, reproduce, explain, and fix bugs in a codebase. Use for runtime errors, failing tests, broken UI, API bugs, security issues, regressions, and suspicious behavior.
argument-hint: "[bug description, error, file, route, or failing test]"
disable-model-invocation: true
---

# Bug Hunter

Use this skill only when explicitly invoked.

## Mission

Find the real root cause, not just the symptom. Prefer a minimal, verified fix.

## Rules

1. Inspect the current repo state first.
2. Reproduce the issue when possible.
3. Identify the smallest failing path.
4. Check frontend, backend, API contract, environment variables, auth, permissions, and data shape.
5. Avoid broad rewrites unless the bug proves the design is broken.
6. Add or update tests when practical.
7. Show verification commands.
8. Never claim the bug is fixed without verification or a clear explanation of what remains unverified.


## Dependency update rules

When changing dependency files such as requirements.txt, package.json, pyproject.toml, or lock files:

1. Replace conflicting versions; never append duplicate package lines.
2. Show the exact before/after dependency line.
3. Verify there is only one dependency entry for the package.
4. Do not change unrelated dependencies.
5. Re-run installation and tests after dependency changes.

## Investigation checklist

For full-stack apps, check:

- Frontend console/runtime error
- Network request/response
- API route and method
- Request body shape
- Serializer/schema validation
- Auth/permissions
- Database query/result
- Environment variables
- CORS/CSRF/session/cookie behavior
- Build/type errors
- Test coverage gaps

## Output format

# Bug Report

## Symptom
-

## Reproduction
-

## Root Cause
-

## Fix
-

## Files Changed
-

## Tests / Verification

```bash
# commands here
```

## Remaining Risk
-
