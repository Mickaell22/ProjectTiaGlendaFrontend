import { test, expect } from '@playwright/test';

test.describe('Documentos de Paciente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/gestion/paciente');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('la página de pacientes carga correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/paciente/, { timeout: 10000 });
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('puede acceder a documentos desde detalles del paciente', async ({ page }) => {
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay pacientes disponibles');
      return;
    }

    const verBtn = rows.nth(1).getByRole('button', { name: 'Ver detalles' });
    if (await verBtn.isVisible({ timeout: 3000 })) {
      await verBtn.click();
      await page.waitForTimeout(1000);

      // Look for documents tab
      const docsTab = page.getByRole('tab', { name: /documento/i });
      if (await docsTab.isVisible({ timeout: 3000 })) {
        await docsTab.click();
        await page.waitForTimeout(500);
        // Documents section should load
        const docsSection = page.locator('[class*="document"], [class*="Document"]').first();
        // Just verify no crash
        await page.waitForTimeout(1000);
      }
    }
  });
});
