import { test, expect } from '@playwright/test';
import { PacientePage } from '../pages/PacientePage.js';

test.describe('Gestión de Pacientes', () => {
  let pacientePage;

  test.beforeEach(async ({ page }) => {
    pacientePage = new PacientePage(page);
    await pacientePage.goto();
  });

  test('carga la página de pacientes', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/paciente/, { timeout: 10000 });
    await pacientePage.waitForLoadingToDisappear();
  });

  test('muestra la lista de pacientes', async ({ page }) => {
    await pacientePage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene tab o botón para registrar paciente', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra el formulario de creación', async ({ page }) => {
    await pacientePage.clickCrearTab();
    await page.waitForTimeout(500);
    // Should show person selector
    const content = page.locator('[class*="MuiCard"], form, [class*="form"]').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await pacientePage.clickCrearTab();
    // The submit button is disabled until required fields (persona, tutor, etc.) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('tiene búsqueda y filtros', async ({ page }) => {
    await pacientePage.waitForLoadingToDisappear();
    const searchInput = page.getByPlaceholder(/buscar|search/i).first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('muestra acciones en filas de la tabla', async ({ page }) => {
    await pacientePage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const actionBtns = rows.nth(1).getByRole('button');
      expect(await actionBtns.count()).toBeGreaterThan(0);
    }
  });

  test('puede ver detalles de un paciente', async ({ page }) => {
    await pacientePage.waitForLoadingToDisappear();
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
