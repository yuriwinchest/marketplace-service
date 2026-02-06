export type SubscriptionPlanCode =
  | 'starter_20'
  | 'pro_50'
  | 'max_100'
  | 'enterprise_200'

export interface SubscriptionPlan {
  code: SubscriptionPlanCode
  name: string
  monthlyPrice: number
  proposalLimit: number
}

export const FREE_PROPOSAL_LIMIT = 3
export const URGENT_PROMOTION_PRICE = 5.99
export const DIRECT_CONTACT_PRICE = 2.99

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanCode, SubscriptionPlan> = {
  starter_20: {
    code: 'starter_20',
    name: 'Starter 20',
    monthlyPrice: 9.99,
    proposalLimit: 20,
  },
  pro_50: {
    code: 'pro_50',
    name: 'Pro 50',
    monthlyPrice: 29.99,
    proposalLimit: 50,
  },
  max_100: {
    code: 'max_100',
    name: 'Max 100',
    monthlyPrice: 59.99,
    proposalLimit: 100,
  },
  enterprise_200: {
    code: 'enterprise_200',
    name: 'Enterprise 200',
    monthlyPrice: 89.9,
    proposalLimit: 200,
  },
}

export const listPlans = (): SubscriptionPlan[] =>
  Object.values(SUBSCRIPTION_PLANS)

export const getPlanByCode = (
  code: SubscriptionPlanCode,
): SubscriptionPlan => SUBSCRIPTION_PLANS[code]

