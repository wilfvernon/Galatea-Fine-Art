import { test, expect } from '@playwright/test';

const getRuneOpacitySnapshot = async (page) => page.evaluate(() => {
  const abjurationRune = document.querySelector('.school-rune-abj');
  const conjurationRune = document.querySelector('.school-rune-con');

  const safeOpacity = (element) => {
    if (!element) return -1;
    const raw = window.getComputedStyle(element).opacity;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : -1;
  };

  return {
    abjuration: safeOpacity(abjurationRune),
    conjuration: safeOpacity(conjurationRune),
  };
});

test('success transition keeps rune handoff smooth', async ({ page }) => {
  await page.goto('/login');
  await page.waitForSelector('.login-container');

  await page.evaluate(() => {
    const container = document.querySelector('.login-container');
    const abjurationRune = document.querySelector('.school-rune-abj');
    const conjurationRune = document.querySelector('.school-rune-con');

    if (!container || !abjurationRune || !conjurationRune) return;

    abjurationRune.classList.remove('school-rune-active');
    conjurationRune.classList.add('school-rune-active');
    container.classList.add('login-success-transition');
  });

  await page.screenshot({ path: 'test-results/login-success-000ms.png', fullPage: true });
  const t0 = await getRuneOpacitySnapshot(page);

  await page.waitForTimeout(360);
  await page.screenshot({ path: 'test-results/login-success-360ms.png', fullPage: true });
  const t1 = await getRuneOpacitySnapshot(page);

  await page.waitForTimeout(620);
  await page.screenshot({ path: 'test-results/login-success-980ms.png', fullPage: true });
  const t2 = await getRuneOpacitySnapshot(page);

  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/login-success-1880ms.png', fullPage: true });
  const t3 = await getRuneOpacitySnapshot(page);

  expect(t1.abjuration).toBeLessThan(t0.abjuration);
  expect(t1.conjuration).toBeLessThanOrEqual(t0.conjuration + 0.05);

  expect(t2.abjuration).toBeLessThanOrEqual(t1.abjuration + 0.02);
  expect(t3.conjuration).toBeGreaterThan(t1.conjuration);
  expect(t3.abjuration).toBeLessThanOrEqual(t2.abjuration + 0.02);

  expect(t1.abjuration).toBeGreaterThan(0.15);
});
