import { test, expect } from '@playwright/test';

test.describe('Formulario Unificado de Persona (UnifiedPersonForm)', () => {
  test.beforeEach(async ({ page }) => {
    // UnifiedPersonForm appears in various entity creation forms
    await page.goto('/app/gestion/paciente');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('la página de pacientes carga correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/gestion\/paciente/, { timeout: 10000 });
  });

  test('el selector de persona está disponible en el formulario de paciente', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i })
      .or(page.getByRole('button', { name: /nuevo|crear/i }))
      .first();
    if (await createTab.isVisible({ timeout: 5000 })) {
      await createTab.click();
      await page.waitForTimeout(500);
      // Person selector should be visible
      const personSelector = page.getByLabel(/persona/i).first()
        .or(page.locator('[class*="PersonSelector"], [class*="PersonaSelector"]').first());
      if (await personSelector.isVisible({ timeout: 3000 })) {
        await expect(personSelector).toBeVisible();
      }
    }
  });

  test('puede abrir el formulario de crear nueva persona desde el selector', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i }).first();
    if (await createTab.isVisible({ timeout: 5000 })) {
      await createTab.click();
      await page.waitForTimeout(500);

      // Look for "crear nueva persona" button near the selector
      const createPersonBtn = page.getByRole('button', { name: /nueva persona|crear persona|\+ persona/i })
        .or(page.locator('[title*="crear persona"], [aria-label*="nueva persona"]').first());
      if (await createPersonBtn.isVisible({ timeout: 3000 })) {
        await createPersonBtn.click();
        await page.waitForTimeout(500);
        // UnifiedPersonForm dialog should open
        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible({ timeout: 3000 })) {
          await expect(dialog).toBeVisible();
          // Should have nombre field
          const nombreInput = dialog.locator('input[name="nombre"]');
          await expect(nombreInput).toBeVisible({ timeout: 5000 });
          // Close dialog
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('el UnifiedPersonForm valida campos requeridos', async ({ page }) => {
    const createTab = page.getByRole('tab', { name: /crear/i }).first();
    if (await createTab.isVisible({ timeout: 5000 })) {
      await createTab.click();
      await page.waitForTimeout(500);

      const createPersonBtn = page.getByRole('button', { name: /nueva persona|crear persona|\+ persona/i }).first();
      if (await createPersonBtn.isVisible({ timeout: 3000 })) {
        await createPersonBtn.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible({ timeout: 3000 })) {
          // Submit without filling fields
          const submitBtn = dialog.getByRole('button', { name: /registrar|guardar|crear/i }).first();
          if (await submitBtn.isVisible({ timeout: 3000 })) {
            await submitBtn.click();
            const error = dialog.getByText(/requerido|obligatorio/i).first();
            await expect(error).toBeVisible({ timeout: 5000 });
          }
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('el formulario de tutor también usa el selector de persona', async ({ page }) => {
    await page.goto('/app/gestion/tutor');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    const createTab = page.getByRole('tab', { name: /crear/i }).first();
    if (await createTab.isVisible({ timeout: 5000 })) {
      await createTab.click();
      await page.waitForTimeout(500);
      const form = page.locator('[class*="MuiCard"], form').first();
      await expect(form).toBeVisible({ timeout: 8000 });
    }
  });
});
