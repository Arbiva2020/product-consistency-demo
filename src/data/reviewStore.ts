import type { ConflictResult } from '../services/consistencyChecker'

export interface ReviewItem {
  id: string
  requirementTitle: string
  requirement: string
  conflict: ConflictResult
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'INTENTIONAL'
  createdAt: string
}

const reviewItems: ReviewItem[] = []

export function addReviewItem(item: ReviewItem) {
  reviewItems.push(item)
}

export function getReviewItems() {
  return reviewItems
}

export function updateReviewStatus(
  id: string,
  status: ReviewItem['status'],
) {
  const item = reviewItems.find((item) => item.id === id)

  if (item) {
    item.status = status
  }
}