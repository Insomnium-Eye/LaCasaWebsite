# Instructions for AI assistants

[README.md](README.md) is the source of truth for this project. Read its **Engineering rules** before changing code.

**Before and after every commit, go through the [Commit checklist](README.md#commit-checklist) step by step**, and tell the user the result of each step: what passed, what was skipped, and what they need to do by hand (Supabase migrations, Vercel environment variables). Keep the README's Project map, Database and To-dos sections current as part of the same commit.

Things that are easy to get wrong here:

- **The repo is public.** Never write secrets, admin or lock codes, iCal URLs, or personal emails or phone numbers into code, docs or commit messages.
- **Database changes are new numbered files in `db/migrations/`.** The user runs them by hand in the Supabase SQL Editor, before deploying. Tables created there get row-level security automatically, so every new table needs the RLS block from the README.
- **Deploys go through GitHub Actions on push to `main`.** Vercel's "Redeploy" button doesn't work for them.
- **The user tests the guest portal with the admin login**, which has no reservation data. Portal tabs must render for it.
