import { test, expect } from '@playwright/test';
import { CentroPage } from '../pages/CentroPage.js';

test.describe('Gestión de Centros', () => {
  let centroPage;

  test.beforeEach(async ({ page }) => {
    centroPage = new CentroPage(page);
    await centroPage.goto();
  });

  test('carga la página de centros', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/centro/, { timeout: 10000 });
    await centroPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de centros', async ({ page }) => {
    await centroPage.waitForLoadingToDisappear();
    const content = page.getByRole('table').or(page.locator('[class*="Table"], [class*="MuiCard"]')).first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('tiene opción para crear un centro', async ({ page }) => {
    const createOption = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createOption).toBeVisible({ timeout: 8000 });
  });

  test('muestra el formulario de centro', async ({ page }) => {
    await centroPage.clickCrearTab();
    await page.waitForTimeout(500);
    const content = page.locator('[class*="MuiCard"], form').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await centroPage.clickCrearTab();
    // The submit button is disabled until required fields (nombre, codigo) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('muestra acciones en tabla', async ({ page }) => {
    await centroPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const btns = rows.nth(1).getByRole('button');
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });
});
