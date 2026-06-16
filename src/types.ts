/**
 * Zod schemas for routing-oracle MCP tool contracts.
 *
 * Covers: delegate_to_model, weather_report, consensus_vote
 */

import { z } from 'zod';

// ============================================================================
// delegate_to_model
// ============================================================================

export const DelegateInputSchema = z.object({
  task: z.string().min(1),
  preferred_capability: z
    .enum(['reasoning', 'context', 'speed', 'code'])
    .optional(),
  model_hint: z.string().optional(),
  estimate_tokens: z.boolean().optional(),
  billing_mode: z.enum(['plan', 'api']).optional(),
});

export type DelegateInput = z.infer<typeof DelegateInputSchema>;

export const CapabilitiesSchema = z.object({
  reasoning: z.number(),
  contextWindow: z.number(),
  codeGeneration: z.number(),
  speed: z.number(),
  cost: z.number(),
});

export const AlternativeSchema = z.object({
  model: z.string(),
  score: z.number(),
  tradeoff: z.string(),
});

const GovernanceSchema = z.object({
  domain: z.string(),
  votingThreshold: z.string(),
  promotionReason: z.string(),
});

export const DelegateResponseSchema = z.object({
  recommended_model: z.string(),
  reasoning: z.string(),
  capabilities: CapabilitiesSchema,
  estimated_tokens: z.number(),
  alternatives: z.array(AlternativeSchema),
  governance: GovernanceSchema.optional(),
});

export type DelegateResponse = z.infer<typeof DelegateResponseSchema>;

// ============================================================================
// weather_report
// ============================================================================

const CATEGORIES = [
  'architecture',
  'code_generation',
  'code_review',
  'research',
  'security_review',
  'planning',
  'documentation',
  'testing',
  'devops',
  'exploration',
] as const;

export type TaskCategory = (typeof CATEGORIES)[number];

export const WeatherInputSchema = z.object({
  cli: z.enum(['claude', 'gemini', 'codex']).optional(),
  category: z.enum(CATEGORIES).optional(),
  includeAdaptive: z.boolean().optional(),
});

const CliWeatherSchema = z.object({
  cli: z.string(),
  totalTasks: z.number(),
  successRate: z.number(),
  avgDurationMs: z.number(),
  byCategory: z.record(
    z.object({
      count: z.number(),
      successRate: z.number(),
      avgDurationMs: z.number(),
    })
  ),
});

const AdaptiveBonusSchema = z.object({
  cli: z.string(),
  category: z.string(),
  staticBonus: z.number(),
  adaptiveBonus: z.number(),
  sampleCount: z.number(),
  sufficient: z.boolean(),
});

const RecommendedMappingSchema = z.object({
  category: z.string(),
  recommendedCli: z.string(),
  successRate: z.number(),
  sampleCount: z.number(),
  confidence: z.string(),
});

export const WeatherResponseSchema = z.object({
  overall: z.object({
    totalTasks: z.number(),
    successRate: z.number(),
    avgDurationMs: z.number(),
  }),
  cliWeather: z.array(CliWeatherSchema),
  adaptiveBonuses: z.array(AdaptiveBonusSchema),
  tierRecommendations: z.array(z.record(z.unknown())),
  learningInsights: z.array(z.record(z.unknown())).optional(),
  recommendedMappings: z.array(RecommendedMappingSchema).optional(),
  explorationRate: z.number(),
  coldStartThreshold: z.number(),
  collectedAt: z.string(),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

// ============================================================================
// consensus_vote
// ============================================================================

const STRATEGIES = [
  'simple_majority',
  'supermajority',
  'unanimous',
  'proof_of_learning',
  'higher_order',
] as const;

export type VotingStrategy = (typeof STRATEGIES)[number];

export const VoteInputSchema = z.object({
  proposal: z.string().min(1).max(4000),
  strategy: z.enum(STRATEGIES).optional(),
  quickMode: z.boolean().optional(),
  simulateVotes: z.boolean().optional(),
});

const AgentVoteSchema = z.object({
  role: z.string(),
  decision: z.enum(['approve', 'reject', 'abstain']),
  confidence: z.number(),
  reasoning: z.string(),
  simulated: z.boolean(),
  error: z.boolean(),
});

export const VoteResponseSchema = z.object({
  proposal: z.string(),
  strategy: z.enum(STRATEGIES),
  decision: z.enum(['approved', 'rejected', 'pending', 'timeout']),
  approvalPercentage: z.number(),
  voteCounts: z.object({
    approve: z.number(),
    reject: z.number(),
    abstain: z.number(),
    error: z.number(),
  }),
  votes: z.array(AgentVoteSchema),
  durationMs: z.number(),
  simulateVotes: z.boolean(),
});

export type VoteResponse = z.infer<typeof VoteResponseSchema>;

// ============================================================================
// Routing Oracle types
// ============================================================================

/** Known-good routing expectation for a task category. */
export interface RoutingExpectation {
  readonly category: TaskCategory;
  readonly task: string;
  readonly preferredCapability: 'reasoning' | 'context' | 'speed' | 'code';
  readonly expectedPrimaryCli: string;
  readonly acceptableModels: readonly string[];
}

/** Result of validating a single routing decision. */
export interface RoutingValidation {
  readonly category: TaskCategory;
  readonly recommended: string;
  readonly expected: string;
  readonly correct: boolean;
  readonly reasoning: string;
  readonly alternatives: readonly string[];
}

/** Full oracle report. */
export interface OracleReport {
  readonly validations: readonly RoutingValidation[];
  readonly accuracy: number;
  readonly weather: WeatherResponse | null;
  readonly voteResult: VoteResponse | null;
}

/** Pipeline configuration. */
export interface OracleConfig {
  readonly expectations: readonly RoutingExpectation[];
  readonly includeWeather?: boolean;
  readonly includeVote?: boolean;
  readonly voteStrategy?: VotingStrategy;
  /** Per-call timeout (ms) for remote tool calls. Omit to use the default. */
  readonly timeoutMs?: number;
}
