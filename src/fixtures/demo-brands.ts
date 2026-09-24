import { IdeaBrief, CanonicalBrandState, ExtractedFact, Hypothesis, UnresolvedQuestion, InterviewQuestion } from '@/types/brand';

export const DEMO_BRAND_PRGUARD: {
  rawIdea: string;
  extractedFacts: ExtractedFact[];
  hypotheses: Hypothesis[];
  unresolvedQuestions: UnresolvedQuestion[];
  interviewQuestions: InterviewQuestion[];
  ideaBrief: IdeaBrief;
} = {
  rawIdea:
    'An automated AI security tool that audits GitHub pull requests for subtle logic bugs and credential leaks so developers do not have to wait hours for senior engineers to review their code.',
  extractedFacts: [
    {
      id: 'fact-1',
      statement: 'Audits GitHub pull requests automatically upon PR opening or update.',
      source: 'founder_input',
      confidence: 1.0,
      verifiedByUser: true,
      createdAt: '2026-09-24T12:00:00Z',
    },
    {
      id: 'fact-2',
      statement: 'Focuses specifically on subtle logic flaws and credential/secret exposure.',
      source: 'founder_input',
      confidence: 1.0,
      verifiedByUser: true,
      createdAt: '2026-09-24T12:00:00Z',
    },
    {
      id: 'fact-3',
      statement: 'Eliminates review bottlenecks caused by senior engineering review delays.',
      source: 'founder_input',
      confidence: 0.95,
      verifiedByUser: true,
      createdAt: '2026-09-24T12:00:00Z',
    },
  ],
  hypotheses: [
    {
      id: 'hyp-1',
      claim: 'Engineering managers and team leads feel comfortable merging code with automated AI security checks.',
      riskLevel: 'critical',
      potentialConsequenceIfFalse: 'Product is relegated to advisory comments only and cannot act as a blocking CI gate.',
      status: 'untested',
    },
    {
      id: 'hyp-2',
      claim: 'Developers prefer concise line-by-line annotations over full diagnostic security PDF reports.',
      riskLevel: 'medium',
      potentialConsequenceIfFalse: 'Workflow integration fails to match developer PR habits and gets ignored.',
      status: 'untested',
    },
  ],
  unresolvedQuestions: [
    {
      id: 'q-1',
      topic: 'audience',
      question: 'Is the initial buyer an individual developer paying $15/month or an Engineering VP paying $500/month?',
      strategicImportance: 'essential',
      whyItMatters: 'Determines whether the brand voice is casual/developer-first or enterprise compliance-oriented.',
      resolved: false,
    },
    {
      id: 'q-2',
      topic: 'alternatives',
      question: 'How does PRGuard differ from existing static analysis tools like Snyk, SonarQube, and GitHub Dependabot?',
      strategicImportance: 'essential',
      whyItMatters: 'Informs the core differentiator and prevents the brand from sounding like a generic linter.',
      resolved: false,
    },
  ],
  interviewQuestions: [
    {
      id: 'int-1',
      topic: 'audience',
      question: 'Who will make the ultimate decision to install PRGuard into the company repository?',
      whyAsking: 'Clarifies whether our brand needs to build trust with skeptical security officers or delight impatient developers.',
      suggestedAnswers: [
        'Team Lead / Senior Engineer (bottom-up adoption)',
        'VP of Engineering / CISO (top-down compliance mandate)',
        'Solo founders & indie developers (frictionless self-serve)',
      ],
      answerType: 'choice',
      skipped: false,
      userAnswer: 'Team Lead / Senior Engineer (bottom-up adoption)',
    },
    {
      id: 'int-2',
      topic: 'alternatives',
      question: 'What is the most annoying limitation of Snyk, SonarQube, or Copilot code reviews today?',
      whyAsking: 'Pinpoints the exact frustration that your brand will heroically solve.',
      suggestedAnswers: [
        'Too many noisy false alarms that developers learn to ignore',
        'Generic suggestions that do not understand our broader codebase context',
        'High latency: reviews take 15+ minutes and stall CI/CD pipelines',
      ],
      answerType: 'hybrid',
      skipped: false,
      userAnswer: 'Too many noisy false alarms that developers learn to ignore',
    },
    {
      id: 'int-3',
      topic: 'desired_perception',
      question: 'When an engineer sees PRGuard comment on their pull request, how should it feel?',
      whyAsking: 'Sets the foundational tone sliders for our brand voice architecture.',
      suggestedAnswers: [
        'Like a hyper-competent, quiet peer reviewer who never misses a detail',
        'Like an uncompromising security gatekeeper protecting production',
        'Like an educational mentor teaching secure coding practices',
      ],
      answerType: 'choice',
      skipped: false,
      userAnswer: 'Like a hyper-competent, quiet peer reviewer who never misses a detail',
    },
  ],
  ideaBrief: {
    id: 'brief-prguard-1',
    version: 1,
    problem: {
      corePain: 'Senior engineering bottlenecks stall PR merges while subtle logic flaws escape to production due to fatigue.',
      whoSuffers: 'Fast-shipping software teams with lean senior engineering bandwidth.',
      triggerEvent: 'When a pull request is submitted and sits in the review queue for 8+ hours waiting for eyes.',
    },
    targetUser: {
      primaryNiche: 'Technical team leads and staff engineers at high-velocity tech startups (10-80 engineers).',
      currentWorkarounds: [
        'Skimming PRs in a rush between meetings',
        'Relying on noisy SAST linters with 80% false positive rates',
      ],
      buyingTrigger: 'A critical vulnerability or logic regression slips into a release and causes downtime.',
    },
    context: {
      industryOrCategory: 'Developer Productivity & Code Security (DevSecOps)',
      marketDynamics: 'AI code generation has doubled PR volume; human review capacity has remained flat, creating an acute crisis.',
    },
    proposedValue: {
      mechanicOrSolution: 'Contextual AI agent that models git diff semantics and posts zero-fluff, verifiable security findings directly in GitHub PR comments.',
      keyBenefit: 'Cuts PR review turnaround by 75% without compromising production security.',
      unfairAdvantage: 'Deterministic semantic verification that filters out hallucinated warnings before developer notification.',
    },
    constraints: [
      'Must work entirely inside GitHub/GitLab without requiring engineers to visit a secondary dashboard.',
      'Must never produce more than 3 comments per PR to prevent review fatigue.',
    ],
    assumptions: [
      {
        id: 'hyp-1',
        claim: 'Engineers will trust security comments if false positive rate is under 5%.',
        riskLevel: 'critical',
        potentialConsequenceIfFalse: 'Bot will be uninstalled or muted after 3 incorrect comments.',
        status: 'untested',
      },
    ],
    openQuestions: [
      {
        id: 'q-open-1',
        topic: 'constraints',
        question: 'Will enterprise customers require self-hosted or zero-data-retention LLM guarantees?',
        strategicImportance: 'essential',
        whyItMatters: 'Governs security compliance claims in brand messaging.',
        resolved: false,
      },
    ],
    confidenceScore: 0.92,
    status: 'under_review',
    generatedAt: '2026-09-24T12:05:00Z',
  },
};

export const INITIAL_DEMO_PROJECT: CanonicalBrandState = {
  metadata: {
    id: 'proj-prguard-demo',
    name: 'PRGuard Security',
    slug: 'prguard-security',
    version: 1,
    createdAt: '2026-09-24T12:00:00Z',
    updatedAt: '2026-09-24T12:05:00Z',
    isDemoProject: true,
  },
  stage: 'brief_review',
  rawFounderInput: DEMO_BRAND_PRGUARD.rawIdea,
  extractedFacts: DEMO_BRAND_PRGUARD.extractedFacts,
  unresolvedQuestions: DEMO_BRAND_PRGUARD.unresolvedQuestions,
  hypotheses: DEMO_BRAND_PRGUARD.hypotheses,
  interviewState: {
    currentQuestionIndex: 2,
    history: DEMO_BRAND_PRGUARD.interviewQuestions,
    isComplete: true,
    lastUpdated: '2026-09-24T12:04:00Z',
  },
  ideaBrief: DEMO_BRAND_PRGUARD.ideaBrief,
  decisions: {},
  artifacts: [],
  validationHistory: [],
};
