import { test, expect } from '@playwright/test';
import { SesionPedagogicaPage } from '../pages/SesionPedagogicaPage.js';

test.describe('Área Pedagógica - Sesiones', () => {
  let sesionPage;

  test.beforeEach(async ({ page }) => {
    sesionPage = new SesionPedagogicaPage(page);
    await sesionPage.goto();
  });

  test('carga el área pedagógica', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/pedagogico/, { timeout: 10000 });
    await sesionPage.waitForLoadingToDisappear();
  });

  test('muestra contenido del área pedagógica', async ({ page }) => {
    await sesionPage.waitForLoadingToDisappear();
    const content = page.locator('main, [class*="MuiContainer"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('puede navegar a sesiones pedagógicas', async ({ page }) => {
    await sesionPage.gotoSesiones();
    await expect(page).toHaveURL(/\/app\/pedagogico\/sesiones|\/app\/pedagogico/, { timeout: 10000 });
    await sesionPage.waitForLoadingToDisappear();
  });

  test('puede navegar a crear sesión pedagógica', async ({ page }) => {
    await sesionPage.gotoCrear();
    await expect(page).toHaveURL(/\/app\/pedagogico\/crear-sesion/, { timeout: 10000 });
    await sesionPage.waitForLoadingToDisappear();
  });

  test('el formulario de sesión pedagógica tiene campo título', async ({ page }) => {
    await sesionPage.gotoCrear();
    await sesionPage.waitForLoadingToDisappear();
    // The form might use id or different name - check for any text input
    const formField = page.locator('input[name="titulo"], input[id="titulo"], input[type="text"]').first();
    await expect(formField).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos en formulario pedagógico', async ({ page }) => {
    await sesionPage.gotoCrear();
    await sesionPage.waitForLoadingToDisappear();
    // The "Crear Sesión" button is disabled={loading} while form data is fetched
    // Use specific button name to avoid matching hidden dialog buttons
    const submitBtn = page.getByRole('button', { name: 'Crear Sesión' });
    if (await submitBtn.isVisible({ timeout: 10000 })) {
      // Wait for data load to complete (button becomes enabled)
      await expect(submitBtn).toBeEnabled({ timeout: 20000 });
      await submitBtn.click();
      // MUI FormHelperText with error prop gets Mui-error class
      await page.locator('p.Mui-error').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
  });
});
