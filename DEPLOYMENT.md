# Deployment & Release Policy

The `main` branch represents production. Only a human user may merge code into `main` or promote builds to production.

## Prohibited Agent Commands

Automated agents and AI assistants must NEVER execute the following commands under any circumstances:

- `git push origin main`
- `git push HEAD:main`
- `git push --force` (or `git push --force-with-lease` to any branch)
- `vercel --prod`
- `gh pr merge`
- `vercel env add` / `vercel env rm`
- `vercel project rm`

## Standard Deployment Workflow

1. Create a dedicated feature or hotfix branch (e.g., `release/v4.1-hotfix` or `feature/xyz`).
2. Implement, test, and build locally to verify all automated checks pass.
3. Open a Pull Request (PR) targeting `main`.
4. Wait for CI checks (`build-and-test`, Vercel Preview) to complete successfully.
5. Request human review.
6. A human developer reviews, approves, and merges the PR into `main`.

## When You Are Blocked

If a preview deployment or CI workflow is blocked due to SSO authentication, expired tokens, or restricted permissions:
- **STOP immediately.** Do NOT push directly to `main` as a workaround.
- Ask the human user to execute `vercel login` in their terminal or temporarily configure preview deployment settings.
- Wait for human intervention before proceeding.
