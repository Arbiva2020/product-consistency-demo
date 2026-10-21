import {
  productKnowledge,
  type KnowledgeObject,
} from '../data/productKnowledge'

import {
  getDecisions,
  type ProductDecision,
} from '../data/decisionStore'

export interface ConflictResult {
  type:
    | 'CONTRADICTION'
    | 'EXISTING_TRUTH_CONFLICT'

  severity: 'HIGH' | 'MEDIUM'

  confidence: number

  reason: string

  sourceType:
    | 'KNOWLEDGE'
    | 'PRODUCT_DECISION'

  relatedObject?: KnowledgeObject

  relatedDecision?: ProductDecision
}

export async function checkConsistency(
  title: string,
  requirement: string,
): Promise<ConflictResult[]> {
  const text = `${title} ${requirement}`.toLowerCase()

  const results: ConflictResult[] = []

  // CHECK 1:
  // Compare a proposed login email change
  // against existing product knowledge.

  const isChangingLoginEmail =
    text.includes('login email') &&
    (
      text.includes('change') ||
      text.includes('update') ||
      text.includes('modify')
    )

  if (isChangingLoginEmail) {
    const relatedObject = productKnowledge.find(
      (item) => item.id === 'AUTH-31',
    )

    if (relatedObject) {
      results.push({
        type: 'CONTRADICTION',
        severity: 'HIGH',
        confidence: 0.94,
        reason:
          'The proposed requirement allows the login email to change, while existing product knowledge defines the login email as an immutable account identifier.',
        sourceType: 'KNOWLEDGE',
        relatedObject,
      })
    }
  }

  // CHECK 2:
  // Compare password recovery requirements
  // against approved Product Decisions in Supabase.

  const isUsingContactEmailForRecovery =
    text.includes('contact email') &&
    (
      text.includes('password') ||
      text.includes('recovery') ||
      text.includes('reset')
    )

  if (isUsingContactEmailForRecovery) {
    const decisions = await getDecisions()

    const identityDecision = decisions.find((decision) => {
      const decisionText =
        `${decision.decision} ${decision.rationale}`.toLowerCase()

      return (
        decisionText.includes('login email') &&
        decisionText.includes('contact email') &&
        (
          decisionText.includes('recovery') ||
          decisionText.includes('authentication')
        )
      )
    })

    if (identityDecision) {
      results.push({
        type: 'EXISTING_TRUTH_CONFLICT',
        severity: 'HIGH',
        confidence: 0.91,
        reason:
          'This requirement proposes using the contact email for password recovery. An approved Product Decision contains relevant restrictions concerning login identity, contact email, and account recovery. Review whether the new requirement conflicts with that decision.',
        sourceType: 'PRODUCT_DECISION',
        relatedDecision: identityDecision,
      })
    }
  }

  return results
}