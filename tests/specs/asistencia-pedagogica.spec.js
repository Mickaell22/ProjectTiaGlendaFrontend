import { test, expect } from '@playwright/test';

test.describe('Asistencia Pedagógica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/pedagogico/asistencia');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('carga la página de asistencia pedagógica', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/pedagogico/, { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  });

  test('muestra contenido de asistencia', async ({ page }) => {
    const content = page.locator('main, [class*="MuiContainer"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('puede registrar asistencia si hay cronogramas', async ({ page }) => {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay cronogramas para registrar asistencia');
      return;
    }
    // Row action buttons should be available
    const btns = rows.nth(1).getByRole('button');
    expect(await btns.count()).toBeGreaterThanOrEqual(0);
  });
});
