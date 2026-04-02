---
name: spcl-scoring
description: Score any content on the SPCL framework and return routing decision. Use this skill when generating, reviewing, or optimizing any content piece for 33V products.
user-invocable: true
model: sonnet
---

# SPCL Scoring Skill

Score content on Hormozi's influence framework. Used by all 33V products.

## Formula
Total = (0.18×S + 0.20×P + 0.15×C + 0.10×L + 0.12×ICP + 0.10×CVR + 0.08×PLT + 0.05×NOV − 0.08×RISK) × 10

## Pillars
**S — Status (18%):** Shows control of scarce resources or enviable outcomes. Named deals, equity stakes, live URLs.
**P — Power (20% — HIGHEST):** Gives specific directions likely to produce results. Before/after proof, exact frameworks, specific numbers.
**C — Credibility (15%):** Third-party validation. Named clients (Kent Clothier, Trusted Roofing). Specific metrics.
**L — Likeness (10%):** Authentic, founder-real. The "stopped hiring" story. Builder not consultant.

## Routing
- 90+ → PUBLISH auto
- 75-89 → REVIEW queue
- 60-74 → REGENERATE with guidance
- <60 → DISCARD

## Output every time
1. S/P/C/L scores (0-10 each)
2. ICP fit, conversion, platform, novelty, risk (0-10 each)
3. Total score (0-100)
4. Routing decision
5. Top strength (1 sentence)
6. Weakest pillar + specific fix

## ELIOS proof points to use for C (Credibility)
- Kent Clothier: $35K RAG build delivered
- Sales AI client: 4hr 14min → 58 seconds speed-to-lead
- Trusted Roofing: Los holds equity stake
- ELIOS OS: 5 live Vercel deployments
- $200K+ headcount replaced per client

## Forbidden words (auto-lower score if found)
leverage, synergy, game-changer, revolutionary, unlock, empower,
"at the end of the day", "in today's landscape", "I'm excited to share"

## Gotchas
- P is almost always the weakest — fix it first
- "A client said" = 0 points on C. Must have a name.
- Opening with generic statement = −5 on P immediately
- Opening with specific number or named result = +3 on P
