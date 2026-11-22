# Agent Git and Development Rules

These rules apply to any automated agent or developer working on the GEM Feeder repository.

## 1. Absolute Git Safety Guardrails

1. **Never Commit, Merge, or Push Automatically:**
   - Never run `git commit`, `git push`, `git merge`, `git rebase`, `git tag`, `git reset --hard`, or any force operation.
   - Never create or switch branches unless explicitly instructed by the repository owner in a direct prompt.
   - Staging with `git mv` or `git add` is allowed.
   - Leave all changes uncommitted in the working tree for the owner to review.

2. **Always Ask Before Commit or Push:**
   - If you believe a commit or push is required or ready, STOP and ask the repository owner.
   - A previous automated phase pushed to `main` without authorization. This is strictly prohibited.

3. **Pre-Push Hook Guardrail:**
   - A local git pre-push hook is installed at `.git/hooks/pre-push`.
   - Any attempt to push to any remote without `GEM_ALLOW_PUSH=1` will be aborted with:
     ```
     Push blocked. Ask the owner first.
     ```
   - Only the repository owner should set `GEM_ALLOW_PUSH=1 git push`.

## 2. File and Modification Safety

1. **No Silent Deletions:**
   - Do not delete any file without first listing it in the chat/output and stating why.
   - Moving files using `git mv` is moving, not deleting.

2. **Surgical and Minimal Changes:**
   - Do not add unsolicited features, levels, power-ups, shop items, or visual gimmicks.
   - Do not modify gameplay physics, scoring, collisions, level data, or save-data logic unless explicitly tasked.
   - Clean up your own temporary files; do not leave scratch files behind.

## 3. Evidence-Based Verification

1. **No Fabricated Pass Claims:**
   - Never declare that a bug is fixed, a test passes, or a build succeeds without executing the verification command and checking the output.
   - Provide concrete command output, test metrics, or screenshots as proof.
   - If something could not be verified, state so plainly.

2. **Runnable State Preservation:**
   - The game must remain completely runnable, testable, and buildable across all phases.
