import { User, ContentProject, BrandIntelligenceProfile, TopicIdea, BrandVoice, VoiceSample, ActivationState, UTMLink, BrandVoiceDNA, ContentExample, AudienceProfile, ScheduledPost, VisualAsset, TrendItem, Competitor } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  USER: 'cf_user',
  PROJECTS: 'cf_projects',
  BRAND_VOICE: 'cf_brand_voice',
  AUTH_TOKEN: 'cf_auth_token',
  ACTIVATION: 'cf_activation',
  BRAND_PROFILE: 'cf_brand_profile',
  TOPIC_IDEAS: 'cf_topic_ideas',
  UTM_LINKS: 'cf_utm_links',
  // New context engineering keys
  BRAND_VOICE_DNA: 'cf_brand_voice_dna',
  CONTENT_EXAMPLES: 'cf_content_examples',
  AUDIENCE_PROFILES: 'cf_audience_profiles',
  // New feature keys
  SCHEDULED_POSTS: 'cf_scheduled_posts',
  VISUAL_ASSETS: 'cf_visual_assets',
  TREND_ITEMS: 'cf_trend_items',
  COMPETITORS: 'cf_competitors',
  TRENDS_LAST_REFRESH: 'cf_trends_last_refresh',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Auth ────────────────────────────────────────────────────
export function isAuthenticated(): boolean {
  return !!getItem<string | null>(KEYS.AUTH_TOKEN, null);
}

export function login(email: string, password: string): User | null {
  const user = getItem<User | null>(KEYS.USER, null);
  if (user && user.email === email) {
    setItem(KEYS.AUTH_TOKEN, 'authenticated');
    trackLoginDay();
    return user;
  }
  return null;
}

export function signup(email: string, password: string, name: string): User {
  const user: User = {
    id: uuidv4(),
    email,
    name,
    channels: [],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.USER, user);
  setItem(KEYS.AUTH_TOKEN, 'authenticated');
  initActivation();
  return user;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.AUTH_TOKEN);
}

export function getUser(): User | null {
  return getItem<User | null>(KEYS.USER, null);
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  setItem(KEYS.USER, updated);
  return updated;
}

export function saveUser(user: User): void {
  setItem(KEYS.USER, user);
}

// ─── Projects ────────────────────────────────────────────────
export function getProjects(): ContentProject[] {
  return getItem<ContentProject[]>(KEYS.PROJECTS, []);
}

export function getProject(id: string): ContentProject | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: ContentProject): void {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  setItem(KEYS.PROJECTS, projects);
  const activation = getActivation();
  const totalPieces = projects.reduce((sum, p) => sum + p.pieces.length, 0);
  activation.contentGeneratedCount = totalPieces;
  if (totalPieces >= 1) activation.milestones.firstContentGenerated = true;
  if (totalPieces >= 3) activation.milestones.threeContentGenerated = true;
  setItem(KEYS.ACTIVATION, activation);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  setItem(KEYS.PROJECTS, projects);
}

// ─── Brand Intelligence Profile ──────────────────────────────
export function getBrandProfile(): BrandIntelligenceProfile | null {
  return getItem<BrandIntelligenceProfile | null>(KEYS.BRAND_PROFILE, null);
}

export function saveBrandProfile(profile: BrandIntelligenceProfile): void {
  setItem(KEYS.BRAND_PROFILE, profile);
  const activation = getActivation();
  activation.milestones.voiceProfileBuilt = true;
  setItem(KEYS.ACTIVATION, activation);
}

export function updateBrandProfile(updates: Partial<BrandIntelligenceProfile>): BrandIntelligenceProfile | null {
  const profile = getBrandProfile();
  if (!profile) return null;
  const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
  setItem(KEYS.BRAND_PROFILE, updated);
  return updated;
}

// ─── Brand Voice DNA (NEW) ───────────────────────────────────
export function getBrandVoiceDNA(): BrandVoiceDNA | null {
  return getItem<BrandVoiceDNA | null>(KEYS.BRAND_VOICE_DNA, null);
}

export function saveBrandVoiceDNA(dna: BrandVoiceDNA): void {
  setItem(KEYS.BRAND_VOICE_DNA, dna);
}

// ─── Content Examples Library (NEW) ──────────────────────────
export function getContentExamples(): ContentExample[] {
  return getItem<ContentExample[]>(KEYS.CONTENT_EXAMPLES, []);
}

export function addContentExample(example: ContentExample): void {
  const examples = getContentExamples();
  examples.unshift(example);
  setItem(KEYS.CONTENT_EXAMPLES, examples);
}

export function updateContentExample(id: string, updates: Partial<ContentExample>): void {
  const examples = getContentExamples();
  const idx = examples.findIndex(e => e.id === id);
  if (idx >= 0) {
    examples[idx] = { ...examples[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(KEYS.CONTENT_EXAMPLES, examples);
  }
}

export function deleteContentExample(id: string): void {
  const examples = getContentExamples().filter(e => e.id !== id);
  setItem(KEYS.CONTENT_EXAMPLES, examples);
}

// ─── Audience Psychographic Profiles (NEW) ───────────────────
export function getAudienceProfiles(): AudienceProfile[] {
  return getItem<AudienceProfile[]>(KEYS.AUDIENCE_PROFILES, []);
}

export function addAudienceProfile(profile: AudienceProfile): void {
  const profiles = getAudienceProfiles();
  // If this is default, unset others
  if (profile.isDefault) {
    profiles.forEach(p => p.isDefault = false);
  }
  profiles.unshift(profile);
  setItem(KEYS.AUDIENCE_PROFILES, profiles);
}

export function updateAudienceProfile(id: string, updates: Partial<AudienceProfile>): void {
  const profiles = getAudienceProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx >= 0) {
    if (updates.isDefault) {
      profiles.forEach(p => p.isDefault = false);
    }
    profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(KEYS.AUDIENCE_PROFILES, profiles);
  }
}

export function deleteAudienceProfile(id: string): void {
  const profiles = getAudienceProfiles().filter(p => p.id !== id);
  setItem(KEYS.AUDIENCE_PROFILES, profiles);
}

export function getDefaultAudienceProfile(): AudienceProfile | null {
  const profiles = getAudienceProfiles();
  return profiles.find(p => p.isDefault) || profiles[0] || null;
}

// ─── Topic Ideas ─────────────────────────────────────────────
export function getTopicIdeas(): TopicIdea[] {
  return getItem<TopicIdea[]>(KEYS.TOPIC_IDEAS, []);
}

export function saveTopicIdeas(ideas: TopicIdea[]): void {
  setItem(KEYS.TOPIC_IDEAS, ideas);
}

// ─── Brand Voice (legacy) ────────────────────────────────────
export function getBrandVoice(): BrandVoice {
  return getItem<BrandVoice>(KEYS.BRAND_VOICE, {
    samples: [],
    characteristics: { tone: [], vocabulary: [], sentenceStructure: [], frameworks: [] },
    summary: '',
    voiceConfidence: 0,
  });
}

export function addVoiceSample(content: string, source: string): VoiceSample {
  const voice = getBrandVoice();
  const sample: VoiceSample = { id: uuidv4(), content, source, addedAt: new Date().toISOString() };
  voice.samples.push(sample);
  setItem(KEYS.BRAND_VOICE, voice);
  return sample;
}

export function updateBrandVoice(updates: Partial<BrandVoice>): BrandVoice {
  const voice = getBrandVoice();
  const updated = { ...voice, ...updates };
  setItem(KEYS.BRAND_VOICE, updated);
  const activation = getActivation();
  if (updated.summary || (updated.characteristics?.tone?.length ?? 0) > 0) {
    activation.milestones.voiceProfileBuilt = true;
    setItem(KEYS.ACTIVATION, activation);
  }
  return updated;
}

export function getVoiceSamples(): VoiceSample[] {
  return getBrandVoice().samples || [];
}

export function removeVoiceSample(id: string): void {
  const voice = getBrandVoice();
  voice.samples = voice.samples.filter(s => s.id !== id);
  setItem(KEYS.BRAND_VOICE, voice);
}

// ─── Activation ──────────────────────────────────────────────
export function initActivation(): void {
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const activation: ActivationState = {
    milestones: {
      onboardingComplete: false, voiceProfileBuilt: false,
      firstContentGenerated: false, threeContentGenerated: false,
      contentCopied: false, contentDownloaded: false,
      returnedDay2: false, voiceRetrained: false,
    },
    firstLoginDate: now, lastLoginDate: now, loginDays: [today],
    contentGeneratedCount: 0, copyCount: 0, downloadCount: 0,
    dismissedTips: [], seenFeatures: [], currentStreak: 1,
  };
  setItem(KEYS.ACTIVATION, activation);
}

export function getActivation(): ActivationState {
  return getItem<ActivationState>(KEYS.ACTIVATION, {
    milestones: {
      onboardingComplete: false, voiceProfileBuilt: false,
      firstContentGenerated: false, threeContentGenerated: false,
      contentCopied: false, contentDownloaded: false,
      returnedDay2: false, voiceRetrained: false,
    },
    firstLoginDate: new Date().toISOString(), lastLoginDate: new Date().toISOString(),
    loginDays: [], contentGeneratedCount: 0, copyCount: 0, downloadCount: 0,
    dismissedTips: [], seenFeatures: [], currentStreak: 0,
  });
}

export function updateActivation(updates: Partial<ActivationState>): ActivationState {
  const activation = getActivation();
  const updated = { ...activation, ...updates, milestones: { ...activation.milestones, ...(updates.milestones || {}) } };
  setItem(KEYS.ACTIVATION, updated);
  return updated;
}

export function trackLoginDay(): void {
  const activation = getActivation();
  const today = new Date().toISOString().split('T')[0];
  if (!activation.loginDays.includes(today)) activation.loginDays.push(today);
  activation.lastLoginDate = new Date().toISOString();
  if (activation.loginDays.length >= 2) activation.milestones.returnedDay2 = true;
  const sortedDays = [...activation.loginDays].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) streak++; else break;
  }
  activation.currentStreak = streak;
  setItem(KEYS.ACTIVATION, activation);
}

export function trackCopy(): void {
  const a = getActivation();
  a.copyCount++;
  a.milestones.contentCopied = true;
  setItem(KEYS.ACTIVATION, a);
}

export function trackDownload(): void {
  const a = getActivation();
  a.downloadCount++;
  a.milestones.contentDownloaded = true;
  setItem(KEYS.ACTIVATION, a);
}

export function dismissTip(tipId: string): void {
  const a = getActivation();
  if (!a.dismissedTips.includes(tipId)) a.dismissedTips.push(tipId);
  setItem(KEYS.ACTIVATION, a);
}

export function markFeatureSeen(featureId: string): void {
  const a = getActivation();
  if (!a.seenFeatures.includes(featureId)) a.seenFeatures.push(featureId);
  setItem(KEYS.ACTIVATION, a);
}

export function getActivationScore(): number {
  const a = getActivation();
  let score = 0;
  if (a.milestones.onboardingComplete) score += 15;
  if (a.milestones.voiceProfileBuilt) score += 15;
  if (a.milestones.firstContentGenerated) score += 20;
  if (a.milestones.threeContentGenerated) score += 15;
  if (a.milestones.contentCopied) score += 10;
  if (a.milestones.contentDownloaded) score += 10;
  if (a.milestones.returnedDay2) score += 10;
  if (a.milestones.voiceRetrained) score += 5;
  return score;
}

export function getCompletedMilestones(): number {
  return Object.values(getActivation().milestones).filter(Boolean).length;
}

export function getTotalMilestones(): number {
  return 8;
}

// ─── UTM Links ───────────────────────────────────────────────
export function getUTMLinks(): UTMLink[] {
  return getItem<UTMLink[]>(KEYS.UTM_LINKS, []);
}

export function saveUTMLink(link: UTMLink): void {
  const links = getUTMLinks();
  links.unshift(link);
  setItem(KEYS.UTM_LINKS, links);
}

export function saveUTMLinks(links: UTMLink[]): void {
  const existing = getUTMLinks();
  setItem(KEYS.UTM_LINKS, [...links, ...existing]);
}

export function deleteUTMLink(id: string): void {
  const links = getUTMLinks().filter(l => l.id !== id);
  setItem(KEYS.UTM_LINKS, links);
}

// ─── Scheduled Posts (Calendar) ──────────────────────────────
export function getScheduledPosts(): ScheduledPost[] {
  return getItem<ScheduledPost[]>(KEYS.SCHEDULED_POSTS, []);
}

export function saveScheduledPost(post: ScheduledPost): void {
  const posts = getScheduledPosts();
  const idx = posts.findIndex(p => p.id === post.id);
  if (idx >= 0) {
    posts[idx] = post;
  } else {
    posts.unshift(post);
  }
  setItem(KEYS.SCHEDULED_POSTS, posts);
}

export function deleteScheduledPost(id: string): void {
  const posts = getScheduledPosts().filter(p => p.id !== id);
  setItem(KEYS.SCHEDULED_POSTS, posts);
}

export function updateScheduledPost(id: string, updates: Partial<ScheduledPost>): void {
  const posts = getScheduledPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(KEYS.SCHEDULED_POSTS, posts);
  }
}

// ─── Visual Assets ──────────────────────────────────────────
export function getVisualAssets(): VisualAsset[] {
  return getItem<VisualAsset[]>(KEYS.VISUAL_ASSETS, []);
}

export function saveVisualAsset(asset: VisualAsset): void {
  const assets = getVisualAssets();
  assets.unshift(asset);
  setItem(KEYS.VISUAL_ASSETS, assets);
}

export function deleteVisualAsset(id: string): void {
  const assets = getVisualAssets().filter(a => a.id !== id);
  setItem(KEYS.VISUAL_ASSETS, assets);
}

export function getVisualAssetsForProject(projectId: string): VisualAsset[] {
  return getVisualAssets().filter(a => a.projectId === projectId);
}

// ─── Trends ─────────────────────────────────────────────────
export function getTrendItems(): TrendItem[] {
  return getItem<TrendItem[]>(KEYS.TREND_ITEMS, []);
}

export function saveTrendItems(items: TrendItem[]): void {
  setItem(KEYS.TREND_ITEMS, items);
}

export function getTrendsLastRefresh(): string | null {
  return getItem<string | null>(KEYS.TRENDS_LAST_REFRESH, null);
}

export function setTrendsLastRefresh(date: string): void {
  setItem(KEYS.TRENDS_LAST_REFRESH, date);
}

// ─── Competitors ────────────────────────────────────────────
export function getCompetitors(): Competitor[] {
  return getItem<Competitor[]>(KEYS.COMPETITORS, []);
}

export function addCompetitor(competitor: Competitor): void {
  const competitors = getCompetitors();
  competitors.push(competitor);
  setItem(KEYS.COMPETITORS, competitors);
}

export function removeCompetitor(id: string): void {
  const competitors = getCompetitors().filter(c => c.id !== id);
  setItem(KEYS.COMPETITORS, competitors);
}

// ─── Stats ───────────────────────────────────────────────────
export function getStats() {
  const projects = getProjects();
  const allPieces = projects.flatMap(p => p.pieces);
  const totalContent = allPieces.length;
  const avgScore = totalContent > 0
    ? allPieces.reduce((sum, p) => sum + p.qualityScore, 0) / totalContent
    : 0;
  const platformDist: Record<string, number> = {};
  allPieces.forEach(p => {
    platformDist[p.platform] = (platformDist[p.platform] || 0) + 1;
  });
  return {
    contentGenerated: totalContent,
    projectCount: projects.length,
    avgQualityScore: Math.round(avgScore * 10) / 10,
    platformDistribution: platformDist,
    recentProjects: projects.slice(0, 5),
  };
}
