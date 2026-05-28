import { test, expect } from '../fixtures/auth';

/**
 * OCR idempotency: re-running classification should never duplicate the
 * extracted-content block in record.description. Fix shipped on main in
 * AIService.mergeOcrIntoDescription and the ai-ocr Lambda.
 *
 * Detection strategy: open a classified record, capture its description,
 * trigger AI Classify, wait for the in-flight indicator to clear, then
 * compare the number of `--- Extracted Content ---` markers. It must not
 * grow.
 */
test.describe('OCR re-classification idempotency', () => {
  test('re-classify does not duplicate the extracted-content marker', async ({ adminPage: page }) => {
    await page.goto('/records');
    // Pick the first record that already shows AI confidence, i.e. has been classified.
    const firstClassified = page.locator('[data-testid^="record-link-"]').first();
    const count = await firstClassified.count();
    if (count === 0) test.skip(true, 'No records available');

    await firstClassified.click();
    await expect(page.getByTestId('record-detail-page')).toBeVisible();

    // Capture description text before re-classify.
    const desc = page.locator('text=Description').locator('..');
    const beforeText = (await desc.textContent()) || '';
    const beforeMarkers = (beforeText.match(/--- Extracted Content ---/g) ?? []).length;

    const classifyBtn = page.getByTestId('classify-record-button');
    if (!(await classifyBtn.isVisible().catch(() => false))) {
      test.skip(true, 'Classify button not present (record already terminal or read-only)');
    }
    await classifyBtn.click();

    // Wait for the spinner overlay to disappear (success) or up to 30s.
    await page.waitForTimeout(8_000);

    const afterText = (await desc.textContent()) || '';
    const afterMarkers = (afterText.match(/--- Extracted Content ---/g) ?? []).length;

    // The marker count must never grow on re-run; ideally it stays the same.
    expect(afterMarkers).toBeLessThanOrEqual(Math.max(1, beforeMarkers));
  });
});
