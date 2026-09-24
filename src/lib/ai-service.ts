import { getAIProvider } from './ai-provider';
import {
  IntakeExtractionOutputSchema,
  NextAdaptiveQuestionOutputSchema,
  IdeaBriefSchema,
} from './schemas/brand-schemas';
import { ExtractedFact, Hypothesis, InterviewQuestion, IdeaBrief } from '@/types/brand';
import { logger } from './logger';

export class DiscoveryAIService {
  static async extractInitialIntake(rawIdea: string): Promise<{
    extractedFacts: ExtractedFact[];
    hypotheses: Hypothesis[];
    initialQuestions: InterviewQuestion[];
  }> {
    const provider = getAIProvider();

    const systemPrompt = `You are KINTRA's Strategic Intake Analyst.
Your job is to deconstruct raw founder ideas into three epistemically distinct categories:
1. VERIFIED FACTS: Concrete claims explicitly asserted by the founder.
2. UNVALIDATED ASSUMPTIONS: High-risk implicit premises about market demand, user behavior, or technical feasibility that must be tested.
3. ADAPTIVE QUESTIONS: 2-3 high-leverage follow-up questions to uncover critical strategic unknowns before branding begins.

Do NOT generate brand names, visual styles, or marketing taglines yet. Focus purely on understanding the product problem space.`;

    const userPrompt = `Deconstruct this raw founder idea:
"""
${rawIdea}
"""`;

    logger.info('Analyzing raw founder idea...', { length: rawIdea.length });
    const result = await provider.generateStructured(userPrompt, IntakeExtractionOutputSchema, systemPrompt);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to extract intake brief from AI provider.');
    }

    const now = new Date().toISOString();
    const data = result.data;

    const extractedFacts: ExtractedFact[] = data.extractedFacts.map((f, i) => ({
      id: `fact-${Date.now()}-${i + 1}`,
      statement: f.statement,
      source: 'ai_extracted',
      confidence: f.confidence,
      verifiedByUser: false,
      createdAt: now,
    }));

    const hypotheses: Hypothesis[] = data.unvalidatedAssumptions.map((a, i) => ({
      id: `hyp-${Date.now()}-${i + 1}`,
      claim: a.claim,
      riskLevel: a.riskLevel,
      potentialConsequenceIfFalse: a.potentialConsequenceIfFalse,
      status: 'untested',
    }));

    const initialQuestions: InterviewQuestion[] = data.initialQuestions.map((q, i) => ({
      id: `q-${Date.now()}-${i + 1}`,
      topic: q.topic,
      question: q.question,
      whyAsking: q.whyAsking,
      suggestedAnswers: q.suggestedAnswers,
      answerType: q.answerType,
      skipped: false,
      askedAt: now,
    }));

    return { extractedFacts, hypotheses, initialQuestions };
  }

  static async getNextAdaptiveQuestion(
    history: InterviewQuestion[],
    rawIdea: string
  ): Promise<{ hasMore: boolean; nextQuestion?: InterviewQuestion; reason: string }> {
    // Hard cap at 4 questions to prevent founder interrogation fatigue
    if (history.length >= 4) {
      return {
        hasMore: false,
        reason: 'Sufficient foundational context gathered (maximum question limit reached).',
      };
    }

    const provider = getAIProvider();
    const answered = history.filter((q) => !q.skipped && q.userAnswer);

    const systemPrompt = `You are KINTRA's Adaptive Discovery Strategist.
Review the founder's initial idea and their answers to previous questions.
Determine if an essential strategic blindspot remains across:
- Problem severity
- Target buyer avatar
- Alternatives & current workarounds
- Unfair advantage
- Non-negotiable constraints

If enough clarity exists to generate a defensible Idea Brief, set hasMoreQuestions: false.
If a high-consequence ambiguity remains, formulate exactly ONE next question with a strategic justification ("whyAsking").`;

    const userPrompt = `Raw Idea: "${rawIdea}"
Answered questions so far:
${answered.map((q, i) => `${i + 1}. [${q.topic}] Q: ${q.question}\nA: ${q.userAnswer}`).join('\n\n')}

Decide whether another question is required.`;

    const result = await provider.generateStructured(userPrompt, NextAdaptiveQuestionOutputSchema, systemPrompt);

    if (!result.success || !result.data) {
      return {
        hasMore: false,
        reason: 'Defaulting to completion due to provider transition.',
      };
    }

    const data = result.data;
    if (!data.hasMoreQuestions || !data.nextQuestion) {
      return {
        hasMore: false,
        reason: data.reasonForCompletionOrNext,
      };
    }

    const nextQ: InterviewQuestion = {
      id: `q-${Date.now()}`,
      topic: data.nextQuestion.topic,
      question: data.nextQuestion.question,
      whyAsking: data.nextQuestion.whyAsking,
      suggestedAnswers: data.nextQuestion.suggestedAnswers,
      answerType: data.nextQuestion.answerType,
      skipped: false,
      askedAt: new Date().toISOString(),
    };

    return {
      hasMore: true,
      nextQuestion: nextQ,
      reason: data.reasonForCompletionOrNext,
    };
  }

  static async synthesizeIdeaBrief(
    rawIdea: string,
    facts: ExtractedFact[],
    assumptions: Hypothesis[],
    interviewHistory: InterviewQuestion[]
  ): Promise<IdeaBrief> {
    const provider = getAIProvider();

    const systemPrompt = `You are KINTRA's Principal Brand Strategist.
Synthesize the structured Idea Brief from all collected founder inputs, verified facts, and interview answers.
The Idea Brief is the foundational contract that will govern all downstream positioning, naming, and launch copy.

Requirements:
- Problem: Define the specific pain, who suffers, and what trigger event makes them seek a solution.
- Target User: Name a specific niche avatar, their current painful workarounds, and their buying trigger.
- Value: Articulate the core mechanic, the tangible primary benefit, and an unfair advantage.
- Constraints: Formulate 2-3 non-negotiable boundaries.
- Assumptions: Consolidate the 1-3 most critical premises that could kill the business if false.
- Confidence Score: Assign a realistic confidence score between 0.70 and 0.95 based on context depth.`;

    const answered = interviewHistory.filter((q) => !q.skipped && q.userAnswer);

    const userPrompt = `Raw Founder Idea: "${rawIdea}"

Verified Facts:
${facts.map((f) => `- ${f.statement}`).join('\n')}

Assumptions on Record:
${assumptions.map((a) => `- [${a.riskLevel}] ${a.claim}`).join('\n')}

Discovery Interview Insights:
${answered.map((q) => `- [${q.topic}] Q: ${q.question} -> A: ${q.userAnswer}`).join('\n')}

Generate the canonical IdeaBrief JSON conforming strictly to the IdeaBriefSchema.`;

    const result = await provider.generateStructured(userPrompt, IdeaBriefSchema, systemPrompt);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to synthesize Idea Brief.');
    }

    return result.data;
  }
}
