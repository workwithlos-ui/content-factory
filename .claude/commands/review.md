---
name: review
description: Run code review quality gate before any deploy. Checks for ELIOS law violations, broken routes, missing error handling.
---

Run a quality gate review on: $ARGUMENTS

Use the code-reviewer agent.

Check in order:

**CRITICAL (block if found):**
- Hardcoded API keys or secrets
- Missing try/catch on fetch calls
- JSON.parse without error handling
- Wrong AI model in wrong route (OpenAI where Claude should be or vice versa)
- Missing error response on failure paths

**IMPORTANT (flag):**
- Console.log in production code
- SPCL weights changed from canonical (S=0.18, P=0.20, C=0.15, L=0.10)
- Anti-slop rulebook modified without instruction

**ELIOS LAW VIOLATIONS:**
- Law 3: n8n / Make.com / Zapier found in code
- Law 1: Feature with no price tag or upsell path

Verdict: APPROVED TO SHIP or NEEDS FIXES FIRST
If fixes needed: list exactly what to change.
