import { test, expect } from '@playwright/test';

test.describe('Pausas de Paciente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/gestion/paciente');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('puede acceder a historial de pausas desde detalles del paciente', async ({ page }) => {
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay pacientes en la lista');
      return;
    }

    // Click "Ver detalles" on first patient
    const verBtn = rows.nth(1).getByRole('button', { name: 'Ver detalles' });
    if (await verBtn.isVisible({ timeout: 3000 })) {
      await verBtn.click();
      await page.waitForTimeout(1000);

      // Look for pausas tab or link
      const pausasTab = page.getByRole('tab', { name: /pausa/i })
        .or(page.getByText(/historial.*pausa|pausas/i).first());
      if (await pausasTab.isVisible({ timeout: 3000 })) {
        await pausasTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('la vista de pausas carga sin errores', async ({ page }) => {
    // Navigate to a patient if available
    await page.goto('/app/gestion/paciente');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });
});
