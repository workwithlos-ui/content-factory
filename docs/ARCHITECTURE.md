# Content Factory — Architecture

## 7-Command AI Pipeline

| Command | API Route | Purpose |
|---------|-----------|---------|
| Brand Intelligence Extractor | `/api/extract-profile` | Builds complete brand profile from onboarding answers |
| Content Strategist | `/api/generate` (step 1) | Turns raw topic into strategic brief |
| Platform Writer (x7) | `/api/generate` (step 2) | Generates platform-optimized content |
| Quality Controller | `/api/generate` (step 3) | Scores content on 6 dimensions |
| Topic Generator | `/api/suggest-topics` | Creates 10 buyer-journey-mapped ideas |
| Voice Cloner | `/api/analyze-voice` | Extracts Voice DNA from content samples |
| AI Interview | `/api/interview` | Conversational brand discovery |

## Content Frameworks (12)

1. Contrarian + Proof
2. PAS (Problem-Agitate-Solve)
3. Story-Lesson-Action
4. Before/After Bridge
5. Data-Insight-Application
6. Myth Busting
7. Most People Think
8. Question-Answer Framework
9. Step-by-Step Tactical
10. Case Study
11. Prediction-Preparation
12. Old Way vs New Way

## Quality Scoring (6 Dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Hook Strength | 25% | Does it stop the scroll? |
| Specificity | 20% | Real numbers, scenarios, not vague advice |
| Tactical Depth | 20% | Explains WHY, not just WHAT |
| Voice Match | 15% | Sounds like the user based on profile |
| CTA Clarity | 10% | Next step is obvious |
| Platform Optimization | 10% | Formatted right for the platform |

## Data Flow

```
Onboarding → Brand Intelligence Extractor → BrandIntelligenceProfile (localStorage)
                                                    ↓
Topic Input → Content Strategist → Strategic Brief → Platform Writers (x7) → Quality Controller → Content Library
                                                    ↑
                                        BrandIntelligenceProfile
```

## Route Structure

```
/                    Landing page (public)
/signup              Account creation (public)
/login               Authentication (public)
/onboarding          4-step onboarding (authenticated)
/dashboard           Content Command Center (authenticated)
/content/new         Content creation engine (authenticated)
/content/[id]        Content detail view (authenticated)
/library             Content library (authenticated)
/topics              Topic Generator (authenticated)
/voice               Brand Voice Engine (authenticated)
/analytics           Analytics dashboard (authenticated)
/competitive         Competitive Intelligence (authenticated)
/settings            Account settings (authenticated)
```
