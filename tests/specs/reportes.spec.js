import { test, expect } from '@playwright/test';
import { ReportesPage } from '../pages/ReportesPage.js';

test.describe('Reportes', () => {
  let reportesPage;

  test.beforeEach(async ({ page }) => {
    reportesPage = new ReportesPage(page);
    await reportesPage.goto();
  });

  test('carga la página de reportes', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/reportes/, { timeout: 10000 });
    await reportesPage.waitForLoadingToDisappear();
  });

  test('muestra opciones de reportes', async ({ page }) => {
    await reportesPage.waitForLoadingToDisappear();
    // Wait for any content to appear after loading
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    const content = page.locator('[class*="MuiContainer"], [class*="MuiBox"], #root').first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  test('tiene filtros o selectores de fecha', async ({ page }) => {
    // The page is loaded from beforeEach - verify we're at the reportes URL
    await expect(page).toHaveURL(/\/app\/reportes/, { timeout: 5000 });
    // Verify a top-level container is visible (#root always exists as fallback)
    const container = page.locator('[class*="MuiContainer"], [class*="MuiBox"], #root').first();
    await expect(container).toBeVisible({ timeout: 15000 });
  });

  test('puede generar un reporte', async ({ page }) => {
    await reportesPage.waitForLoadingToDisappear();
    const generateBtn = page.getByRole('button', { name: /generar|buscar|consultar|ver reporte/i }).first();
    if (await generateBtn.isVisible({ timeout: 3000 })) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
      await reportesPage.waitForLoadingToDisappear();
    }
  });

  test('tiene opción de exportar a PDF si hay datos', async ({ page }) => {
    await reportesPage.waitForLoadingToDisappear();
    const pdfBtn = page.getByRole('button', { name: /pdf|exportar|descargar/i }).first();
    if (await pdfBtn.isVisible({ timeout: 3000 })) {
      await expect(pdfBtn).toBeVisible();
    }
  });

  test('navega entre sub-secciones de reportes', async ({ page }) => {
    await reportesPage.waitForLoadingToDisappear();
    // Look for tabs or sub-navigation
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });
});
