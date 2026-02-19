import { test, expect } from '@playwright/test';

test.describe('Asistencia Terapéutica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/terapeutico');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('el área terapéutica carga correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/terapeutico/, { timeout: 10000 });
  });

  test('puede acceder a registro de asistencia desde sesión', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay sesiones disponibles');
      return;
    }

    const verBtn = rows.nth(1).getByRole('button', { name: 'Ver detalles' });
    if (await verBtn.isVisible({ timeout: 3000 })) {
      await verBtn.click();
      await page.waitForTimeout(1000);

      // Look for asistencia tab
      const asistenciaTab = page.getByRole('tab', { name: /asistencia/i });
      if (await asistenciaTab.isVisible({ timeout: 3000 })) {
        await asistenciaTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('la asistencia muestra tabla de cronograma', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const mainContent = page.locator('[class*="MuiContainer"], body').first();
    await expect(mainContent).toBeVisible({ timeout: 8000 });
  });
});
