---
name: data-model-migration-workflow
description: Workflow command scaffold for data-model-migration-workflow in my-blog.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /data-model-migration-workflow

Use this workflow when working on **data-model-migration-workflow** in `my-blog`.

## Goal

Migrating or refactoring core data models (e.g., Post/Category to Document), including schema changes, migration scripts, query updates, server actions, and admin UI updates.

## Common Files

- `prisma/schema.prisma`
- `prisma/migrate-to-*.ts`
- `prisma/drop-old-tables.ts`
- `prisma/migrate-complete.ts`
- `lib/queries.ts`
- `app/actions/*.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update the Prisma schema to define new/updated models and relationships.
- Write migration scripts to transform existing data to the new model structure.
- Refactor backend query logic to use the new models.
- Update server actions to use the new models and fields.
- Update API routes to reflect the new data model.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.