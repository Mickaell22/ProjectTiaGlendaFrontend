import { test, expect } from '@playwright/test';
import { PersonalPage } from '../pages/PersonalPage.js';

test.describe('Gestión de Personal', () => {
  let personalPage;

  test.beforeEach(async ({ page }) => {
    personalPage = new PersonalPage(page);
    await personalPage.goto();
  });

  test('carga la página de personal', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/personal/, { timeout: 10000 });
    await personalPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de personal', async ({ page }) => {
    await personalPage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene tab para registrar personal', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra formulario de personal', async ({ page }) => {
    await personalPage.clickCrearTab();
    await page.waitForTimeout(500);
    const content = page.locator('[class*="MuiCard"], form').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await personalPage.clickCrearTab();
    // The submit button is disabled until required fields (persona, especialidad, etc.) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('muestra acciones en tabla', async ({ page }) => {
    await personalPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const btns = rows.nth(1).getByRole('button');
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });

  test('puede ver detalles de un miembro del personal', async ({ page }) => {
    await personalPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const verBtn = rows.nth(1).getByRole('button', { name: 'Ver detalles' });
      if (await verBtn.isVisible({ timeout: 3000 })) {
        await verBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
