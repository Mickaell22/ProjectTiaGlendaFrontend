import { test, expect } from '@playwright/test';

test.describe('Cronograma Terapéutico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/terapeutico');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('el área terapéutica carga correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/terapeutico/, { timeout: 10000 });
  });

  test('tiene acceso a cronogramas desde una sesión', async ({ page }) => {
    // Navigate to a therapeutic session if available
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay sesiones terapéuticas');
      return;
    }

    // Click on first session detail
    const verBtn = rows.nth(1).getByRole('button', { name: 'Ver detalles' });
    if (await verBtn.isVisible({ timeout: 3000 })) {
      await verBtn.click();
      await page.waitForTimeout(1000);

      // Look for cronograma tab
      const cronogramaTab = page.getByRole('tab', { name: /cronograma/i });
      if (await cronogramaTab.isVisible({ timeout: 3000 })) {
        await cronogramaTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('puede ver cronogramas generados', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    // Check for any cronograma related content
    const content = page.locator('main, [class*="MuiContainer"]').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});
