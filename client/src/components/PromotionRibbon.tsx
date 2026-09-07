import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Promotion } from "@/hooks/useActivePromotion";

interface PromotionRibbonProps {
  /** The active promotion to render. Renders nothing when null/undefined. */
  promotion: Promotion | null | undefined;
}

/** sessionStorage key prefix used to record per-promotion dismissals. */
const DISMISSED_KEY = (id: string) => `dismissed_promotion_${id}`;

/**
 * PromotionRibbon — full-width contextual upgrade banner for FREE-tier users.
 *
 * Behaviour:
 * - Renders nothing when `promotion` is null/undefined.
 * - On mount, reads sessionStorage; hides the ribbon if already dismissed this session.
 * - Fires a `promotion_ribbon_viewed` analytics event exactly once per render lifecycle.
 * - Dismiss button writes to sessionStorage and hides the ribbon.
 * - CTA opens `ctaUrl` in a new tab and fires `promotion_ribbon_cta_clicked`.
 * - Respects `prefers-reduced-motion`: suppresses the slide-down animation.
 * - WCAG 2.1 AA: `role="banner"`, keyboard-focusable buttons, sufficient colour contrast
 *   (caller is responsible for supplying accessible colour values).
 */
export default function PromotionRibbon({ promotion }: PromotionRibbonProps) {
  const [dismissed, setDismissed] = useState(false);
  const viewedRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Detect prefers-reduced-motion once on mount
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  // Check whether this promotion was already dismissed in this session
  useEffect(() => {
    if (!promotion) return;
    if (window.sessionStorage.getItem(DISMISSED_KEY(promotion.id)) === "true") {
      setDismissed(true);
    }
  }, [promotion?.id]);

  // Fire viewed event exactly once per non-null, non-dismissed promotion
  useEffect(() => {
    if (!promotion || dismissed || viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("promotion_ribbon_viewed", {
      promotion_id: promotion.id,
      target_tier: promotion.targetTier,
    });
  }, [promotion, dismissed]);

  if (!promotion || dismissed) return null;

  const handleDismiss = () => {
    window.sessionStorage.setItem(DISMISSED_KEY(promotion.id), "true");
    setDismissed(true);
  };

  const handleCta = () => {
    trackEvent("promotion_ribbon_cta_clicked", {
      promotion_id: promotion.id,
      target_tier: promotion.targetTier,
      cta_url: promotion.ctaUrl,
    });
    window.open(promotion.ctaUrl, "_blank", "noopener,noreferrer");
  };

  const animationClass = reduceMotion
    ? ""
    : "animate-[slideDown_0.3s_ease-out]";

  return (
    <div
      role="banner"
      aria-label="Promotional offer"
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-2 shadow-sm ${animationClass}`}
      style={{
        backgroundColor: promotion.backgroundColour,
        color: promotion.textColour,
      }}
    >
      {/* Left: badge + headline */}
      <div className="flex items-center gap-3 min-w-0">
        {promotion.badgeLabel && (
          <span
            className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border border-current"
            aria-label={`Badge: ${promotion.badgeLabel}`}
          >
            {promotion.badgeLabel}
          </span>
        )}
        <span className="text-sm font-semibold truncate">{promotion.title}</span>
        {promotion.bodyText && (
          <span className="hidden md:inline text-sm opacity-90 truncate">
            {promotion.bodyText}
          </span>
        )}
      </div>

      {/* Right: CTA + dismiss */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCta}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-current hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ borderColor: promotion.textColour }}
        >
          {promotion.ctaLabel}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss promotion"
          className="p-1 rounded hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
