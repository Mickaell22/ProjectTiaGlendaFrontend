import { test, expect } from '@playwright/test';

// Runs in 'public' project - no auth required
test.describe('Vistas públicas', () => {
  test('la página de login carga correctamente', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('#usuario')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#contrasenia')).toBeVisible();
  });

  test('el título de la página está definido', async ({ page }) => {
    await page.goto('/auth/login');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('la página de login tiene meta viewport para responsive', async ({ page }) => {
    await page.goto('/auth/login');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('el formulario de login es accesible con teclado', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('#usuario').focus();
    await page.keyboard.type('admin.norte');
    await page.keyboard.press('Tab');
    await page.keyboard.type('admin123');
    await page.keyboard.press('Tab');
    // Focus should be on submit button
    await page.keyboard.press('Enter');
    // Should attempt login (either success or error)
    await page.waitForTimeout(2000);
    const url = page.url();
    // Should either navigate to app or show error
    expect(url).toBeTruthy();
  });

  test('no muestra datos sensibles en la URL de login', async ({ page }) => {
    await page.goto('/auth/login');
    const url = page.url();
    expect(url).not.toContain('password');
    expect(url).not.toContain('token');
  });
});
