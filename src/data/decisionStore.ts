export interface ProductDecision {
  id: string
  title: string
  decision: string
  rationale: string
  sourceConflictId: string
  relatedObjectId: string
  status: 'APPROVED'
  version: number
  approvedBy: string
  approvedAt: string
}

const decisions: ProductDecision[] = []

export function addDecision(decision: ProductDecision) {
  decisions.push(decision)
}

export function getDecisions() {
  return decisions
}