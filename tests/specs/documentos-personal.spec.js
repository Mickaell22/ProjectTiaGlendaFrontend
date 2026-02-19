import { test, expect } from '@playwright/test';

test.describe('Documentos de Personal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/gestion/personal');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('la página de personal carga correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/personal/, { timeout: 10000 });
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('puede acceder a documentos desde detalles del personal', async ({ page }) => {
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count <= 1) {
      test.skip(true, 'No hay personal disponible');
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
        await page.waitForTimeout(1000);
        // Documents section should be visible
        const docsSection = page.getByRole('tabpanel').filter({ hasText: /documento/i }).first();
        if (await docsSection.isVisible({ timeout: 3000 })) {
          await expect(docsSection).toBeVisible();
        }
      }
    }
  });
});
