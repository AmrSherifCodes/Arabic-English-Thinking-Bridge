# GitHub & Vercel Branch Protection Guide

> **IMPORTANT:** Automated AI agents cannot modify GitHub repository settings or Vercel dashboard configurations from a shell. A human administrator must manually apply these settings in the respective dashboards.

## 1. GitHub Branch Protection Setup

1. Open repository settings on GitHub: `Settings` -> `Branches`.
2. Click **Add branch ruleset** or **Add branch protection rule**.
3. Set **Branch pattern** to `main`.
4. Enable the following settings:
   - **Require a pull request before merging**:
     - Require at least **1 approval**.
     - Dismiss stale pull request approvals when new commits are pushed.
   - **Require status checks to pass before merging**:
     - Require branches to be up to date before merging.
     - Add `build-and-test` (GitHub Actions workflow).
     - Add `Vercel` preview deployment check.
   - **Do not allow bypassing the above settings**.
   - **Restrict pushes that create matching branches / Disallow direct pushes**.
   - **Block force pushes**.

## 2. Vercel Deployment Protection Setup

1. Open project settings in the Vercel Dashboard: `Settings` -> `Deployment Protection`.
2. Ensure `main` is designated as the sole Production Branch.
3. Enable **Preview Deployment Protection** as needed for pull requests.
