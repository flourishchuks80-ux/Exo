export interface MemoryHealthInput {
  semanticCount: number;
  confirmedSemanticCount: number;
  instructionCount: number;
  episodicLast7Days: number;
  documentCount: number;
  lastUpdatedAt: number; // ms timestamp of most recent memory update
}

export interface HealthScore {
  score: number;
  label: string;
  statusLine: string;
  breakdown: {
    semanticScore: number;
    instructionScore: number;
    episodicScore: number;
    documentScore: number;
    freshnessScore: number;
  };
}

export function calculateSovereigntyScore(input: MemoryHealthInput): HealthScore {
  const now = Date.now();
  const daysSinceUpdate = (now - input.lastUpdatedAt) / (1000 * 60 * 60 * 24);

  // Scoring
  const semanticScore = Math.min(30, input.confirmedSemanticCount > 0 ? 30 : 0);
  const instructionScore = Math.min(20, input.instructionCount > 0 ? 20 : 0);
  const episodicScore = Math.min(20, input.episodicLast7Days > 0 ? 20 : 0);
  const documentScore = Math.min(15, input.documentCount > 0 ? 15 : 0);
  const freshnessScore = Math.min(15, daysSinceUpdate < 30 ? 15 : daysSinceUpdate < 60 ? 8 : 0);

  const score = semanticScore + instructionScore + episodicScore + documentScore + freshnessScore;

  let label: string;
  if (score >= 90) label = "Fully Sovereign";
  else if (score >= 70) label = "Well Established";
  else if (score >= 50) label = "Growing";
  else if (score >= 25) label = "Getting Started";
  else label = "No Memory Yet";

  let statusLine: string;
  if (input.lastUpdatedAt === 0) {
    statusLine = "Start building your AI's memory.";
  } else {
    const hours = Math.floor((now - input.lastUpdatedAt) / (1000 * 60 * 60));
    const timeAgo = hours < 1 ? "just now" : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
    statusLine = `Your AI knows you well. Last updated ${timeAgo}.`;
  }

  return {
    score,
    label,
    statusLine,
    breakdown: { semanticScore, instructionScore, episodicScore, documentScore, freshnessScore },
  };
}
