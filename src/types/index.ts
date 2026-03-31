// ─── USER ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  industry?: string;
  targetAudience?: string;
  websiteUrl?: string;
  channels: string[];
  onboardingComplete: boolean;
  onboardingPath?: 'questions' | 'paste' | 'interview';
  modelPreference?: ModelPreference;
  defaultUtmBaseUrl?: string;
  createdAt: string;
}

// ─── BRAND VOICE DNA (new context engineering feature) ───────
export interface BrandVoiceDNA {
  brandName: string;
  voiceDescriptors: string; // e.g. "direct, no-BS, tactical, slightly irreverent"
  phrasesTheyUse: string[]; // e.g. "here's the play", "let me break this down"
  phrasesTheyNeverUse: string[]; // e.g. "leverage", "synergy"
  writingStyleReference: string; // e.g. "Alex Hormozi meets Tim Ferriss"
  targetAudienceDescription: string;
  audiencePainPoints: string;
  updatedAt: string;
}

// ─── CONTENT EXAMPLES LIBRARY (new context engineering feature) ──
export interface ContentExample {
  id: string;
  title: string;
  content: string;
  platform: Platform | 'general';
  contentType: string; // hook, thread, carousel, newsletter, etc.
  tags: string[];
  analyzedPatterns?: string; // AI-extracted patterns
  createdAt: string;
  updatedAt: string;
}

// ─── AUDIENCE PSYCHOGRAPHIC PROFILES (new context engineering feature) ──
export interface AudienceProfile {
  id: string;
  name: string; // e.g. "Agency owners doing $10K-50K/month"
  painPoints: string[]; // top 3
  desires: string[]; // top 3
  objections: string[]; // biggest objections to buying
  language: string[]; // actual phrases from their world
  failedSolutions: string[]; // what they've tried that didn't work
  scrollStoppers: string[]; // what makes them stop scrolling
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── CREATOR FRAMEWORKS ─────────────────────────────────────
export type CreatorFramework =
  | 'hormozi-hook-retain-reward'
  | 'brunson-epiphany-bridge'
  | 'ferriss-recipe'
  | 'welsh-paips'
  | 'koe-authority'
  | 'custom'
  | 'auto';

export const CREATOR_FRAMEWORK_LABELS: Record<CreatorFramework, { name: string; description: string }> = {
  'hormozi-hook-retain-reward': {
    name: 'Hormozi Hook/Retain/Reward',
    description: 'Hook with shock/question/bold promise. Deliver value immediately. End with specific actionable takeaway.',
  },
  'brunson-epiphany-bridge': {
    name: 'Brunson Epiphany Bridge',
    description: 'Backstory. The Wall. The Epiphany. The Plan. The Result.',
  },
  'ferriss-recipe': {
    name: 'Ferriss Recipe Method',
    description: 'Exact steps, tools, templates. Intensely practical and specific.',
  },
  'welsh-paips': {
    name: 'Welsh PAIPS',
    description: 'Problem. Agitate. Intrigue. Positive Future. Solution.',
  },
  'koe-authority': {
    name: 'Koe Authority Builder',
    description: 'Growth + Authenticity + Authority content rotation.',
  },
  'custom': {
    name: 'Custom Framework',
    description: 'User-defined framework structure.',
  },
  'auto': {
    name: 'Auto-Select',
    description: 'AI picks the best framework for the platform and topic.',
  },
};

// ─── LEGACY TYPES (preserved for backward compatibility) ─────
export interface BusinessProfile {
  whatYouSell?: string;
  pricePoint?: string;
  whyPeopleSayNo?: string;
  competitorWeakness?: string;
  bestCustomerStory?: string;
  barExplanation?: string;
  strongOpinion?: string;
  contentSamples?: string[];
  urlAnalysis?: string;
}

export interface BrandIntelligenceProfile {
  positioningStatement: string;
  corePainPoints: string[];
  objectionMap: { objection: string; reframe: string }[];
  competitiveWedge: string;
  transformationArc: { before: string; after: string };
  voiceDNA: VoiceDNA;
  contentAngles: string[];
  authorityMarkers: string[];
  rawAnswers?: BusinessProfile;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceDNA {
  sentenceStructure: string;
  vocabularyLevel: string;
  openingPatterns: string[];
  reasoningStyle: string;
  energySignature: string;
  forbiddenPatterns: string[];
  signatureMoves: string[];
  emotionalRange: string;
  summary: string;
}

export interface StrategicBrief {
  strategicAngle: string;
  emotionalHook: string;
  proofPoints: string[];
  platformFrameworks: Record<Platform, ContentFramework>;
  platformPriority: Platform[];
}

export interface TopicIdea {
  id?: string;
  hook: string;
  angle: string;
  framework: ContentFramework;
  recommendedFramework?: string;
  proofPoint: string;
  keyProofPoint?: string;
  bestPlatform: string;
  buyerStage: 'awareness' | 'consideration' | 'decision';
  journeyStage?: 'awareness' | 'consideration' | 'decision';
}

export interface VoiceSample {
  id: string;
  content: string;
  source: string;
  addedAt: string;
}

export interface BrandVoice {
  samples: VoiceSample[];
  characteristics: {
    tone: string[];
    vocabulary: string[];
    sentenceStructure: string[];
    frameworks: string[];
  };
  summary: string;
  updatedAt?: string;
  voiceConfidence: number;
  buildMethod?: 'questions' | 'paste' | 'interview' | 'url-analysis';
  businessProfile?: BusinessProfile;
}

export interface InterviewMessage {
  role: 'ai' | 'user';
  content: string;
  questionKey?: string;
}

export type ContentFramework =
  | 'pas'
  | 'before-after-bridge'
  | 'contrarian-proof'
  | 'most-people-think'
  | 'story-lesson-action'
  | 'data-insight-application'
  | 'question-answer-framework'
  | 'myth-busting'
  | 'step-by-step'
  | 'case-study'
  | 'prediction-preparation'
  | 'old-way-new-way';

export const FRAMEWORK_LABELS: Record<ContentFramework, string> = {
  'pas': 'Problem \u2192 Agitate \u2192 Solve',
  'before-after-bridge': 'Before / After / Bridge',
  'contrarian-proof': 'Contrarian Take + Proof',
  'most-people-think': '"Most people think X. Here\'s what actually works."',
  'story-lesson-action': 'Story \u2192 Lesson \u2192 Action',
  'data-insight-application': 'Data \u2192 Insight \u2192 Application',
  'question-answer-framework': 'Question \u2192 Answer \u2192 Framework',
  'myth-busting': 'Myth-Busting (3 myths debunked)',
  'step-by-step': 'Step-by-Step Tactical Breakdown',
  'case-study': 'Case Study',
  'prediction-preparation': 'Prediction + Preparation',
  'old-way-new-way': 'Old Way vs New Way',
};

export type AIModel = 'gpt-4.1-mini' | 'gemini-2.5-flash';
export type ModelPreference = 'auto' | 'gpt' | 'claude';

export const PLATFORM_CONTENT_TYPES: Record<Platform, string> = {
  twitter: 'thread',
  linkedin: 'post',
  instagram: 'caption',
  email: 'newsletter',
  blog: 'article',
};

export const PLATFORM_MODEL_MAP: Record<Platform, AIModel> = {
  twitter: 'gpt-4.1-mini',
  linkedin: 'gemini-2.5-flash',
  instagram: 'gpt-4.1-mini',
  email: 'gemini-2.5-flash',
  blog: 'gemini-2.5-flash',
};

export const MODEL_LABELS: Record<AIModel, { name: string; badge: string; color: string }> = {
  'gpt-4.1-mini': { name: 'GPT-4.1 Mini', badge: 'GPT', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-700' },
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', badge: 'Gemini', color: 'bg-violet-900/30 text-violet-400 border-violet-700' },
};

export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content: string;
}

export interface UTMLink {
  id: string;
  projectId: string;
  pieceId: string;
  platform: Platform;
  baseUrl: string;
  utmParams: UTMParams;
  fullUrl: string;
  createdAt: string;
}

// ─── QUALITY FILTER (Anti-Slop) ─────────────────────────────
export interface HumanScore {
  overall: number; // 1-10
  slopWordsFound: string[];
  openingIsSpecific: boolean;
  hasIrregularRhythm: boolean;
  hasSpecificDetails: boolean; // numbers, names, data points
  hasHedgingLanguage: boolean;
  feedback: string[];
  autoRewritten: boolean;
}

export interface ContentPiece {
  id: string;
  projectId: string;
  platform: Platform;
  content: string;
  qualityScore: number;
  qualityBreakdown?: QualityBreakdown;
  humanScore?: HumanScore;
  framework?: ContentFramework;
  creatorFramework?: CreatorFramework;
  aiReasoning?: string;
  model?: AIModel;
  utmLink?: UTMLink;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
}

export interface QualityBreakdown {
  hookStrength: number;
  specificity: number;
  tacticalDepth: number;
  voiceMatch: number;
  ctaClarity: number;
  platformOptimization: number;
  reasons: string[];
  fixes?: string[];
}

export interface ContentProject {
  id: string;
  userId: string;
  title: string;
  topic: string;
  keyPoints: string;
  tonePreference: string;
  targetAudience: string;
  sourceType: 'topic' | 'url' | 'notes' | 'audio' | 'remix';
  sourceContent: string;
  pieces: ContentPiece[];
  strategicBrief?: StrategicBrief;
  audienceProfileId?: string;
  creatorFramework?: CreatorFramework;
  status: 'generating' | 'complete' | 'error';
  createdAt: string;
  updatedAt: string;
}

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'email'
  | 'blog';

export const PLATFORMS: { key: Platform; label: string; icon: string; color: string }[] = [
  { key: 'linkedin', label: 'LinkedIn Post', icon: 'Linkedin', color: '#0A66C2' },
  { key: 'twitter', label: 'Twitter/X Thread', icon: 'Twitter', color: '#1DA1F2' },
  { key: 'instagram', label: 'Instagram Caption', icon: 'Instagram', color: '#E4405F' },
  { key: 'email', label: 'Email Newsletter', icon: 'Mail', color: '#6366f1' },
  { key: 'blog', label: 'SEO Blog Post', icon: 'FileText', color: '#059669' },
];

export interface DashboardStats {
  contentGenerated: number;
  pipelineInfluenced: number;
  avgQualityScore: number;
  platformDistribution: Record<string, number>;
  projectCount: number;
  recentProjects: ContentProject[];
}

export interface OnboardingData {
  step: number;
  company: string;
  industry: string;
  targetAudience: string;
  websiteUrl: string;
  voiceSamples: string[];
  channels: string[];
  voicePath: 'questions' | 'paste' | 'interview' | null;
}

export interface ActivationState {
  milestones: {
    onboardingComplete: boolean;
    voiceProfileBuilt: boolean;
    firstContentGenerated: boolean;
    threeContentGenerated: boolean;
    contentCopied: boolean;
    contentDownloaded: boolean;
    returnedDay2: boolean;
    voiceRetrained: boolean;
  };
  firstLoginDate: string;
  lastLoginDate: string;
  loginDays: string[];
  contentGeneratedCount: number;
  copyCount: number;
  downloadCount: number;
  dismissedTips: string[];
  seenFeatures: string[];
  currentStreak: number;
  weeklyTopicsSuggested?: string[];
  weeklyTopicsSuggestedAt?: string;
}

export interface IndustryBenchmark {
  avgContentPerMonth: number;
  avgQualityScore: number;
  avgPipelinePerMonth: number;
  avgLeadsPerMonth: number;
  topTopics: string[];
  competitorGaps: string[];
}

export const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  'B2B SaaS': {
    avgContentPerMonth: 28, avgQualityScore: 8.4, avgPipelinePerMonth: 47000, avgLeadsPerMonth: 12,
    topTopics: ['Product-led growth strategies', 'SaaS metrics that matter', 'Customer retention playbooks', 'Pricing strategy deep-dives', 'Integration ecosystem building'],
    competitorGaps: ['Implementation risk mitigation', 'Post-sale content strategies', 'Technical buyer enablement'],
  },
  'Consulting': {
    avgContentPerMonth: 24, avgQualityScore: 8.6, avgPipelinePerMonth: 62000, avgLeadsPerMonth: 8,
    topTopics: ['Framework breakdowns', 'Case study storytelling', 'Industry trend analysis', 'Methodology deep-dives', 'Client transformation stories'],
    competitorGaps: ['ROI quantification methods', 'Change management content', 'Procurement-focused content'],
  },
  'Agency': {
    avgContentPerMonth: 32, avgQualityScore: 8.7, avgPipelinePerMonth: 55000, avgLeadsPerMonth: 15,
    topTopics: ['Campaign breakdowns', 'Creative process insights', 'Platform algorithm updates', 'Client results showcases', 'Industry predictions'],
    competitorGaps: ['Attribution methodology content', 'In-house vs agency comparisons', 'Emerging platform strategies'],
  },
  'E-Commerce': {
    avgContentPerMonth: 30, avgQualityScore: 8.2, avgPipelinePerMonth: 35000, avgLeadsPerMonth: 20,
    topTopics: ['Conversion optimization', 'Customer journey mapping', 'Seasonal strategy guides', 'Platform comparison content', 'Supply chain insights'],
    competitorGaps: ['Post-purchase experience content', 'Sustainability storytelling', 'Community building strategies'],
  },
  'Other': {
    avgContentPerMonth: 20, avgQualityScore: 8.3, avgPipelinePerMonth: 40000, avgLeadsPerMonth: 8,
    topTopics: ['Industry trend analysis', 'Best practice guides', 'Case study storytelling', 'Expert interviews', 'How-to content'],
    competitorGaps: ['Thought leadership content', 'Data-driven insights', 'Community building strategies'],
  },
};
