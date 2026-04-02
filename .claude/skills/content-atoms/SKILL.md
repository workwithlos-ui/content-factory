---
name: content-atoms
description: Extract reusable content atoms from any source material. Use when ingesting transcripts, notes, URLs, or voice memos. Each atom is typed, SPCL-scored, and mapped to audiences.
user-invocable: true
model: sonnet
---

# Content Atoms Extraction Skill

Turn raw source material into typed, reusable atoms for SIGNAL's content engine.

## ATOM TYPES

**claim** — A direct assertion with a specific number or outcome
Example: "Speed-to-lead dropped from 4 hours 14 minutes to 58 seconds after deploying the AI SDR."

**story** — A founder or client narrative with tension, resolution, and business lesson
Example: "I was about to hire three people. Then I built the same capability in Claude Code in a weekend."

**framework** — A named repeatable system or process
Example: "The SPCL framework: Status, Power, Credibility, Likeness — score every piece before posting."

**proof** — Concrete evidence, named client, objective metric
Example: "Kent Clothier's Boardroom Brain: 200+ questions per week, 88%+ confidence, $35K build."

**objection_answer** — Response to a specific buyer hesitation
Example: "Objection: 'We already use n8n.' Answer: n8n is plumbing. Claude-native is intelligence."

**contrarian_take** — Anti-consensus angle stated as fact
Example: "Most AI content tools make your content worse. They score readability, not revenue influence."

**cta_bridge** — Sentence linking value delivered to the action you want
Example: "If this resonated, DM 'demo' and I'll show you the live system."

## EXTRACTION PROCESS
For each piece of source material:
1. Read fully before extracting anything
2. Extract every reusable idea — minimum 8 atoms, maximum 25
3. Label type, SPCL primary pillar, target audience, awareness stage, strength (0-1)
4. Flag top 5 hooks derived from the source
5. List 5-7 content angles this source can become

## SPCL PILLAR MAPPING
S = atom makes you look like you control something valuable
P = atom gives specific directions that work
C = atom provides named, verifiable evidence
L = atom is authentically founder-specific

## AUDIENCE MAPPING
agency_owners — $1M–$20M agencies, pain: scaling by hiring
dtc_brands — $5M–$50M DTC, pain: content volume + attribution
personal_brands — Experts, pain: volume + voice preservation
home_services — $1M–$10M trades, pain: local presence + speed-to-lead

## AWARENESS STAGE MAPPING
unaware → curiosity hooks, pattern interrupts
problem_aware → pain articulation, diagnosis, "this is why you're stuck"
solution_aware → framework teaching, comparisons, process breakdowns
product_aware → proof posts, objection handling, implementation stories
most_aware → direct CTA, urgency, offer specifics

## STRENGTH SCORING
0.9+ = high confidence, specific, named, verifiable
0.7-0.9 = good, specific but could be stronger
0.5-0.7 = moderate, needs more specificity
<0.5 = weak, too generic to use without significant rework

## GOTCHAS
- Generic inspiration scores <0.4 strength — flag immediately
- "We" is weaker than naming the client — push for the named version
- Claims without numbers score low on P — find the number
- Best atoms often come from throwaway comments, not prepared statements
