---
name: deploy
description: Generate a complete Manus deploy brief for the current product
---

Generate a Manus deploy brief for this build.

Use the vercel-deploy skill.

Product being deployed: $ARGUMENTS

Include:
- Repo name and branch
- All files changed with paths
- Commit message (clear, verb-first)
- Vercel project name
- Env vars to confirm
- Step-by-step post-deploy test (specific URL + action + expected result)
- What Manus should report back

Format as a copy-paste-ready brief. No vague steps.
