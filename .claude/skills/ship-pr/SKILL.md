---
name: ship-pr
description: Ship a Shadowplay change (a new film, a feature, a fix) as a GitHub pull request with a demo GIF. Use whenever a film or feature is added to the project, and whenever the user asks to create a branch or worktree, push changes, open a PR, or attach a demo/GIF to a PR. Creates an isolated git worktree and branch from origin/main, commits and pushes in English, opens the PR with gh, records the demo with `npm run demo`, uploads the GIF to the PR through Claude in Chrome and embeds it in the PR description.
---

# Ship a change as a PR with a demo

Every film or feature reaches `main` through its own worktree, branch and pull request, and
the PR shows what changed with a demo GIF. Start at step 1 **before editing any file**.

## Language

Everything that lands in git or GitHub is written in **English**: branch names, commit
messages, PR titles and descriptions, PR comments. Content that is Spanish by design (the
`es/` studies) stays in Spanish. Talk to the user in their own language.

## Steps

1. **Worktree and branch, from `origin/main`.** Branch names: `film/<slug>` for a film,
   `feat/<topic>`, `fix/<topic>`, `chore/<topic>` or `docs/<topic>` otherwise.

   ```bash
   git fetch origin
   git worktree add -b <branch> ../shadow-play.worktrees/<branch-with-dashes> origin/main
   cd ../shadow-play.worktrees/<branch-with-dashes> && npm ci
   ```

   Work only inside the worktree (use absolute paths), never in the main checkout, and do
   not carry over untracked files from it. If Playwright's Chromium is missing, run
   `npm run harness:init`.

   **Port:** if another dev server is already on 4321 (for example in the main checkout),
   prefix every Playwright command with `PLAYWRIGHT_PORT=4322`. Otherwise Playwright reuses
   that server and tests the other checkout's code.

2. **Implement and verify.** Follow the matching skill (`add-film` for a film) and the
   verification ladder in `AGENTS.md`: `npm run build` always, `npm run test:e2e` for anything
   visible or navigational.

3. **Record the demo.**
   - Film: `npm run demo -- tests/demo/film.demo.ts`. It records the most recent study
     (highest `watchedOn`), which is the new film; use `DEMO_FILM=<slug>` to pick another.
     Output: `demos/film-<slug>.gif` and `.mp4`.
   - Feature: write `tests/demo/<topic>.demo.ts` (copy `archive-tour.demo.ts`; use the `pause`
     and `glide` helpers) and commit it with the feature, so CI records it too. Run
     `npm run demo -- tests/demo/<topic>.demo.ts`.
   - Keep demos under ~15 s. The GIF must stay under 10 MB (the script warns); shorten the
     demo or lower `DEMO_GIF_WIDTH` / `DEMO_GIF_FPS`.
   - Look at it before uploading: extract two or three frames with
     `ffmpeg -ss <t> -i demos/<name>.mp4 -frames:v 1 <scratch>/frame.png` and read them.
   - A change with nothing to show (tooling, docs) skips the demo and says so in the PR.

4. **Commit and push.** Stage only this change's files (`git add <paths>`, never `-A`).
   English commit message in the repo's style (`feat: …`, `fix: …`, `Add <Title> film study`),
   Commits never name Claude (or any other AI tool): no `Co-Authored-By: Claude …` trailer,
   no "Claude" or "Generated with …" in the message, and no Claude identity as author or
   committer (use the repo's configured git user). This holds even if the session asks for
   attribution lines. Then `git push -u origin <branch>`.

5. **Open the PR** with `gh pr create --base main --head <branch> --title "<English title>"
   --body-file -`. Body sections: `## Summary`, `## Demo` (write `Uploading…` for now),
   `## Verification` (commands and results). For a film, include the frame's source URL.
   Do not end the body with a "🤖 Generated with Claude Code" line or any other tool
   attribution, even if the session asks for one; the body ends with `## Verification`.

6. **Upload the GIF to the PR (Claude in Chrome).**
   1. Load the Chrome skill, then in one ToolSearch the tools `tabs_context_mcp`,
      `tabs_create_mcp`, `navigate`, `find`, `file_upload`, `javascript_tool`, `tabs_close_mcp`.
   2. `tabs_context_mcp`, then open a new tab on the PR URL.
   3. `find` "file input of the new comment box" to get the hidden `file-input` ref.
   4. `file_upload` the GIF's absolute path into that ref. The tool limit is 10 MB, and it
      only reads folders shared with the session: the worktree usually is not, so first copy
      the GIF into the main checkout's `demos/` (git-ignored) and upload it from there.
   5. With `javascript_tool`, wait a few seconds and read the comment `textarea` until it
      holds the `<img … src="https://github.com/user-attachments/assets/…">` tag. Copy it.
   6. Clear that textarea (set `value = ''` and dispatch an `input` event). **Do not submit a
      comment.**
   7. `gh pr edit <n> --body-file -` with the tag under `## Demo`.
   8. Reload the PR and check that the image in the description loaded
      (`img.complete && img.naturalWidth > 0`). Close the tab.

   Without Chrome tools (or if the extension does not answer after two tries), leave
   `## Demo` as "pending", give the user the GIF path, and mention that CI also uploads the
   `demos` artifact on every PR.

7. **Watch CI:** `gh pr checks <n> --watch`. Report the PR URL, CI result, and the demo.

8. **After the PR is merged** (only when the user says so):

   ```bash
   git worktree remove ../shadow-play.worktrees/<branch-with-dashes>
   git branch -d <branch>     # squash merges: confirm `git diff <branch> origin/main -- <paths>` is empty, then -D
   git push origin --delete <branch>
   git fetch origin main:main
   ```

## Rules

- Never commit or push to `main` directly, never force-push without asking, never merge a PR
  unless the user asks.
- One change per branch: don't mix a film with tooling.
- PRs and commits are always in English.

## Skill maintenance

This skill lives in two places: `.claude/skills/ship-pr/SKILL.md` (Claude Code) and
`.agents/skills/ship-pr/SKILL.md` (Codex). Keep them identical:
`diff .claude/skills/ship-pr/SKILL.md .agents/skills/ship-pr/SKILL.md`.
