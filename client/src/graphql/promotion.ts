import { gql } from "@apollo/client";

/**
 * Fetches the currently active promotional ribbon for the authenticated user's tier.
 * Returns null when no promotion is active or the user is PREMIUM.
 * The BFF caches this response for 60 seconds server-side (FR-007a).
 */
export const GET_ACTIVE_PROMOTION = gql`
  query GetActivePromotion {
    activePromotion {
      id
      title
      badgeLabel
      bodyText
      ctaLabel
      ctaUrl
      backgroundColour
      textColour
      targetTier
      startsAt
      expiresAt
    }
  }
`;
