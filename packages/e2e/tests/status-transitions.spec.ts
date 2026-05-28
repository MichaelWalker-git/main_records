import { test, expect } from '../fixtures/auth';

/**
 * Status dropdown on RecordDetailPage must only render targets allowed by
 * the backend state machine (VALID_TRANSITIONS in api/records.ts). Picking
 * a forbidden target previously surfaced a "Invalid status transition"
 * error toast — the dropdown is now constrained at the source.
 */
test.describe('Status transition dropdown', () => {
  test('only renders allowed targets for the current status', async ({ adminPage: page }) => {
    await page.goto('/records');
    const firstLink = page.locator('[data-testid^="record-link-"]').first();
    const count = await firstLink.count();
    if (count === 0) test.skip(true, 'No records available');

    await firstLink.click();
    await expect(page.getByTestId('record-detail-page')).toBeVisible();

    const select = page.getByTestId('status-select');
    if (!(await select.isVisible().catch(() => false))) {
      test.skip(true, 'Record is in a terminal state — no select rendered');
    }

    const options = await select.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(0);

    // Whatever the current status is, "Disposed", "Destroyed", and
    // "Transferred" are terminal — they should NEVER appear as outgoing
    // targets unless the record is already pending_disposition (disposed/
    // destroyed) or active (transferred).
    const currentBadge = page.locator('[data-testid^="status-badge-"]');
    const badgeId = await currentBadge.first().getAttribute('data-testid').catch(() => '');
    const current = (badgeId ?? '').replace('status-badge-', '');

    const has = (label: string) => options.some((o) => o.toLowerCase().includes(label.toLowerCase()));

    if (current !== 'pending_disposition') {
      // Disposed/Destroyed must not be reachable from a non-pending state.
      expect(has('Disposed'), `Disposed leaked from ${current}`).toBe(false);
      expect(has('Destroyed'), `Destroyed leaked from ${current}`).toBe(false);
    }
    if (current !== 'active') {
      expect(has('Transferred'), `Transferred leaked from ${current}`).toBe(false);
    }
  });
});
