---
name: create-changeset
description: Create standard Changesets markdown files for changed libraries from a Git diff. Use when the user asks to create, draft, or generate a changeset/change set, determine a package version bump, or prepare Russian release notes for one or more library packages, including packages in a monorepo.
---

# Create Changeset

Create consumer-facing Changesets in Russian. Keep the skill instructions in English.

## Workflow

1. Resolve the comparison base. Use `master` unless the user names a branch, commit, tag, or range.
2. Inspect the current worktree against the base before writing anything:

   ```bash
   git status --short
   git diff --name-status <base>
   git diff <base>
   ```

   `git diff <base>` includes staged and unstaged tracked changes. Inspect relevant untracked files from `git status --short` when they can affect the library change.
3. Discover affected libraries. Inspect the repository's workspace configuration and package manifests, then map changed paths to the nearest package owning them. Use the package name declared by its manifest, not the directory name. Ignore pre-existing files in `.changeset/` unless the user asks to modify them.
4. Treat each affected library separately. If the diff changes multiple libraries, create one new changeset file per library. Do not combine multiple package entries into one file.
5. Infer the version bump from the consumer impact:

   - `patch`: bug fix, implementation-only change, or compatible correction.
   - `minor`: new backwards-compatible public capability.
   - `major`: removed or incompatible public API, behavior, configuration, or required migration.

6. Ask a concise question before generating files when the diff does not make the purpose, public impact, required consumer action, package ownership, or appropriate SemVer bump clear. Do not invent these facts.
7. Create the files in `.changeset/` using unique, descriptive kebab-case filenames. Create the directory if it does not exist. Do not modify source code, package versions, or existing changesets unless the user asks.
8. Re-read every created file and verify that it has valid YAML frontmatter, exactly one package entry, a valid bump level, and the required Russian sections.

## File Format

Write each file in this exact shape. Replace every placeholder; do not include braces in the output.

```md
---
'{library-name}': patch
---

**Что изменилось**
Краткое и понятное описание изменения.

**Что делать потребителю**
Конкретные действия для обновления либо: «Никаких действий не требуется: изменение внутреннее и не меняет публичный API».

**Контекст:** Добавляй этот абзац только если причина изменения неочевидна и известна из диффа или ответа пользователя.
```

## Writing Rules

- Write the changeset body in Russian, even when the user writes in another language.
- Make **Что изменилось** concise and factual; describe the user-visible result rather than implementation details.
- Make **Что делать потребителю** actionable. For a breaking change, name the migration. For an internal change, explicitly state that no action is required.
- Include **Контекст:** only when it makes a non-obvious decision understandable. Ask the user if that rationale is needed but missing.
- Use the exact headings and ordering shown above. Do not add release dates, issue IDs, marketing text, or a generic summary.
- If no library package is affected, explain why a changeset cannot be created instead of fabricating one.
