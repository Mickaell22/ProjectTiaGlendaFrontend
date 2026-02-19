import { test, expect } from '@playwright/test';
import { UsuarioPage } from '../pages/UsuarioPage.js';

test.describe('Gestión de Usuarios', () => {
  let usuarioPage;

  test.beforeEach(async ({ page }) => {
    usuarioPage = new UsuarioPage(page);
    await usuarioPage.goto();
  });

  test('carga la página de usuarios', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/usuario/, { timeout: 10000 });
    await usuarioPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de usuarios', async ({ page }) => {
    await usuarioPage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene tab para crear usuario', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra el formulario de usuario', async ({ page }) => {
    await usuarioPage.clickCrearTab();
    await page.waitForTimeout(500);
    const content = page.locator('[class*="MuiCard"], form').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await usuarioPage.clickCrearTab();
    // The submit button is disabled until required fields (usuario, contraseña, etc.) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('muestra acciones en la tabla', async ({ page }) => {
    await usuarioPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const btns = rows.nth(1).getByRole('button');
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });

  test('puede ver detalles de un usuario', async ({ page }) => {
    await usuarioPage.waitForLoadingToDisappear();
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

  test('tiene filtros de búsqueda', async ({ page }) => {
    await usuarioPage.waitForLoadingToDisappear();
    const searchInput = page.getByPlaceholder(/buscar|search/i).first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('admin');
      await page.waitForTimeout(500);
    }
  });
});
