---
name: hpva-generator
description: Generate content using the Hook-Proof-Value-Action framework. Use this skill when creating any content piece — LinkedIn posts, emails, video scripts, X threads. Each section is generated and scored separately.
user-invocable: true
model: sonnet
---

# HPVA Generator Skill

Generate content in Hook → Proof → Value → Action format with individual section scores.

## Framework

### H — Hook (25% of post weight)
Stop the scroll. First 1-2 sentences only.
Allowed openings:
- Specific number or dollar amount: "4 hours → 60 seconds."
- Bold contrarian claim: "Most AI tools are middleware dressed up as AI."
- Confession: "I almost hired three people. Then I built this instead."
- Named result: "Kent Clothier's $35K system answered 200 questions last week."

Banned openings:
- "In today's..."
- "Have you ever..."
- "I'm excited to share..."
- "As a [title]..."
- "When it comes to..."

### P — Proof (20% of post weight)
Named client + specific metric + verifiable outcome.
- BAD: "A client saw great results"
- GOOD: "Kent Clothier's RAG system: 88%+ confidence on 200+ weekly queries"
- BAD: "We helped an agency scale"
- GOOD: "Sanjay's team: speed-to-lead dropped from 4hr 14min to 58 seconds"

### V — Value (40% of post weight)
The actual insight. 3+ concrete points. Structured for scanning.
- Use line breaks, arrows (→), or numbered steps
- Each point must be actionable or illuminating
- No filler. No throat-clearing.
- Mobile-first: max 3 lines per paragraph

### A — Action (15% of post weight)
Keyword CTA. Low friction. Tied to an offer.
- "DM 'demo' for the live URL"
- "Reply YES and I'll send the framework"
- "Comment 'OS' and I'll share the build"
- Never: "What do you think?" or "Let me know in the comments"

## Score each section (0-10)
After generating, score each H/P/V/A section individually on SPCL.
Report: H score, P score, V score, A score → weighted total.

## Platform adaptations
**LinkedIn:** 150-250 words. Short paragraphs. 3-5 hashtags at end only.
**X/Twitter:** One idea per tweet. 5-8 tweet thread. Each tweet standalone.
**Email:** Subject line + preview text + one problem + one solution + one CTA.
**Shorts script:** Hook in first 3 words. Hard payoff before 60 seconds.

## Gotchas
- Hook is the most important section — if it fails, nothing else matters
- Proof must be named and specific — "a client" fails every time
- Value should have the highest word count but lowest density (scan-optimized)
- CTA keyword triggers are more powerful than ask-based CTAs
