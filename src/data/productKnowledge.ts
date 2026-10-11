export type KnowledgeObjectType =
  | 'requirement'
  | 'decision'
  | 'component'

export interface KnowledgeObject {
  id: string
  type: KnowledgeObjectType
  title: string
  content: string
  domain: string
  owner: string
  source: string
}

export const productKnowledge: KnowledgeObject[] = [
  {
    id: 'AUTH-31',
    type: 'decision',
    title: 'Login email is the account identity',
    content:
      'The login email is the immutable identifier of a user account and cannot be changed after account creation.',
    domain: 'Authentication',
    owner: 'Identity Team',
    source: 'Product Decision',
  },
  {
    id: 'AUTH-18',
    type: 'requirement',
    title: 'Email verification during registration',
    content:
      'Users must verify their login email before their account becomes active.',
    domain: 'Authentication',
    owner: 'Identity Team',
    source: 'Jira',
  },
  {
    id: 'SUB-42',
    type: 'requirement',
    title: 'Restore cancelled subscription',
    content:
      'Customers can restore a cancelled subscription for up to 30 days after cancellation.',
    domain: 'Subscriptions',
    owner: 'Subscriptions Team',
    source: 'Jira',
  },
  {
    id: 'PRIV-12',
    type: 'requirement',
    title: 'Delete subscription data',
    content:
      'All subscription-related customer data must be permanently deleted 7 days after subscription cancellation.',
    domain: 'Privacy',
    owner: 'Platform Team',
    source: 'Jira',
  },
  {
    id: 'PAY-22',
    type: 'component',
    title: 'Payment Service',
    content:
      'Handles payment authorization, capture, refunds and payment status.',
    domain: 'Payments',
    owner: 'Payments Team',
    source: 'System Architecture',
  },
]