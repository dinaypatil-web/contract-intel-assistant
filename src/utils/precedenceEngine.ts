import { DocumentType, PrecedenceRule } from '../types/contract';

export function resolvePrecedence(
  ruleList: PrecedenceRule[],
  docTypeA: DocumentType,
  docTypeB: DocumentType
): { winner: DocumentType; reason: string; ruleRankDiff: number } {
  const ruleA = ruleList.find(r => r.documentType === docTypeA);
  const ruleB = ruleList.find(r => r.documentType === docTypeB);

  if (!ruleA || !ruleB) {
    return {
      winner: docTypeA,
      reason: 'Contract document precedence could not be conclusively established from the uploaded documents.',
      ruleRankDiff: 0
    };
  }

  if (ruleA.rank < ruleB.rank) {
    return {
      winner: docTypeA,
      reason: `According to the project's Order of Precedence (Clause 1.5), ${docTypeA} (Rank #${ruleA.rank}) takes precedence over ${docTypeB} (Rank #${ruleB.rank}).`,
      ruleRankDiff: ruleB.rank - ruleA.rank
    };
  } else if (ruleB.rank < ruleA.rank) {
    return {
      winner: docTypeB,
      reason: `According to the project's Order of Precedence (Clause 1.5), ${docTypeB} (Rank #${ruleB.rank}) takes precedence over ${docTypeA} (Rank #${ruleA.rank}).`,
      ruleRankDiff: ruleA.rank - ruleB.rank
    };
  } else {
    return {
      winner: docTypeA,
      reason: `Both documents have equal ranking (Rank #${ruleA.rank}). General rules of contractual interpretation or mutual intention applies.`,
      ruleRankDiff: 0
    };
  }
}
