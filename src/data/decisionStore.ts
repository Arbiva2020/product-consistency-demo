//the purpose of this file is to store the product decisions made by the user.
// it is used to check for consistency between the product knowledge and the 
// product decisions.
// the behaviour will be a-syncronous, since Supabase is our database and is also a-syncronous.

import { supabase } from '../lib/supabase'

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

interface ProductDecisionRow {
  id: string
  title: string
  decision: string
  rationale: string
  source_conflict_id: string
  related_object_id: string
  status: 'APPROVED'
  version: number
  approved_by: string
  approved_at: string
}

function mapRowToDecision(
  row: ProductDecisionRow,
): ProductDecision {
  return {
    id: row.id,
    title: row.title,
    decision: row.decision,
    rationale: row.rationale,
    sourceConflictId: row.source_conflict_id,
    relatedObjectId: row.related_object_id,
    status: row.status,
    version: row.version,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
  }
}

export async function addDecision(
  decision: ProductDecision,
): Promise<void> {
  const { error } = await supabase
    .from('product_decisions')
    .insert({
      id: decision.id,
      title: decision.title,
      decision: decision.decision,
      rationale: decision.rationale,
      source_conflict_id: decision.sourceConflictId,
      related_object_id: decision.relatedObjectId,
      status: decision.status,
      version: decision.version,
      approved_by: decision.approvedBy,
      approved_at: decision.approvedAt,
    })

  if (error) {
    throw error
  }
}

export async function getDecisions(): Promise<ProductDecision[]> {
  const { data, error } = await supabase
    .from('product_decisions')
    .select('*')
    .order('approved_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) =>
    mapRowToDecision(row as ProductDecisionRow),
  )
}

export async function findDecisionByText(
  searchTerms: string[],
): Promise<ProductDecision | undefined> {
  const decisions = await getDecisions()

  return decisions.find((decision) => {
    const text =
      `${decision.title} ${decision.decision} ${decision.rationale}`.toLowerCase()

    return searchTerms.some((term) =>
      text.includes(term.toLowerCase()),
    )
  })
}