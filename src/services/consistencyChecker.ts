//the purpose of this file is to check for consistency between the product 
// knowledge and the product decisions by the user.
// it is done by comparing the text of the new requirement with the text 
// of the product knowledge and the product decisions.

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

export function checkConsistency(
  title: string,
  requirement: string,
): ConflictResult[] {
  const text =
    `${title} ${requirement}`.toLowerCase()

  const results: ConflictResult[] = []

  /*
   * CHECK 1
   *
   * New requirement attempts to change login email.
   * Compare against existing product knowledge.
   */

  const isChangingLoginEmail =
    text.includes('email') &&
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
          'The proposed requirement allows the login email to change, while an approved Product Decision defines the login email as an immutable account identifier.',

        sourceType: 'KNOWLEDGE',

        relatedObject,
      })
    }
  }

  /*
   * CHECK 2
   *
   * Password recovery is being sent to contact email.
   *
   * We check whether Product Memory contains
   * an approved decision separating login email
   * from contact email.
   */

  const isUsingContactEmailForRecovery =
    text.includes('contact email') &&
    (
      text.includes('password') ||
      text.includes('recovery') ||
      text.includes('reset')
    )

  if (isUsingContactEmailForRecovery) {
    const decisions = getDecisions()

    const identityDecision =
      decisions.find((decision) => {
        const decisionText =
          `${decision.decision} ${decision.rationale}`.toLowerCase()

        return (
          decisionText.includes('login email') &&
          decisionText.includes('contact email')
        )
      })

    if (identityDecision) {
      results.push({
        type: 'EXISTING_TRUTH_CONFLICT',

        severity: 'HIGH',

        confidence: 0.91,

        reason:
          'This requirement uses the contact email for password recovery. An approved Product Decision separates contact email from the login identity used for authentication and account recovery.',

        sourceType: 'PRODUCT_DECISION',

        relatedDecision: identityDecision,
      })
    }
  }

  return results
}