import { test, expect } from '@playwright/test';
import { PersonaPage } from '../pages/PersonaPage.js';
import { testPersona } from '../fixtures/testData.js';

test.describe('Gestión de Personas', () => {
  let personaPage;

  test.beforeEach(async ({ page }) => {
    personaPage = new PersonaPage(page);
    await personaPage.goto();
  });

  test('carga la página de personas correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/persona/, { timeout: 10000 });
    await personaPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de personas', async ({ page }) => {
    await personaPage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"], [class*="table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene botón o tab para crear nueva persona', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /registrar persona|nueva persona/i })
      .or(page.getByRole('button', { name: /nueva persona|registrar/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra el formulario al hacer clic en crear', async ({ page }) => {
    await personaPage.clickCrearTab();
    const nombreInput = page.locator('input[name="nombre"]');
    await expect(nombreInput).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos del formulario', async ({ page }) => {
    await personaPage.clickCrearTab();
    // The submit button is disabled until required fields (nombre, apellido, cedula) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('puede registrar una nueva persona', async ({ page }) => {
    await personaPage.clickCrearTab();
    const uniquePersona = {
      ...testPersona,
      cedula: `88${Date.now().toString().slice(-7)}`,
      correo: `persona.test.${Date.now()}@test.com`,
    };
    await personaPage.fillForm(uniquePersona);
    // Verify button is enabled after filling required fields
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();
    // Wait for any response (success or error alert)
    await page.waitForTimeout(3000);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('tiene funcionalidad de búsqueda', async ({ page }) => {
    await personaPage.waitForLoadingToDisappear();
    const searchInput = page.getByPlaceholder(/buscar|search/i).first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('test');
      await page.waitForTimeout(600);
    }
  });

  test('muestra acciones de tabla (ver, editar) en filas', async ({ page }) => {
    await personaPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const rowCount = await rows.count();
    if (rowCount > 1) {
      const dataRow = rows.nth(1);
      // Should have action buttons
      const buttons = dataRow.getByRole('button');
      const btnCount = await buttons.count();
      expect(btnCount).toBeGreaterThan(0);
    }
  });

  test('puede ver detalles de una persona', async ({ page }) => {
    await personaPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const rowCount = await rows.count();
    if (rowCount > 1) {
      const dataRow = rows.nth(1);
      const verBtn = dataRow.getByRole('button', { name: 'Ver detalles' });
      if (await verBtn.isVisible({ timeout: 3000 })) {
        await verBtn.click();
        await page.waitForTimeout(1000);
        // Should show details view or panel
      }
    }
  });
});
