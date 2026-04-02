#!/usr/bin/env python3
"""
SessionStart Hook — 33V / ELIOS
Automatically loads context at the start of every Claude Code session.
Place in: .claude/hooks/session-start.py
Configure in: .claude/settings.json
"""

import json
import subprocess
import datetime
import sys

def get_context():
    context = {
        "operator": "Los Silva",
        "alias": "Cody",
        "company": "ELIOS / 33V",
        "date": datetime.datetime.now().strftime("%B %d, %Y"),
        "revenue_target": "$75,000 April 2026",
        "urgency": "HIGH — pipeline now",
        "stack": "Claude-native + Next.js + Vercel",
        "deploy_agent": "Manus",

        "active_products": [
            "FORGE (content-factory) — 2 bugs fixed, ready to charge",
            "QUORUM (agent OS) — agent prompts deployed via Manus",
            "SIGNAL (media OS) — UI complete, needs auth + publish connectors",
            "PAID (growth-engine) — diagnostic form needs wiring to /api/playbook",
            "AXIS (elios-os) — hub exists, needs auth + multi-client",
            "ORBIT (elios-hq) — most complete, needs live Stripe/GitHub/Vercel data",
        ],

        "active_clients": [
            "Kent Clothier (Boardroom Brain) — $35K delivered, balance owed, follow up",
            "Sales AI Acceleration (Sanjay/Michelle/CEO) — 90-day phase build",
            "Trusted Roofing (Ryan Hill) — CMO OS live, Los holds equity",
        ],

        "elios_laws": [
            "1: Every build has a price tag before it starts",
            "2: Build once. Sell many.",
            "3: Claude-native only — no n8n, no Make, no Zapier",
            "4: Every process → SOP → product",
            "5: Ship the demo first",
            "6: Quality gates before anything ships",
            "7: Proof over claims — named clients, specific metrics",
            "8: Revenue urgency always high",
        ],

        "repo_map": {
            "FORGE": "workwithlos-ui/content-factory",
            "SIGNAL": "workwithlos-ui/elios-media-os",
            "QUORUM": "workwithlos-ui/quorum",
            "AXIS": "workwithlos-ui/elios-os",
            "ORBIT": "workwithlos-ui/elios-hq",
            "PAID": "workwithlos-ui/paid",
        }
    }
    return context

def main():
    """Output context as a session start message."""
    ctx = get_context()

    message = f"""
=== 33V SESSION CONTEXT LOADED ===
Operator: {ctx['operator']} (Cody)
Date: {ctx['date']}
Revenue target: {ctx['revenue_target']} | Urgency: {ctx['urgency']}

ACTIVE PRODUCTS:
{chr(10).join('  • ' + p for p in ctx['active_products'])}

ACTIVE CLIENTS:
{chr(10).join('  • ' + c for c in ctx['active_clients'])}

ELIOS LAWS (enforced):
{chr(10).join('  • ' + l for l in ctx['elios_laws'])}

Stack: {ctx['stack']} | Deploy via: {ctx['deploy_agent']}
Commands: /score /deploy /board /hpva /review
===================================
"""

    # Write to stdout for Claude Code to display
    print(message)

    # Also output as JSON for programmatic use
    output = {
        "type": "session_context",
        "context": ctx,
        "message": "33V context loaded. All ELIOS laws enforced. Revenue urgency: HIGH."
    }

    return 0

if __name__ == "__main__":
    sys.exit(main())
