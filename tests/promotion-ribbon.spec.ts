import { test, expect } from '@playwright/test';

import freeTierUsers from './free-tier-promotion-users.json' assert { type: 'json' };

/**
 * ADF-9 — Promotional Discount Ribbon for Free-Tier Users
 *
 * E2E journeys:
 *   J-01  Ribbon visible on Dashboard after FREE-tier login
 *   J-02  Ribbon CTA opens upgrade destination in new tab
 *   J-03  Ribbon dismissed per-session (persists across soft navigation)
 *   J-04  Ribbon visible on Metrics page for FREE-tier user
 *   J-05  Ribbon absent for PREMIUM-tier user on Dashboard
 *
 * All tests target http://localhost:5000 with a running stack
 * (sapphire-user-service + sapphire-bff-api + Sapphire front-end).
 */

const BASE_URL = 'http://localhost:5000';

/** Shared login helper — matches the data-testid pattern used throughout example.spec.ts */
async function loginAs(page: any, email: string, password: string) {
  await page.goto(BASE_URL + '/');
  await page.getByTestId('button-get-started').click();
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-login').click();
  // Wait for dashboard to settle
  await page.waitForTimeout(4000);
}

// ---------------------------------------------------------------------------
// J-01 — Ribbon visible on Dashboard after FREE-tier login
// ---------------------------------------------------------------------------
freeTierUsers.forEach((user, index) => {
  test(`J-01 free-tier ribbon visible on dashboard [user ${index + 1}]`, async ({ page }) => {
    await loginAs(page, user.email, user.password);

    // PromotionRibbon renders as role="banner" with aria-label="Promotional offer"
    const ribbon = page.getByRole('banner', { name: 'Promotional offer' });
    await expect(ribbon).toBeVisible({ timeout: 10000 });

    // Ribbon must contain the CTA button (any non-empty label)
    const cta = ribbon.locator('button').first();
    await expect(cta).toBeVisible();
    await expect(cta).not.toHaveText('');

    await page.getByTestId('button-logout').click();
  });
});

// ---------------------------------------------------------------------------
// J-02 — CTA opens upgrade destination in a new tab
// ---------------------------------------------------------------------------
test('J-02 ribbon CTA opens upgrade URL in new tab', async ({ page, context }) => {
  const [user] = freeTierUsers;
  await loginAs(page, user.email, user.password);

  const ribbon = page.getByRole('banner', { name: 'Promotional offer' });
  await expect(ribbon).toBeVisible({ timeout: 10000 });

  // Intercept the new-tab open before clicking
  const newTabPromise = context.waitForEvent('page');
  // The CTA is the first <button> inside the ribbon (dismiss is the last)
  const ctaButtons = ribbon.locator('button');
  const count = await ctaButtons.count();
  // CTA is the first button; dismiss button has aria-label "Dismiss promotion"
  const ctaButton = ctaButtons.filter({ hasNot: page.getByLabel('Dismiss promotion') }).first();
  await ctaButton.click();

  const newTab = await newTabPromise;
  await newTab.waitForLoadState('domcontentloaded', { timeout: 10000 });

  // New tab must have a non-empty URL — we do not assert the exact host since
  // it is environment-dependent, but it must not be the same origin's error page
  const newTabUrl = newTab.url();
  expect(newTabUrl).toBeTruthy();
  expect(newTabUrl).not.toBe('about:blank');

  await page.getByTestId('button-logout').click();
});

// ---------------------------------------------------------------------------
// J-03 — Ribbon dismissal persists across soft (client-side) navigation
//         within the same browser session
// ---------------------------------------------------------------------------
test('J-03 dismissed ribbon stays hidden after client-side route change', async ({ page }) => {
  const [user] = freeTierUsers;
  await loginAs(page, user.email, user.password);

  const ribbon = page.getByRole('banner', { name: 'Promotional offer' });
  await expect(ribbon).toBeVisible({ timeout: 10000 });

  // Dismiss the ribbon
  await page.getByLabel('Dismiss promotion').click();
  await expect(ribbon).toBeHidden();

  // Navigate to Metrics page (client-side SPA route) and back to Dashboard
  await page.getByTestId('nav-metrics').click();
  await page.waitForTimeout(1000);
  await page.getByTestId('nav-dashboard').click();
  await page.waitForTimeout(1000);

  // Ribbon must still be hidden — sessionStorage dismissal key preserved
  await expect(ribbon).toBeHidden();

  await page.getByTestId('button-logout').click();
});

// ---------------------------------------------------------------------------
// J-04 — Ribbon is visible on the Metrics page for a FREE-tier user
// ---------------------------------------------------------------------------
test('J-04 ribbon visible on Metrics page for FREE-tier user', async ({ page }) => {
  const [user] = freeTierUsers;
  await loginAs(page, user.email, user.password);

  // Navigate to Metrics via the sidebar nav link
  await page.getByTestId('nav-metrics').click();
  await page.waitForTimeout(2000);

  const ribbon = page.getByRole('banner', { name: 'Promotional offer' });
  await expect(ribbon).toBeVisible({ timeout: 10000 });

  await page.getByTestId('button-logout').click();
});

// ---------------------------------------------------------------------------
// J-05 — Ribbon is absent for a PREMIUM-tier user
// ---------------------------------------------------------------------------
test('J-05 promotion ribbon absent for PREMIUM-tier user', async ({ page }) => {
  // Use a known premium user from existing fixtures
  await loginAs(page, 'john.smith@sapphirewellness.com', 'password123');

  // Ribbon must NOT appear — allow a short grace period for Apollo to resolve
  await page.waitForTimeout(5000);
  const ribbon = page.getByRole('banner', { name: 'Promotional offer' });
  await expect(ribbon).toBeHidden();

  await page.getByTestId('button-logout').click();
});
