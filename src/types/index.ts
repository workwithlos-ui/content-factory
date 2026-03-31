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

// Raw answers from onboarding questions
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

// COMMAND 1 output: The full Brand Intelligence Profile
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

// COMMAND 6 output: Voice DNA Profile
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

// COMMAND 2 output: Strategic Brief
export interface StrategicBrief {
  strategicAngle: string;
  emotionalHook: string;
  proofPoints: string[];
  platformFrameworks: Record<Platform, ContentFramework>;
  platformPriority: Platform[];
}

// COMMAND 5 output: Topic Ideas
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

// Platform-to-content-type mapping for UTM
export const PLATFORM_CONTENT_TYPES: Record<Platform, string> = {
  twitter: 'thread',
  linkedin: 'post',
  instagram: 'caption',
  email: 'newsletter',
  blog: 'article',
  youtube: 'description',
  'video-script': 'script',
};

// Model selection: which model is best for which platform
export const PLATFORM_MODEL_MAP: Record<Platform, AIModel> = {
  twitter: 'gpt-4.1-mini',
  linkedin: 'gemini-2.5-flash',
  instagram: 'gpt-4.1-mini',
  email: 'gemini-2.5-flash',
  blog: 'gemini-2.5-flash',
  youtube: 'gpt-4.1-mini',
  'video-script': 'gpt-4.1-mini',
};

export const MODEL_LABELS: Record<AIModel, { name: string; badge: string; color: string }> = {
  'gpt-4.1-mini': { name: 'GPT-4.1 Mini', badge: 'GPT', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', badge: 'Gemini', color: 'bg-violet-50 text-violet-700 border-violet-200' },
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

export interface ContentPiece {
  id: string;
  projectId: string;
  platform: Platform;
  content: string;
  qualityScore: number;
  qualityBreakdown?: QualityBreakdown;
  framework?: ContentFramework;
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
  sourceType: 'topic' | 'url' | 'notes' | 'audio';
  sourceContent: string;
  pieces: ContentPiece[];
  strategicBrief?: StrategicBrief;
  status: 'generating' | 'complete' | 'error';
  createdAt: string;
  updatedAt: string;
}

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'email'
  | 'blog'
  | 'youtube'
  | 'video-script';

export const PLATFORMS: { key: Platform; label: string; icon: string; color: string }[] = [
  { key: 'twitter', label: 'Twitter/X Thread', icon: 'Twitter', color: '#1DA1F2' },
  { key: 'linkedin', label: 'LinkedIn Post', icon: 'Linkedin', color: '#0A66C2' },
  { key: 'instagram', label: 'Instagram Caption', icon: 'Instagram', color: '#E4405F' },
  { key: 'email', label: 'Email Newsletter', icon: 'Mail', color: '#6366f1' },
  { key: 'blog', label: 'SEO Blog Post', icon: 'FileText', color: '#059669' },
  { key: 'youtube', label: 'YouTube Package', icon: 'Youtube', color: '#FF0000' },
  { key: 'video-script', label: 'Video Scripts', icon: 'Video', color: '#8B5CF6' },
];

export interface DashboardStats {
  contentGenerated: number;
  pipelineInfluenced: number;
  avgQualityScore: number;
  platformDistribution: Record<Platform, number>;
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
  'Professional Services': {
    avgContentPerMonth: 20, avgQualityScore: 8.3, avgPipelinePerMonth: 38000, avgLeadsPerMonth: 6,
    topTopics: ['Expertise showcases', 'Regulatory updates', 'Best practice guides', 'Industry benchmarking', 'Client success stories'],
    competitorGaps: ['Thought leadership on emerging regulations', 'Cross-industry insights', 'Process automation content'],
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
  'Financial Services': {
    avgContentPerMonth: 18, avgQualityScore: 8.8, avgPipelinePerMonth: 85000, avgLeadsPerMonth: 5,
    topTopics: ['Market analysis', 'Regulatory compliance guides', 'Investment strategy insights', 'Risk management frameworks', 'Fintech disruption analysis'],
    competitorGaps: ['Accessible financial education', 'ESG investing content', 'Digital transformation in finance'],
  },
  'Healthcare': {
    avgContentPerMonth: 16, avgQualityScore: 8.5, avgPipelinePerMonth: 52000, avgLeadsPerMonth: 4,
    topTopics: ['Clinical innovation updates', 'Patient experience insights', 'Healthcare technology reviews', 'Regulatory compliance guides', 'Operational efficiency strategies'],
    competitorGaps: ['Value-based care content', 'Telehealth best practices', 'Healthcare AI applications'],
  },
  'Real Estate': {
    avgContentPerMonth: 22, avgQualityScore: 8.1, avgPipelinePerMonth: 72000, avgLeadsPerMonth: 10,
    topTopics: ['Market trend analysis', 'Investment strategy guides', 'Property management insights', 'Development project showcases', 'Regulatory update content'],
    competitorGaps: ['PropTech innovation content', 'Sustainability in real estate', 'Remote work impact analysis'],
  },
  'Manufacturing': {
    avgContentPerMonth: 14, avgQualityScore: 8.3, avgPipelinePerMonth: 43000, avgLeadsPerMonth: 4,
    topTopics: ['Industry 4.0 insights', 'Supply chain optimization', 'Quality management frameworks', 'Automation case studies', 'Sustainability initiatives'],
    competitorGaps: ['Workforce development content', 'Digital twin applications', 'Reshoring strategy content'],
  },
  'Technology': {
    avgContentPerMonth: 26, avgQualityScore: 8.5, avgPipelinePerMonth: 58000, avgLeadsPerMonth: 14,
    topTopics: ['Technical deep-dives', 'Architecture decision guides', 'Emerging technology analysis', 'Developer experience content', 'Security best practices'],
    competitorGaps: ['Non-technical buyer content', 'Total cost of ownership analysis', 'Migration strategy guides'],
  },
  'Other': {
    avgContentPerMonth: 20, avgQualityScore: 8.3, avgPipelinePerMonth: 40000, avgLeadsPerMonth: 8,
    topTopics: ['Industry trend analysis', 'Best practice guides', 'Case study storytelling', 'Expert interviews', 'How-to content'],
    competitorGaps: ['Thought leadership content', 'Data-driven insights', 'Community building strategies'],
  },
};
