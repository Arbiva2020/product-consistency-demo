
import { supabase } from '../lib/supabase'
import type { ConflictResult } from '../services/consistencyChecker'

export interface ReviewItem {
  id: string
  requirementTitle: string
  requirement: string
  conflict: ConflictResult
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'INTENTIONAL'
  createdAt: string
  resolvedDecisionId?: string | null
}

interface ReviewItemRow {
  id: string
  requirement_title: string
  requirement: string
  conflict: ConflictResult
  status: ReviewItem['status']
  created_at: string
  resolved_decision_id: string | null
}

function mapRowToReviewItem(row: ReviewItemRow): ReviewItem {
  return {
    id: row.id,
    requirementTitle: row.requirement_title,
    requirement: row.requirement,
    conflict: row.conflict,
    status: row.status,
    createdAt: row.created_at,
    resolvedDecisionId: row.resolved_decision_id,
  }
}

export async function addReviewItem(item: ReviewItem): Promise<void> {
  const { error } = await supabase
    .from('review_items')
    .insert({
      id: item.id,
      requirement_title: item.requirementTitle,
      requirement: item.requirement,
      conflict: item.conflict,
      status: item.status,
      created_at: item.createdAt,
      resolved_decision_id: item.resolvedDecisionId ?? null,
    })

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'This conflict is already waiting for review.',
        )
      }
    
      throw error
    }
}

export async function getReviewItems(): Promise<ReviewItem[]> {
  const { data, error } = await supabase
    .from('review_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) =>
    mapRowToReviewItem(row as ReviewItemRow),
  )
}

export async function updateReviewStatus(
  id: string,
  status: ReviewItem['status'],
  resolvedDecisionId?: string,
): Promise<void> {
  const updates: {
    status: ReviewItem['status']
    resolved_decision_id?: string
  } = { status }

  if (resolvedDecisionId !== undefined) {
    updates.resolved_decision_id = resolvedDecisionId
  }

  const { data, error } = await supabase
    .from('review_items')
    .update(updates)
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Review item was not found.')
  }
}
