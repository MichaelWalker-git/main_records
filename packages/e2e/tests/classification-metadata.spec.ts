import { test, expect } from '../fixtures/auth';

// digitalmaine.com-style classification metadata flows end-to-end:
// create record -> edit Classification Metadata fieldset -> save ->
// verify each field renders on the detail page -> reload to confirm
// persistence -> edit one field -> confirm update propagates.

const FIELD_VALUES = {
  contributingInstitution: 'Maine State Archives',
  documentTypeDm: 'Text',
  dmIdentifier: '15-28455-F026-I016',
  exactCreationDate: '1917-09-15',
  docLanguage: 'English',
  docLocation: 'Portland, ME',
  keywords: 'Maine, World War I, National Guard',
  recommendedCitation: 'Grant, Giles C., "Letter to a Doctor..." (1917).',
};

const KEYWORDS_LIST = FIELD_VALUES.keywords
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

async function selectFirstAgency(page: any) {
  const select = page.getByTestId('record-agency-select');
  await select.waitFor();
  // First non-placeholder option
  const optionValues = await select.locator('option').evaluateAll((opts: HTMLOptionElement[]) =>
    opts.map((o) => o.value).filter((v) => v.length > 0)
  );
  expect(optionValues.length).toBeGreaterThan(0);
  await select.selectOption(optionValues[0]);
}

async function fillClassificationFieldset(page: any) {
  const fieldset = page.getByTestId('classification-metadata-fieldset');
  await expect(fieldset).toBeVisible();
  await fieldset.scrollIntoViewIfNeeded();

  await page.getByTestId('edit-contributing-institution').fill(FIELD_VALUES.contributingInstitution);
  await page.getByTestId('edit-document-type-dm').selectOption(FIELD_VALUES.documentTypeDm);
  await page.getByTestId('edit-dm-identifier').fill(FIELD_VALUES.dmIdentifier);
  await page.getByTestId('edit-exact-creation-date').fill(FIELD_VALUES.exactCreationDate);
  await page.getByTestId('edit-doc-language').fill(FIELD_VALUES.docLanguage);
  await page.getByTestId('edit-doc-location').fill(FIELD_VALUES.docLocation);
  await page.getByTestId('edit-keywords').fill(FIELD_VALUES.keywords);
  await page.getByTestId('edit-recommended-citation').fill(FIELD_VALUES.recommendedCitation);
}

test.describe('Classification Metadata (digitalmaine.com)', () => {
  test('create -> edit -> save -> reload -> update preserves all eight fields', async ({ adminPage: page }) => {
    // 1. Create a fresh record so we are not modifying seed data.
    // CreateRecordPage opens in 'choose' mode (3 cards: Upload / Template /
    // Manual). Click the Manual card to drop into the manual form.
    await page.goto('/records/new');
    await page.getByTestId('mode-manual').click();
    await expect(page.getByTestId('record-title-input')).toBeVisible();

    const uniqueTitle = `Classification E2E Test ${process.env.PLAYWRIGHT_RUN_ID || 'run'}`;
    await page.getByTestId('record-title-input').fill(uniqueTitle);
    await page.getByTestId('record-description-input').fill('Created by classification-metadata.spec');
    await page.getByTestId('record-series-select').selectOption({ index: 1 });
    await selectFirstAgency(page);
    await page.getByTestId('submit-record-button').click();

    await expect(page).toHaveURL(/\/records\/[0-9a-f-]{36}$/, { timeout: 15_000 });
    await expect(page.getByTestId('record-detail-page')).toBeVisible();
    const detailUrl = page.url();
    const recordId = detailUrl.split('/').pop()!;

    // 2. Open edit form
    await page.getByTestId('edit-record-button').click();
    await expect(page).toHaveURL(`/records/${recordId}/edit`);
    await expect(page.getByTestId('edit-record-page')).toBeVisible();

    // 3. Fill the Classification Metadata fieldset and save
    await fillClassificationFieldset(page);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page).toHaveURL(`/records/${recordId}`, { timeout: 10_000 });
    await expect(page.getByTestId('classification-metadata-card')).toBeVisible();

    // 4. Assert every field rendered correctly
    await expect(page.getByTestId('dm-contributing-institution')).toHaveText(FIELD_VALUES.contributingInstitution);
    await expect(page.getByTestId('dm-document-type')).toHaveText(FIELD_VALUES.documentTypeDm);
    await expect(page.getByTestId('dm-identifier')).toHaveText(FIELD_VALUES.dmIdentifier);
    await expect(page.getByTestId('dm-exact-creation-date')).toHaveText('Sep 15, 1917');
    await expect(page.getByTestId('dm-language')).toHaveText(FIELD_VALUES.docLanguage);
    await expect(page.getByTestId('dm-location')).toHaveText(FIELD_VALUES.docLocation);

    const chips = page.getByTestId('keyword-chip');
    await expect(chips).toHaveCount(KEYWORDS_LIST.length);
    for (let i = 0; i < KEYWORDS_LIST.length; i += 1) {
      await expect(chips.nth(i)).toHaveText(KEYWORDS_LIST[i]);
    }
    await expect(page.getByTestId('recommended-citation')).toContainText('Grant, Giles C.');

    // 5. Reload and confirm persistence
    await page.reload();
    await expect(page.getByTestId('classification-metadata-card')).toBeVisible();
    await expect(page.getByTestId('dm-identifier')).toHaveText(FIELD_VALUES.dmIdentifier);
    await expect(page.getByTestId('dm-location')).toHaveText(FIELD_VALUES.docLocation);
    await expect(page.getByTestId('keyword-chip')).toHaveCount(KEYWORDS_LIST.length);

    // 6. Edit one field and confirm the update lands
    await page.getByTestId('edit-record-button').click();
    await expect(page.getByTestId('edit-record-page')).toBeVisible();
    const locationInput = page.getByTestId('edit-doc-location');
    await locationInput.fill('Augusta, ME');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page).toHaveURL(`/records/${recordId}`);
    await expect(page.getByTestId('dm-location')).toHaveText('Augusta, ME');
  });

  test('seeded demo records expose digitalmaine.com classification metadata', async ({ adminPage: page }) => {
    await page.goto('/records');
    await expect(page.getByTestId('records-list-page')).toBeVisible();
    const firstLink = page.locator('[data-testid^="record-link-"]').first();
    await firstLink.waitFor();
    await firstLink.click();
    await expect(page.getByTestId('record-detail-page')).toBeVisible();

    const card = page.getByTestId('classification-metadata-card');
    await expect(card).toBeVisible();
    await expect(page.getByTestId('dm-contributing-institution')).toHaveText('Maine State Archives');
    await expect(page.getByTestId('dm-language')).toHaveText('English');
    // Seed produced at least one keyword per record
    const seededChips = page.getByTestId('keyword-chip');
    expect(await seededChips.count()).toBeGreaterThan(0);
  });
});
