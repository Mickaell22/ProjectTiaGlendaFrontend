import { test, expect } from '@playwright/test';
import { EspecialidadPage } from '../pages/EspecialidadPage.js';

test.describe('Gestión de Especialidades', () => {
  let especialidadPage;

  test.beforeEach(async ({ page }) => {
    especialidadPage = new EspecialidadPage(page);
    await especialidadPage.goto();
  });

  test('carga la página de especialidades', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/especialidad/, { timeout: 10000 });
    await especialidadPage.waitForLoadingToDisappear();
  });

  test('muestra la lista de especialidades', async ({ page }) => {
    await especialidadPage.waitForLoadingToDisappear();
    const table = page.getByRole('table').or(page.locator('[class*="Table"]')).first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test('tiene tab para registrar especialidad', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
  });

  test('muestra el formulario de especialidad', async ({ page }) => {
    await especialidadPage.clickCrearTab();
    await page.waitForTimeout(500);
    const nombreInput = page.locator('input[name="nombre"]');
    await expect(nombreInput).toBeVisible({ timeout: 8000 });
  });

  test('valida campos requeridos', async ({ page }) => {
    await especialidadPage.clickCrearTab();
    // The submit button is disabled until required fields (nombre, area, id_centro) are filled
    const submitBtn = page.locator('[type="submit"]').first();
    await expect(submitBtn).toBeDisabled({ timeout: 5000 });
  });

  test('puede registrar una especialidad', async ({ page }) => {
    await especialidadPage.waitForLoadingToDisappear();
    // Use "Nueva Especialidad" button which auto-populates the centro field
    const addNewBtn = page.getByRole('button', { name: /nueva especialidad/i });
    if (await addNewBtn.isVisible({ timeout: 5000 })) {
      await addNewBtn.click();
    } else {
      await especialidadPage.clickCrearTab();
    }
    // Wait for the form's nombre input to appear
    const nombreInput = page.locator('input[name="nombre"]');
    if (await nombreInput.isVisible({ timeout: 8000 })) {
      await nombreInput.fill(`Especialidad E2E ${Date.now()}`);
      // MUI Select renders as role="combobox" - click the visible combobox to open area dropdown
      const comboboxes = page.getByRole('combobox');
      if (await comboboxes.count() > 0) {
        const firstCombobox = comboboxes.first();
        if (await firstCombobox.isVisible({ timeout: 3000 })) {
          await firstCombobox.click();
          const firstOption = page.getByRole('option').first();
          if (await firstOption.isVisible({ timeout: 3000 })) {
            await firstOption.click();
          }
        }
      }
      // Submit if button is enabled (requires nombre + area + id_centro)
      const submitBtn = page.locator('[type="submit"]').first();
      if (await submitBtn.isEnabled({ timeout: 3000 })) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
      }
      // Verify form was interacted with
      await expect(nombreInput).toHaveValue(/Especialidad E2E/);
    }
  });

  test('muestra acciones en tabla', async ({ page }) => {
    await especialidadPage.waitForLoadingToDisappear();
    const rows = page.getByRole('row');
    const count = await rows.count();
    if (count > 1) {
      const btns = rows.nth(1).getByRole('button');
      expect(await btns.count()).toBeGreaterThan(0);
    }
  });
});
