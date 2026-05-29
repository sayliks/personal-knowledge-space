---
name: database-migration-script-workflow
description: Workflow command scaffold for database-migration-script-workflow in my-blog.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /database-migration-script-workflow

Use this workflow when working on **database-migration-script-workflow** in `my-blog`.

## Goal

Adding or updating database migration scripts and safety checks for schema/data changes.

## Common Files

- `prisma/migrate-to-*.ts`
- `prisma/drop-old-tables.ts`
- `prisma/migrate-complete.ts`
- `prisma/check-tables.ts`
- `docs/MIGRATION_RUNBOOK.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update migration scripts to transform or clean up data.
- Add scripts to check database tables and row counts for verification.
- Add scripts to drop or clean up old tables post-migration.
- Document migration steps and safety checks.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.