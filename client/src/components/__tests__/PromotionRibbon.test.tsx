import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PromotionRibbon from "../PromotionRibbon";

// Mock analytics so tests don't require a real Segment/Amplitude setup
vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from "@/lib/analytics";

const promotionFixture = {
  id: "promo-001",
  title: "Upgrade to Premium today!",
  badgeLabel: "SAVE 20%",
  bodyText: "Unlock all wellness features.",
  ctaLabel: "Upgrade Now",
  ctaUrl: "https://example.com/upgrade",
  backgroundColour: "#1A73E8",
  textColour: "#FFFFFF",
  targetTier: "FREE",
  startsAt: new Date(Date.now() - 3600_000).toISOString(),
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
};

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// (1) null promotion → renders nothing
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — null promotion", () => {
  it("renders nothing when promotion is null", () => {
    const { container } = render(<PromotionRibbon promotion={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when promotion is undefined", () => {
    const { container } = render(<PromotionRibbon promotion={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (2) active promotion → all elements visible
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — active promotion", () => {
  it("renders the title, badge, CTA button, and dismiss button", () => {
    render(<PromotionRibbon promotion={promotionFixture} />);

    expect(screen.getByText("Upgrade to Premium today!")).toBeInTheDocument();
    expect(screen.getByText("SAVE 20%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upgrade Now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss promotion" })).toBeInTheDocument();
  });

  it("has role=banner for accessibility", () => {
    render(<PromotionRibbon promotion={promotionFixture} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("applies backgroundColour and textColour inline styles", () => {
    render(<PromotionRibbon promotion={promotionFixture} />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveStyle({ backgroundColor: "#1A73E8", color: "#FFFFFF" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (3) dismiss → ribbon removed + sessionStorage written
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — dismiss interaction", () => {
  it("removes the ribbon when dismiss button is clicked", () => {
    const { container } = render(<PromotionRibbon promotion={promotionFixture} />);
    expect(container.firstChild).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss promotion" }));

    expect(container.firstChild).toBeNull();
  });

  it("writes dismissed_promotion_<id>=true to sessionStorage", () => {
    render(<PromotionRibbon promotion={promotionFixture} />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss promotion" }));

    expect(sessionStorage.getItem("dismissed_promotion_promo-001")).toBe("true");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (4) pre-dismissed → renders nothing on mount
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — pre-dismissed", () => {
  it("renders nothing when sessionStorage entry is already set", () => {
    sessionStorage.setItem("dismissed_promotion_promo-001", "true");
    const { container } = render(<PromotionRibbon promotion={promotionFixture} />);
    expect(container.firstChild).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (5) analytics — viewed event fired once
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — analytics: viewed event", () => {
  it("fires promotion_ribbon_viewed on first render", () => {
    render(<PromotionRibbon promotion={promotionFixture} />);
    expect(trackEvent).toHaveBeenCalledWith("promotion_ribbon_viewed", {
      promotion_id: "promo-001",
      target_tier: "FREE",
    });
  });

  it("fires viewed event exactly once even when re-rendered", () => {
    const { rerender } = render(<PromotionRibbon promotion={promotionFixture} />);
    rerender(<PromotionRibbon promotion={promotionFixture} />);
    const viewedCalls = (trackEvent as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([evt]) => evt === "promotion_ribbon_viewed"
    );
    expect(viewedCalls).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (6) analytics — CTA click event
// ─────────────────────────────────────────────────────────────────────────────
describe("PromotionRibbon — analytics: CTA click", () => {
  it("fires promotion_ribbon_cta_clicked on CTA button click", () => {
    // Stub window.open to avoid JSDOM navigation errors
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<PromotionRibbon promotion={promotionFixture} />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade Now" }));

    expect(trackEvent).toHaveBeenCalledWith("promotion_ribbon_cta_clicked", {
      promotion_id: "promo-001",
      target_tier: "FREE",
      cta_url: "https://example.com/upgrade",
    });

    openSpy.mockRestore();
  });

  it("opens the ctaUrl in a new tab", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<PromotionRibbon promotion={promotionFixture} />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade Now" }));

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/upgrade",
      "_blank",
      "noopener,noreferrer"
    );

    openSpy.mockRestore();
  });
});
