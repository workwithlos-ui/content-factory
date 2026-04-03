const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcekhfscmyuiohxhdkzf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZWtoZnNjbXl1aW9oeGhka3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDQ2MDcsImV4cCI6MjA4OTk4MDYwN30.GBLlXaCtwH_bU2v1RFqu_AS7tq6iZhyRwR9GK-YZ6X8';

export interface SharedContext {
  business: any;
  audiences: any[];
  proof_bank: any[];
  voice: any;
  platform_specs: Record<string, any>;
  spcl_weights: Record<string, number>;
  offers: any[];
  constraints: string[];
}

let _cache: { data: SharedContext | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchSharedContext(contextKey = 'default'): Promise<SharedContext | null> {
  if (_cache.data && Date.now() - _cache.timestamp < CACHE_TTL) {
    return _cache.data;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shared_context?context_key=eq.${contextKey}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return _cache.data;
    const rows = await res.json();
    if (!rows.length) return _cache.data;
    const row = rows[0];
    const ctx: SharedContext = {
      business: row.business,
      audiences: row.audiences,
      proof_bank: row.proof_bank,
      voice: row.voice,
      platform_specs: row.platform_specs,
      spcl_weights: row.spcl_weights,
      offers: row.offers,
      constraints: row.constraints,
    };
    _cache = { data: ctx, timestamp: Date.now() };
    return ctx;
  } catch (err) {
    console.error('[shared-context] Fetch error:', err);
    return _cache.data;
  }
}

export function formatContextForPrompt(ctx: SharedContext): string {
  return `
BUSINESS CONTEXT:
Company: ${ctx.business.name} | Founder: ${ctx.business.founder}
Priority: ${ctx.business.current_priority} | Revenue Target (30d): $${ctx.business.revenue_target_30d?.toLocaleString()}
Cash Urgency: ${ctx.business.cash_urgency}
Primary Offer: ${ctx.business.primary_offer}
Constraints: ${ctx.constraints.join(' | ')}

OFFERS:
${ctx.offers.map((o: any) => `- ${o.name}: $${o.setup} setup + $${o.monthly}/mo — ${o.desc}`).join('\n')}

TARGET AUDIENCES:
${ctx.audiences.map((a: any) => `[${a.id}] ${a.name} (Spend: $${a.spend_level})\n  Pains: ${a.top_pains.join('; ')}\n  Desired Outcomes: ${a.desired_outcomes.join('; ')}\n  Objections: ${a.objections.join('; ')}\n  Buying Triggers: ${a.buying_triggers.join('; ')}`).join('\n\n')}

PROOF BANK:
${ctx.proof_bank.map((p: any) => `- [${p.id}] ${p.client} (${p.type}): ${p.summary} [Metric: ${p.metric}, Strength: ${p.strength}]`).join('\n')}

VOICE RULES:
Tone: ${ctx.voice.tone.join(', ')}
Style: ${ctx.voice.style_ref}
Forbidden Words: ${ctx.voice.forbidden.join(', ')}
Preferred Patterns: ${ctx.voice.preferred_patterns.join(', ')}
Signature Phrases: ${ctx.voice.signature_phrases.join(', ')}
`.trim();
}
