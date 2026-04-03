'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { updateBrandVoice, updateActivation, getActivation, saveBrandProfile } from '@/lib/storage';
import { InterviewMessage, BusinessProfile, BrandIntelligenceProfile } from '@/types';
import {
  Zap, ArrowRight, ArrowLeft, Building2, Mic2, Share2, Check,
  Mail, FileText, Video, Hash, AtSign, Camera, Play,
  MessageSquare, PenTool, Globe, Loader2, Sparkles,
  ChevronRight, User, Bot, Send, CheckCircle2, Star, ClipboardList,
  Target, ShieldQuestion, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { title: 'Your Business', description: 'Tell us about your company', icon: Building2 },
  { title: 'Your Voice & Strategy', description: 'Help us understand your business deeply', icon: Mic2 },
  { title: 'Your Channels', description: 'Where do you publish?', icon: Share2 },
  { title: 'See the Magic', description: 'Your first AI-generated content', icon: Sparkles },
];

const CHANNELS = [
  { key: 'twitter', label: 'Twitter / X', icon: Hash, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { key: 'linkedin', label: 'LinkedIn', icon: AtSign, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'instagram', label: 'Instagram', icon: Camera, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { key: 'email', label: 'Email Newsletter', icon: Mail, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { key: 'blog', label: 'Blog / SEO', icon: FileText, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { key: 'youtube', label: 'YouTube', icon: Play, color: 'bg-red-50 text-red-600 border-red-200' },
  { key: 'video', label: 'Short-Form Video', icon: Video, color: 'bg-purple-50 text-purple-600 border-purple-200' },
];

const INDUSTRIES = [
  'B2B SaaS', 'Consulting', 'Professional Services', 'Agency', 'E-Commerce',
  'Financial Services', 'Healthcare', 'Real Estate', 'Manufacturing', 'Technology', 'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);

  // Step 0: Business basics
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Step 1: Voice path selection
  const [voicePath, setVoicePath] = useState<'questions' | 'paste' | 'interview' | null>(null);

  // Questions path (PRIMARY)
  const [qWhatYouSell, setQWhatYouSell] = useState('');
  const [qWhyNo, setQWhyNo] = useState('');
  const [qCompetitorWrong, setQCompetitorWrong] = useState('');
  const [qBestCustomer, setQBestCustomer] = useState('');
  const [qBarExplanation, setQBarExplanation] = useState('');
  const [qStrongOpinion, setQStrongOpinion] = useState('');

  // Paste path
  const [samples, setSamples] = useState<string[]>(['', '', '']);

  // Interview path
  const [interviewMessages, setInterviewMessages] = useState<InterviewMessage[]>([]);
  const [interviewInput, setInterviewInput] = useState('');
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionKey, setCurrentQuestionKey] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // URL analysis
  const [urlAnalyzing, setUrlAnalyzing] = useState(false);
  const [urlAnalyzed, setUrlAnalyzed] = useState(false);

  // Profile building
  const [buildingProfile, setBuildingProfile] = useState(false);
  const [voiceBuilt, setVoiceBuilt] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<any>(null);
  const [businessProfileData, setBusinessProfileData] = useState<BusinessProfile | null>(null);
  const [brandIntelligence, setBrandIntelligence] = useState<BrandIntelligenceProfile | null>(null);

  // Step 2: Channels
  const [channels, setChannels] = useState<string[]>([]);

  // Step 3: First content
  const [generatingFirst, setGeneratingFirst] = useState(false);
  const [firstContent, setFirstContent] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setCompany(user.company || '');
      setIndustry(user.industry || '');
      setTargetAudience(user.targetAudience || '');
      setWebsiteUrl(user.websiteUrl || '');
      setChannels(user.channels || []);
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewMessages]);

  const toggleChannel = (key: string) => {
    setChannels(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  };

  // ─── URL Analysis ───────────────────────────────────────────────
  const analyzeUrl = async () => {
    if (!websiteUrl) return;
    setUrlAnalyzing(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze-url', data: { url: websiteUrl, company, industry } }),
      });
      await res.json();
      setUrlAnalyzed(true);
    } catch { /* ignore */ }
    setUrlAnalyzing(false);
  };

  // ─── Start AI Interview ─────────────────────────────────────────
  const startInterview = async () => {
    setInterviewLoading(true);
    const openingMsg: InterviewMessage = { role: 'ai', content: '' };
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'ai', content: 'Starting interview...' }],
          company,
          industry,
        }),
      });
      const data = await res.json();
      openingMsg.content = data.message || "Let's start simple. What do you sell, and roughly how much does it cost?";
    } catch {
      openingMsg.content = "Let's start simple. What do you sell, and roughly how much does it cost? Don't overthink it. Just tell me like you'd tell a friend.";
    }
    setInterviewMessages([openingMsg]);
    setCurrentQuestionIndex(0);
    setInterviewLoading(false);
  };

  // ─── Send Interview Message ─────────────────────────────────────
  const sendInterviewMessage = async () => {
    if (!interviewInput.trim() || interviewLoading) return;
    const userMsg: InterviewMessage = { role: 'user', content: interviewInput.trim() };
    const newMessages = [...interviewMessages, userMsg];
    setInterviewMessages(newMessages);
    setInterviewInput('');
    setInterviewLoading(true);
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, company, industry }),
      });
      const data = await res.json();

      if (data.isComplete && data.profile) {
        // Interview complete, profile extracted
        setInterviewComplete(true);
        setInterviewMessages(prev => [...prev, { role: 'ai', content: data.message }]);
        // Save the extracted profile directly
        const profile: BrandIntelligenceProfile = {
          ...data.profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBrandIntelligence(profile);
        saveBrandProfile(profile);
        setVoiceProfile({
          summary: data.profile.voiceDNA?.summary || 'Profile built from interview.',
          tone: data.profile.voiceDNA?.openingPatterns || ['Direct'],
          vocabulary: [data.profile.voiceDNA?.vocabularyLevel || 'Conversational'],
          sentenceStructure: [data.profile.voiceDNA?.sentenceStructure || 'Varied'],
          voiceConfidence: 90,
          personalityInsight: data.profile.voiceDNA?.energySignature || '',
        });
        setBusinessProfileData({
          whatYouSell: data.profile.positioningStatement || '',
          whyPeopleSayNo: data.profile.objectionMap?.[0]?.objection || '',
          competitorWeakness: data.profile.competitiveWedge || '',
          bestCustomerStory: data.profile.transformationArc?.before || '',
          barExplanation: data.profile.positioningStatement || '',
          strongOpinion: data.profile.contentAngles?.[0] || '',
        });
        updateBrandVoice({
          samples: [],
          characteristics: {
            tone: data.profile.voiceDNA?.openingPatterns || ['Direct'],
            vocabulary: [data.profile.voiceDNA?.vocabularyLevel || 'Conversational'],
            sentenceStructure: [data.profile.voiceDNA?.sentenceStructure || 'Varied'],
            frameworks: ['PAS', 'Story-Lesson-Action'],
          },
          summary: data.profile.voiceDNA?.summary || '',
          voiceConfidence: 90,
          buildMethod: 'interview',
          updatedAt: new Date().toISOString(),
        });
        setVoiceBuilt(true);
      } else {
        // Continue conversation
        setInterviewMessages(prev => [...prev, { role: 'ai', content: data.message }]);
      }
    } catch {
      const fallbackQs: Record<number, string> = {
        1: "What's the #1 reason people say no to buying from you? The real reason, not the polite one.",
        2: "What's something your competitors get wrong? What makes you shake your head?",
        3: "Tell me about your best customer. What was their problem before they found you?",
        4: "Imagine you're at a bar explaining to a friend why your business matters. What would you say?",
        5: "Last one. What's a strong opinion you hold about your industry that most people disagree with?",
      };
      const fb = fallbackQs[nextIndex];
      if (fb) {
        setInterviewMessages(prev => [...prev, { role: 'ai', content: fb }]);
      } else {
        setInterviewComplete(true);
        setInterviewMessages(prev => [...prev, { role: 'ai', content: "Perfect. I have everything I need. Let me build your profile now." }]);
      }
    }
    setInterviewLoading(false);
  };

  // ─── Build Voice Profile ────────────────────────────────────────
  const buildVoiceProfile = async () => {
    setBuildingProfile(true);
    try {
      let answers: Record<string, string> = {};

      if (voicePath === 'questions') {
        answers = {
          whatYouSell: qWhatYouSell,
          whyPeopleSayNo: qWhyNo,
          competitorWeakness: qCompetitorWrong,
          bestCustomerStory: qBestCustomer,
          barExplanation: qBarExplanation,
          strongOpinion: qStrongOpinion,
        };
      } else if (voicePath === 'interview') {
        answers = interviewAnswers;
      } else if (voicePath === 'paste') {
        const sampleText = samples.filter(s => s.trim()).join('\n\n---\n\n');
        answers = {
          whatYouSell: `${company} in ${industry}`,
          barExplanation: `Based on writing samples: ${sampleText.slice(0, 1000)}`,
          contentSamples: sampleText,
        };
      }

      // COMMAND 1: Brand Intelligence Extractor
      let data: any = {};
      try {
        const res = await fetch('/api/extract-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: { ...answers, contentSamples: samples.filter(s => s.trim()) },
            company,
            industry,
            targetAudience,
          }),
        });
        if (res.ok) {
          data = await res.json();
        } else {
          console.error('Profile extraction API failed:', res.status);
        }
      } catch (fetchErr) {
        console.error('Profile extraction fetch failed:', fetchErr);
      }

      if (data.profile) {
        const profile: BrandIntelligenceProfile = {
          ...data.profile,
          rawAnswers: answers as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBrandIntelligence(profile);
        saveBrandProfile(profile);

        // Set legacy voice profile for display
        const vp = {
          summary: data.profile.voiceDNA?.summary || 'Professional voice profile built.',
          tone: data.profile.voiceDNA?.openingPatterns || ['Direct', 'Authentic'],
          vocabulary: [data.profile.voiceDNA?.vocabularyLevel || 'Conversational'],
          sentenceStructure: [data.profile.voiceDNA?.sentenceStructure || 'Varied'],
          voiceConfidence: 85,
          personalityInsight: data.profile.voiceDNA?.energySignature || '',
        };
        setVoiceProfile(vp);

        const bp: BusinessProfile = {
          whatYouSell: answers.whatYouSell,
          whyPeopleSayNo: answers.whyPeopleSayNo,
          competitorWeakness: answers.competitorWeakness,
          bestCustomerStory: answers.bestCustomerStory,
          barExplanation: answers.barExplanation,
          strongOpinion: answers.strongOpinion,
        };
        setBusinessProfileData(bp);

        updateBrandVoice({
          samples: samples.filter(s => s.trim()).map((s, i) => ({
            id: `sample-${i}`,
            content: s,
            source: `Onboarding sample ${i + 1}`,
            addedAt: new Date().toISOString(),
          })),
          characteristics: {
            tone: vp.tone || ['Professional', 'Direct'],
            vocabulary: vp.vocabulary || ['Clear', 'Specific'],
            sentenceStructure: vp.sentenceStructure || ['Active voice', 'Short paragraphs'],
            frameworks: ['PAS', 'Story-Lesson-Action'],
          },
          summary: vp.summary || '',
          voiceConfidence: vp.voiceConfidence || 75,
          buildMethod: voicePath || 'questions',
          businessProfile: bp,
          updatedAt: new Date().toISOString(),
        });
        setVoiceBuilt(true);
      }
    } catch (err) {
      console.error('Profile build error:', err);
      setVoiceProfile({
        summary: `Professional ${industry || 'B2B'} voice with authority and clarity.`,
        tone: ['Direct', 'Authentic', 'Practical'],
        voiceConfidence: 60,
        personalityInsight: 'Your voice combines expertise with approachability.',
      });
      setVoiceBuilt(true);
    }
    setBuildingProfile(false);
  };

  // ─── Generate First Content ─────────────────────────────────────
  const generateFirstContent = async () => {
    setGeneratingFirst(true);
    try {
      const res = await fetch('/api/first-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company, industry, targetAudience,
          voiceSummary: voiceProfile?.summary || '',
          voiceCharacteristics: {
            tone: voiceProfile?.tone || [],
            vocabulary: voiceProfile?.vocabulary || [],
            sentenceStructure: voiceProfile?.sentenceStructure || [],
          },
          businessProfile: businessProfileData || {},
        }),
      });
      const data = await res.json();
      setFirstContent(data);
    } catch { setFirstContent(null); }
    setGeneratingFirst(false);
  };

  // ─── Finish Onboarding ──────────────────────────────────────────
  const finishOnboarding = () => {
    updateUser({
      company, industry, targetAudience, websiteUrl, channels,
      onboardingComplete: true,
      onboardingPath: voicePath || 'questions',
    });
    const activation = getActivation();
    activation.milestones.onboardingComplete = true;
    if (voiceBuilt) activation.milestones.voiceProfileBuilt = true;
    if (firstContent) activation.milestones.firstContentGenerated = true;
    updateActivation(activation);
    router.push('/dashboard');
  };

  // ─── Step 0: Business Basics ────────────────────────────────────
  const renderStep0 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Consulting" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Industry *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => setIndustry(ind)} className={cn('px-4 py-2.5 rounded-xl border text-sm font-medium transition-all', industry === ind ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>{ind}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Who&apos;s your ideal customer?</label>
            <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., CEOs of $3M-$50M B2B companies" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
            <div className="flex gap-2">
              <input type="url" value={websiteUrl} onChange={e => { setWebsiteUrl(e.target.value); setUrlAnalyzed(false); }} placeholder="https://yourcompany.com" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400" />
              {websiteUrl && (
                <button onClick={analyzeUrl} disabled={urlAnalyzing || urlAnalyzed} className={cn('px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap', urlAnalyzed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100')}>
                  {urlAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : urlAnalyzed ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {urlAnalyzing ? 'Analyzing...' : urlAnalyzed ? 'Analyzed' : 'Analyze'}
                </button>
              )}
            </div>
            {urlAnalyzed && <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Website analyzed — we&apos;ll use this to enhance your profile</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 1: Voice Path Selection ───────────────────────────────
  const renderVoicePathSelection = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">How should we learn about your business?</h3>
        <p className="text-gray-500 text-sm">This information powers every piece of content we generate. The more you share, the better your content will be.</p>
      </div>
      <div className="grid gap-4">
        {/* Quick Questions - PRIMARY */}
        <button onClick={() => setVoicePath('questions')} className="group relative bg-white rounded-2xl border-2 border-blue-200 p-6 text-left hover:border-blue-400 hover:shadow-lg transition-all">
          <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Answer 6 Questions</h4>
              <p className="text-gray-500 text-sm mb-3">Simple questions anyone can answer — about your business, customers, and opinions. No marketing expertise needed. We extract your positioning, pain points, competitive angle, and voice from your answers.</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-400" /> Best for most users</span>
                <span>~3 minutes</span>
                <span>No content needed</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors mt-2" />
          </div>
        </button>

        {/* AI Interview - PREMIUM */}
        <button onClick={() => { setVoicePath('interview'); startInterview(); }} className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-gray-300 hover:shadow-md transition-all relative">
          <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> PREMIUM</div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">AI Voice Interview</h4>
              <p className="text-gray-500 text-sm mb-3">A conversational interview where our AI asks smart follow-up questions, picks up on your personality, and builds the deepest possible understanding of your voice and business.</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Highest accuracy</span>
                <span>~5 minutes</span>
                <span>No content needed</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors mt-2" />
          </div>
        </button>

        {/* Paste Content */}
        <button onClick={() => setVoicePath('paste')} className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-gray-300 hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">Paste Your Content</h4>
              <p className="text-gray-500 text-sm mb-3">Already have content you&apos;re proud of? Paste 1-5 of your best posts, emails, or articles and we&apos;ll reverse-engineer your voice.</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Best for existing creators</span>
                <span>~2 minutes</span>
                <span>Requires content samples</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors mt-2" />
          </div>
        </button>
      </div>
    </div>
  );

  // ─── Questions Path (PRIMARY) ───────────────────────────────────
  const renderQuestionsPath = () => {
    const questions = [
      { key: 'sell', value: qWhatYouSell, setter: setQWhatYouSell, label: 'What do you sell and how much does it cost?', placeholder: 'e.g., We sell fractional CFO services to SaaS companies for $5K-$15K/month', icon: Lightbulb, hint: 'Don\'t overthink it. Just tell us like you\'d tell a friend.' },
      { key: 'no', value: qWhyNo, setter: setQWhyNo, label: 'What\'s the #1 reason people say no to buying from you?', placeholder: 'e.g., They think they can just hire a part-time bookkeeper instead', icon: ShieldQuestion, hint: 'The real reason, not the polite one.' },
      { key: 'comp', value: qCompetitorWrong, setter: setQCompetitorWrong, label: 'What\'s something your competitors get wrong?', placeholder: 'e.g., Most fractional CFOs just do reporting. They never touch strategy or fundraising.', icon: Target, hint: 'What makes you shake your head about your industry?' },
      { key: 'cust', value: qBestCustomer, setter: setQBestCustomer, label: 'Tell me about your best customer. What was their problem before they found you?', placeholder: 'e.g., They were a $4M SaaS company burning cash with no visibility into unit economics. After 6 months with us, they raised a Series A.', icon: User, hint: 'This becomes your case study content.' },
      { key: 'bar', value: qBarExplanation, setter: setQBarExplanation, label: 'What would you say to a friend at a bar about why your business matters?', placeholder: 'e.g., Most growing companies are flying blind financially. They\'re making million-dollar decisions with spreadsheets from 2019. We fix that.', icon: MessageSquare, hint: 'This is how we capture your authentic voice.' },
      { key: 'opinion', value: qStrongOpinion, setter: setQStrongOpinion, label: 'What\'s a strong opinion you hold about your industry that most people disagree with?', placeholder: 'e.g., I think most companies hire a full-time CFO way too early. You don\'t need one until $20M+ ARR.', icon: Zap, hint: 'Strong opinions = great content. This becomes your contrarian angle.' },
    ];

    const answeredCount = questions.filter(q => q.value.trim().length > 10).length;

    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => { setVoicePath(null); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Choose different method</button>
          <span className="text-xs text-gray-400">{answeredCount} of {questions.length} answered</span>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-700"><strong>Why these questions?</strong> Every answer becomes fuel for your content. Your objection handling becomes LinkedIn posts. Your customer story becomes case studies. Your contrarian take becomes Twitter threads. Answer honestly — the AI uses these in every piece of content it generates.</p>
        </div>

        <div className="space-y-5">
          {questions.map((q, i) => {
            const Icon = q.icon;
            return (
              <div key={q.key} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">{i + 1}. {q.label}</label>
                    <p className="text-xs text-gray-400 mb-3">{q.hint}</p>
                    <textarea value={q.value} onChange={e => q.setter(e.target.value)} placeholder={q.placeholder} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={buildVoiceProfile} disabled={buildingProfile || answeredCount < 3} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
          {buildingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Building Your Profile...</> : voiceBuilt ? <><CheckCircle2 className="w-4 h-4" /> Profile Built</> : <><Sparkles className="w-4 h-4" /> Build My Voice &amp; Strategy Profile</>}
        </button>

        {voiceBuilt && voiceProfile && renderProfileCard('blue')}
      </div>
    );
  };

  // ─── Interview Path ─────────────────────────────────────────────
  const renderInterviewPath = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => { setVoicePath(null); setInterviewMessages([]); setInterviewComplete(false); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Choose different method</button>
        {!interviewComplete && currentQuestionIndex > 0 && <span className="text-xs text-gray-400">Question {currentQuestionIndex + 1} of 6</span>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div>
              <h4 className="text-white font-semibold text-sm">Voice Discovery Session</h4>
              <p className="text-amber-100 text-xs">Like a $10K brand strategy session, in 5 minutes</p>
            </div>
          </div>
        </div>

        <div className="h-[380px] overflow-y-auto p-6 space-y-4">
          {interviewMessages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1"><Bot className="w-4 h-4 text-amber-600" /></div>}
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed', msg.role === 'user' ? 'bg-amber-500 text-white rounded-br-md' : 'bg-gray-50 text-gray-700 rounded-bl-md')}>{msg.content}</div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1"><User className="w-4 h-4 text-gray-600" /></div>}
            </div>
          ))}
          {interviewLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-amber-600" /></div>
              <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {!interviewComplete ? (
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <input type="text" value={interviewInput} onChange={e => setInterviewInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendInterviewMessage()} placeholder="Type your answer..." className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm text-gray-900 placeholder:text-gray-400" disabled={interviewLoading} />
              <button onClick={sendInterviewMessage} disabled={!interviewInput.trim() || interviewLoading} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 p-4">
            <button onClick={buildVoiceProfile} disabled={buildingProfile} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {buildingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Building Your Profile...</> : voiceBuilt ? <><CheckCircle2 className="w-4 h-4" /> Profile Built</> : <><Sparkles className="w-4 h-4" /> Build My Voice &amp; Strategy Profile</>}
            </button>
          </div>
        )}
      </div>

      {voiceBuilt && voiceProfile && renderProfileCard('amber')}
    </div>
  );

  // ─── Paste Path ─────────────────────────────────────────────────
  const renderPastePath = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => setVoicePath(null)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Choose different method</button>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <p className="text-sm text-gray-500">Paste 1-5 of your best posts, emails, or articles. We&apos;ll analyze your writing patterns, tone, and style.</p>
        {samples.map((s, i) => (
          <div key={i}>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sample {i + 1} {i === 0 ? '*' : '(optional)'}</label>
            <textarea value={s} onChange={e => { const n = [...samples]; n[i] = e.target.value; setSamples(n); }} placeholder={i === 0 ? 'Paste your best-performing post or article...' : 'Paste another piece of content...'} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none" />
          </div>
        ))}
        {samples.length < 5 && <button onClick={() => setSamples([...samples, ''])} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add another sample</button>}
        <button onClick={buildVoiceProfile} disabled={buildingProfile || !samples[0]?.trim()} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {buildingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : voiceBuilt ? <><CheckCircle2 className="w-4 h-4" /> Profile Built</> : <><Sparkles className="w-4 h-4" /> Analyze &amp; Build Profile</>}
        </button>
      </div>
      {voiceBuilt && voiceProfile && renderProfileCard('emerald')}
    </div>
  );

  // ─── Profile Card (shared) ──────────────────────────────────────
  const renderProfileCard = (color: string) => (
    <div className={cn('rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500', color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' : color === 'amber' ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100')}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <h4 className="font-bold text-gray-900">Your Profile</h4>
        <span className={cn('ml-auto text-sm font-medium', color === 'blue' ? 'text-blue-600' : color === 'amber' ? 'text-amber-600' : 'text-emerald-600')}>{voiceProfile.voiceConfidence || 75}% confidence</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{voiceProfile.summary}</p>

      {(brandIntelligence?.positioningStatement || businessProfileData?.whatYouSell) && (
        <div className="bg-white/60 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">YOUR POSITIONING</p>
          <p className="text-sm text-gray-700">{brandIntelligence?.positioningStatement || businessProfileData?.whatYouSell}</p>
        </div>
      )}

      {brandIntelligence?.competitiveWedge && (
        <div className="bg-white/60 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">COMPETITIVE WEDGE</p>
          <p className="text-sm text-gray-700">{brandIntelligence.competitiveWedge}</p>
        </div>
      )}

      {brandIntelligence?.transformationArc && (
        <div className="bg-white/60 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">TRANSFORMATION ARC</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div><p className="text-xs text-red-500 font-medium">BEFORE</p><p className="text-xs text-gray-600">{brandIntelligence.transformationArc.before}</p></div>
            <div><p className="text-xs text-emerald-500 font-medium">AFTER</p><p className="text-xs text-gray-600">{brandIntelligence.transformationArc.after}</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">VOICE ENERGY</p>
          <p className="text-xs text-gray-600">{brandIntelligence?.voiceDNA?.energySignature || voiceProfile.personalityInsight || 'Professional'}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">VOCABULARY</p>
          <p className="text-xs text-gray-600">{brandIntelligence?.voiceDNA?.vocabularyLevel || (voiceProfile.vocabulary || []).join(', ') || 'Conversational'}</p>
        </div>
      </div>

      {(brandIntelligence?.corePainPoints || []).length > 0 && (
        <div className="bg-white/60 rounded-xl p-3 mt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">CUSTOMER PAIN POINTS</p>
          <div className="flex flex-wrap gap-1">{(brandIntelligence?.corePainPoints || []).slice(0, 5).map((p: string, i: number) => <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{p}</span>)}</div>
        </div>
      )}

      {(brandIntelligence?.contentAngles || []).length > 0 && (
        <div className="bg-white/60 rounded-xl p-3 mt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">CONTENT ANGLES UNLOCKED</p>
          <div className="space-y-1">{brandIntelligence!.contentAngles.slice(0, 5).map((a: string, i: number) => <p key={i} className="text-xs text-gray-600">{i + 1}. {a}</p>)}</div>
        </div>
      )}

      {voiceProfile.personalityInsight && <p className="mt-3 text-sm italic text-gray-500">&ldquo;{voiceProfile.personalityInsight}&rdquo;</p>}
    </div>
  );

  // ─── Step 1 Router ──────────────────────────────────────────────
  const renderStep1 = () => {
    if (!voicePath) return renderVoicePathSelection();
    if (voicePath === 'questions') return renderQuestionsPath();
    if (voicePath === 'interview') return renderInterviewPath();
    return renderPastePath();
  };

  // ─── Step 2: Channels ───────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">Select the platforms where you publish content. We&apos;ll generate optimized content for each one.</p>
        <div className="grid grid-cols-2 gap-3">
          {CHANNELS.map(ch => {
            const Icon = ch.icon;
            const selected = channels.includes(ch.key);
            return (
              <button key={ch.key} onClick={() => toggleChannel(ch.key)} className={cn('flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left', selected ? `${ch.color} border-current shadow-sm` : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                <Icon className="w-5 h-5" /><span className="font-medium text-sm">{ch.label}</span>{selected && <Check className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── Step 3: First Content ──────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!firstContent && !generatingFirst && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-white" /></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">See the Difference Your Profile Makes</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">We&apos;ll generate the same LinkedIn post two ways: generic AI vs. your trained voice. The difference will blow your mind.</p>
          <button onClick={generateFirstContent} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate My First Content</button>
        </div>
      )}

      {generatingFirst && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Creating Your First Content</h3>
          <p className="text-gray-500 text-sm">Generating side-by-side: generic AI vs your voice-trained output...</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400"><div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" /> Using your business context, pain points, and voice profile</div>
        </div>
      )}

      {firstContent && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">The &ldquo;Holy Shit&rdquo; Moment</h3>
            <p className="text-sm text-gray-500">Same topic. Same AI. Completely different output.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 relative opacity-75">
              <div className="absolute -top-3 left-4 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">GENERIC AI</div>
              <div className="flex items-center gap-2 mb-3 mt-1"><span className="text-2xl font-bold text-gray-400">{firstContent.analysis?.genericScore || 5.8}</span><span className="text-xs text-gray-400">/10</span></div>
              <div className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto">{firstContent.genericContent}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-5 relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">YOUR VOICE</div>
              <div className="flex items-center gap-2 mb-3 mt-1">
                <span className="text-2xl font-bold text-blue-600">{firstContent.analysis?.voiceScore || 9.1}</span><span className="text-xs text-gray-500">/10</span>
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{firstContent.analysis?.voiceMatchPercentage || 94}% voice match</span>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto">{firstContent.voiceContent}</div>
            </div>
          </div>

          {firstContent.analysis?.aiReasoning && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">WHY THIS SOUNDS LIKE YOU</p>
                  <p className="text-sm text-amber-800">{firstContent.analysis.aiReasoning}</p>
                </div>
              </div>
            </div>
          )}

          {firstContent.analysis?.improvements && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">WHAT YOUR PROFILE UNLOCKED</p>
              <div className="space-y-1.5">
                {firstContent.analysis.improvements.map((imp: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{imp}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return company.trim() && industry;
      case 1: return voiceBuilt;
      case 2: return channels.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-gray-900">Content Factory</span>
          <span className="text-gray-300 mx-2">|</span>
          <span className="text-sm text-gray-500">Setup</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all', i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400')}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-1 mx-2 rounded-full transition-all', i < step ? 'bg-blue-600' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600 mb-1">Step {step + 1} of {STEPS.length}</p>
          <h2 className="text-2xl font-bold text-gray-900">{STEPS[step].title}</h2>
          <p className="text-gray-500 mt-1">{STEPS[step].description}</p>
        </div>

        {renderCurrentStep()}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => { if (step === 1 && voicePath) { setVoicePath(null); setVoiceBuilt(false); setVoiceProfile(null); } else { setStep(Math.max(0, step - 1)); } }} disabled={step === 0 && !voicePath} className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-sm">Continue <ArrowRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={finishOnboarding} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold">{firstContent ? 'Launch Dashboard' : 'Skip & Launch Dashboard'} <ArrowRight className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
