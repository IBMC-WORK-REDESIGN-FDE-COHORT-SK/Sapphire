import { useQuery } from "@apollo/client/react";
import { GET_ACTIVE_PROMOTION } from "@/graphql/promotion";

/** Shape of a single active promotion returned by the BFF. */
export interface Promotion {
  id: string;
  title: string;
  badgeLabel?: string | null;
  bodyText?: string | null;
  ctaLabel: string;
  ctaUrl: string;
  backgroundColour: string;
  textColour: string;
  targetTier: string;
  startsAt: string;
  expiresAt: string;
}

interface UseActivePromotionResult {
  /** Active promotion, or null/undefined when none is active or user is PREMIUM. */
  promotion: Promotion | null | undefined;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Hook that fetches the active promotional ribbon for the current user.
 *
 * Uses cache-and-network so that the ribbon updates within the BFF
 * cache window (60 s, FR-007a) without a loading flash on repeat views.
 *
 * @returns `{ promotion, loading, error }`
 */
export function useActivePromotion(): UseActivePromotionResult {
  const { data, loading, error } = useQuery(GET_ACTIVE_PROMOTION, {
    fetchPolicy: "cache-and-network",
  });

  return {
    promotion: (data as any)?.activePromotion ?? null,
    loading,
    error: error as Error | undefined,
  };
}
