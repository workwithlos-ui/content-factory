---
name: score
description: Score any content piece on SPCL and get routing + rewrite guidance
---

Score this content on the SPCL framework for 33V / Los Silva / ELIOS.

Use the spcl-scoring skill.

Content to score: $ARGUMENTS

Return:
- S score (0-10): Status
- P score (0-10): Power — HIGHEST WEIGHT
- C score (0-10): Credibility
- L score (0-10): Likeness
- Total score (0-100)
- Routing: PUBLISH / REVIEW / REGENERATE / DISCARD
- Top strength (1 sentence)
- Weakest pillar + exact fix to score higher on P

If P score < 7, rewrite the hook with a specific number or named client result.
