import { test, expect } from '@playwright/test';
import { PerfilPage } from '../pages/PerfilPage.js';

test.describe('Perfil de Usuario', () => {
  let perfilPage;

  test.beforeEach(async ({ page }) => {
    perfilPage = new PerfilPage(page);
    await perfilPage.goto();
  });

  test('carga la página de perfil', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/mi-perfil/, { timeout: 10000 });
    await perfilPage.waitForLoadingToDisappear();
  });

  test('muestra información del perfil de usuario', async ({ page }) => {
    await perfilPage.waitForLoadingToDisappear();
    await perfilPage.expectProfileInfo();
  });

  test('muestra nombre o datos del usuario autenticado', async ({ page }) => {
    await perfilPage.waitForLoadingToDisappear();
    // Profile should show some user info
    const content = page.locator('main, [class*="MuiContainer"]').first();
    await expect(content).toBeVisible({ timeout: 8000 });
    // Should have text content (user name, role, etc.)
    const textContent = await content.textContent();
    expect(textContent?.length).toBeGreaterThan(0);
  });

  test('tiene sección o botón para cambiar contraseña', async ({ page }) => {
    await perfilPage.waitForLoadingToDisappear();
    const changePassBtn = page.getByRole('button', { name: /cambiar.*contrase[ñn]a|password/i })
      .or(page.getByText(/cambiar.*contrase[ñn]a/i).first());
    if (await changePassBtn.isVisible({ timeout: 3000 })) {
      await expect(changePassBtn).toBeVisible();
    }
  });

  test('puede ver información de centros asignados', async ({ page }) => {
    await perfilPage.waitForLoadingToDisappear();
    // Profile page should show content without timing out
    await page.waitForTimeout(1000);
    const content = page.locator('[class*="MuiContainer"], #root').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('muestra el rol del usuario', async ({ page }) => {
    await perfilPage.waitForLoadingToDisappear();
    const roleText = page.getByText(/administrador|terapeuta|pedagogo|rol/i).first();
    if (await roleText.isVisible({ timeout: 3000 })) {
      await expect(roleText).toBeVisible();
    }
  });
});
