# CLAUDE.md — FORGE (Content Factory)
# Drop this in the root of workwithlos-ui/content-factory

## What this is
FORGE is a 33V AI content SaaS. Brand voice training + 7-platform generation + SPCL scoring.
Live: content-factory-ochre.vercel.app | Target: forge.33v.ai

## Stack
Next.js 14 App Router · TypeScript · Tailwind · Vercel
AI: OpenAI gpt-4.1-mini (generate) + Claude Sonnet 4.5 (voice + competitive)
Source: src/app/ (not app/ — App Router is inside src/)

## Env vars (both required)
- OPENAI_API_KEY — /api/generate, /api/suggest-topics, /api/remix, /api/trends
- ANTHROPIC_API_KEY — /api/analyze-voice, /api/competitive, /api/analyze-example

## Route map
| Route | AI | Status |
|---|---|---|
| /api/generate | OpenAI | WORKING |
| /api/analyze-voice | Claude | FIXED Apr 1 2026 |
| /api/competitive | Claude + web fetch | FIXED Apr 1 2026 |
| /api/interview | OpenAI | WORKING |
| /api/extract-profile | OpenAI | WORKING |
| /api/first-content | OpenAI | WORKING |
| /api/suggest-topics | OpenAI | WORKING |
| /api/remix | OpenAI | WORKING |
| /api/trends | OpenAI | WORKING |

## App structure
- src/app/(app)/ — authenticated pages
- src/app/onboarding/ — 4-step flow: Company → Voice → Channels → First Content
- src/app/dashboard/ — main dashboard
- src/app/login|signup/ — auth

## NEVER modify without explicit instruction
- The 12-rule Anti-Slop Rulebook in /api/generate/route.ts
- SPCL weights: S=0.18, P=0.20 (highest), C=0.15, L=0.10
- OpenAI routes stay OpenAI. Claude routes stay Claude.
- Onboarding 4-step order

## Build queue (in order)
1. SPCL score on every generated piece
2. HPVA mode (Hook/Proof/Value/Action individually scored)
3. Direct publish: LinkedIn API, X API, Beehiiv API
4. Content calendar
5. Multi-brand for agencies
6. White-label (logo/domain per agency)

## Pricing targets
Starter $97/mo | Pro $297/mo | Agency $897/mo | Enterprise $2,497/mo

## Test after any change
content-factory-ochre.vercel.app → Brand Voice tab → paste text → analyze
content-factory-ochre.vercel.app → Competitive Intel → enter jasper.ai → analyze
