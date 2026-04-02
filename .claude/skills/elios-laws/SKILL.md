---
name: elios-laws
description: Enforce the 8 ELIOS laws on any build, process, or decision. Automatically preloaded into all build sessions. Flags violations before they ship.
user-invocable: false
model: haiku
---

# ELIOS Laws Enforcement Skill

The 8 non-negotiable operating laws for 33V and ELIOS. Applied to every build, decision, and output.

## THE 8 LAWS

**LAW 1 — Every build has a price tag before it starts**
Before touching code: what does this sell for? If no price, no build.
Violation: Building a feature with no monetization plan.
Fix: Assign a price tier or a clear upsell path before starting.

**LAW 2 — Build once. Sell many.**
Every client build becomes a product sold to the next 10.
Violation: Building the same thing for two clients without productizing it.
Fix: After first build, create a template, SOP, and price tag.

**LAW 3 — Claude-native only. No middleware.**
No n8n. No Make.com. No Zapier. Claude API directly.
Violation: Any route that uses a workflow tool as the AI layer.
Fix: Replace with a direct Claude API fetch call.

**LAW 4 — Every process → SOP → product**
If it works, document it. If you document it, price it.
Violation: A repeatable process that exists only in someone's head.
Fix: Write the SOP. Add it to the ELIOS skills library.

**LAW 5 — Ship the demo first**
Don't pitch an idea. Build the demo. Show the URL.
Violation: Sending a proposal with no live product to demo.
Fix: Build the minimum demo in Claude Code. Deploy. Send the URL.

**LAW 6 — Quality gates before anything ships**
SPCL score all content. Code review before Manus deploys.
Violation: Sending content with a SPCL score below 75.
Violation: Pushing code without a code review pass.
Fix: Score it. If below 75, regenerate. If below 60, discard.

**LAW 7 — Proof over claims**
Named clients. Specific metrics. Live URLs. Third-party validation.
Violation: "We can help you..." without a named result.
Violation: "A client said..." without naming the client.
Fix: Kent Clothier $35K. 4hr → 60s. Trusted Roofing equity. 5 live URLs.

**LAW 8 — Revenue urgency is always high**
$75K/month April target. Every task weighted by revenue impact.
Violation: Spending more than 2 hours on a non-revenue task.
Fix: Ask "does this move money?" If no, deprioritize.

## CHECKING COMPLIANCE
Before shipping anything, run through all 8 laws.
Flag any violation immediately — do not proceed without resolution.

## Gotchas
- Law 3 violation is the most common — always check if middleware snuck in
- Law 7 violation is the most impactful — generic claims cost closes
- Law 5 is the fastest path to a sale — URL first, proposal second
