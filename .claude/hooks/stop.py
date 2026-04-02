#!/usr/bin/env python3
"""
Stop Hook — 33V / ELIOS
Nudges Claude to verify its work before stopping.
Checks: Did we ship something? Does it need a deploy brief? SPCL scored?
Place in: .claude/hooks/stop.py
Configure in: .claude/settings.json (Stop event)
"""

import json
import sys

def main():
    """Read stop event and provide nudge if needed."""

    try:
        event = json.loads(sys.stdin.read())
    except:
        event = {}

    stop_reason = event.get("reason", "")
    last_tool = event.get("last_tool", "")

    # If Claude just wrote files, nudge to run /review
    if last_tool in ["Write", "Edit", "str_replace"]:
        print("""
⚡ STOP CHECK:
Code was written. Before marking done:
1. Run /review on the changed files
2. If approved → run /deploy for the Manus brief
3. If content was generated → run /score to verify SPCL
4. Did this build have a price tag? (ELIOS Law 1)
""")
        return 1  # Exit code 1 = nudge Claude to continue

    # If a deploy brief was generated, nudge to confirm Manus was briefed
    if "manus" in str(event).lower() or "deploy" in str(event).lower():
        print("""
⚡ STOP CHECK:
Deploy brief generated. Did you:
1. Hand the brief to Manus explicitly?
2. Include env var check (ANTHROPIC_API_KEY)?
3. Include a specific test step (not just "check it works")?
""")
        return 1

    # Default: allow stop
    return 0

if __name__ == "__main__":
    sys.exit(main())
