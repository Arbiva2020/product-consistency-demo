import {
  productKnowledge,
  type KnowledgeObject,
} from '../data/productknowledge'

export interface ConflictResult {
  type: 'CONTRADICTION'
  severity: 'HIGH' | 'MEDIUM'
  confidence: number
  reason: string
  relatedObject: KnowledgeObject
}

export function checkConsistency(
  title: string,
  requirement: string,
): ConflictResult[] {
  const text = `${title} ${requirement}`.toLowerCase()

  const results: ConflictResult[] = []

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
        relatedObject,
      })
    }
  }

  return results
}