---
name: vercel-deploy
description: Generate a complete Manus deploy brief for any 33V product. Use at the end of every build session before handing off to Manus.
user-invocable: true
model: haiku
---

# Vercel Deploy Skill

Generates a precise, copy-paste-ready Manus brief. Use after every build.

## REPO → VERCEL PROJECT MAPPING

| Product | Repo | Vercel URL | Env Vars |
|---|---|---|---|
| FORGE | workwithlos-ui/content-factory | content-factory-ochre.vercel.app | ANTHROPIC_API_KEY + OPENAI_API_KEY |
| SIGNAL | workwithlos-ui/elios-media-os | elios-media-os.vercel.app | ANTHROPIC_API_KEY |
| QUORUM | workwithlos-ui/quorum | elios-agent-os.vercel.app | ANTHROPIC_API_KEY |
| AXIS | workwithlos-ui/elios-os | elios-os-pi.vercel.app | ANTHROPIC_API_KEY |
| ORBIT | workwithlos-ui/elios-hq | elios-hq.vercel.app | ANTHROPIC_API_KEY |
| PAID | workwithlos-ui/paid | growth-engine-topaz.vercel.app | ANTHROPIC_API_KEY |

## BRIEF TEMPLATE

```
MANUS DEPLOY BRIEF
==================
Product: [FORGE / SIGNAL / QUORUM / AXIS / ORBIT / PAID]
Repo: workwithlos-ui/[repo-name]
Action: [Push files to existing repo / Create new repo / Create new Vercel project]

FILES CHANGED:
- [path/to/file.ts] — [what changed]
- [path/to/file.ts] — [what changed]

COMMIT MESSAGE:
"[verb]: [what changed and why — one clear sentence]"

VERCEL:
- Project: [existing project name OR "create new project"]
- Framework: Next.js
- Root directory: / (default)
- Env vars to confirm: [list each ANTHROPIC_API_KEY / OPENAI_API_KEY]
- Auto-deploy: Yes (GitHub push triggers deploy)

POST-DEPLOY TEST:
1. Go to: [specific URL]
2. Do: [specific action — fill form / click button / open page]
3. Expect: [what success looks like — specific, not "it should work"]

REPORT BACK:
- Confirm deploy succeeded
- Share any error messages if deploy fails
- Test result: [pass/fail]
```

## FOR NEW REPOS (QUORUM, PAID)
```
ACTION: Create new GitHub repo workwithlos-ui/[repo-name]
Then: Create new Vercel project linked to this repo
Framework: Next.js
Root: /
Connect domain: [current .vercel.app URL stays, just changes source]
Add env vars: ANTHROPIC_API_KEY
Push files from [zip file name]
```

## GOTCHAS
- New repos need BOTH a GitHub repo AND a Vercel project created
- Private repos (elios-os) need explicit confirmation before pushing
- FORGE needs BOTH env vars — Anthropic + OpenAI
- Always include a specific test step — not "test it" but exactly what to click and what to expect
- Manus should report back with pass/fail on the test, not just "deployed"
