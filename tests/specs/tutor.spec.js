import { test, expect } from '@playwright/test';
import { TutorPage } from '../pages/TutorPage.js';

test.describe('Gestión de Tutores', () => {
  let tutorPage;

  test.beforeEach(async ({ page }) => {
    tutorPage = new TutorPage(page);
    await tutorPage.goto();
  });

  test('carga la página de tutores', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/tutor/, { timeout: 10000 });
    await tutorPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de tutores', async ({ page }) => {
    await tutorPage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene tab para registrar tutor', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra formulario de tutor', async ({ page }) => {
    await tutorPage.clickCrearTab();
    await page.waitForTimeout(500);
    const content = page.locator('[class*="MuiCard"], form').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await tutorPage.clickCrearTab();
    // The submit button is disabled until required fields (persona, etc.) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('muestra acciones en la tabla', async ({ page }) => {
    await tutorPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const btns = rows.nth(1).getByRole('button');
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });
});
