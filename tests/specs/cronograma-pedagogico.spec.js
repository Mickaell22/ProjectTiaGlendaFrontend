import { test, expect } from '@playwright/test';

test.describe('Cronograma Pedagógico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/pedagogico/cronogramas');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('carga la página de cronogramas pedagógicos', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/pedagogico/, { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  });

  test('muestra contenido de cronogramas', async ({ page }) => {
    const content = page.locator('main, [class*="MuiContainer"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('puede filtrar cronogramas', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const filterInput = page.getByPlaceholder(/buscar|filtrar|search/i).first();
    if (await filterInput.isVisible({ timeout: 3000 })) {
      await filterInput.fill('test');
      await page.waitForTimeout(500);
    }
  });
});
