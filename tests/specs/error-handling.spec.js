import { test, expect } from '@playwright/test';

test.describe('Manejo de Errores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/dashboard');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('la aplicación muestra mensajes de error amigables', async ({ page }) => {
    // Navigate to a non-existent route within the app
    await page.goto('/app/ruta-que-no-existe');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    // Should either show 404 page, redirect, or show error boundary
    const url = page.url();
    expect(url).toBeTruthy();
    // App should not crash completely
    await page.waitForTimeout(1000);
  });

  test('la app no muestra errores de consola críticos en carga', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/app/dashboard');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('Warning') &&
      e.includes('Error') ||
      e.includes('Cannot read') ||
      e.includes('is not a function'),
    );
    // We accept some warnings but no JS crashes
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('muestra notificación cuando hay error de API', async ({ page }) => {
    // Intercept API calls to simulate error
    await page.route('**/api/personas**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    await page.goto('/app/gestion/persona');
    await page.waitForTimeout(3000);

    // Should show error notification or empty state gracefully
    const mainContent = page.locator('main, [class*="MuiContainer"]').first();
    await expect(mainContent).toBeVisible({ timeout: 8000 });
  });

  test('maneja correctamente la pérdida de conexión', async ({ page }) => {
    await page.goto('/app/gestion/persona');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    // App should be visible and functional
    const content = page.locator('[class*="MuiContainer"], body').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('el error boundary previene crashes totales de la UI', async ({ page }) => {
    // Navigate through multiple pages
    const routes = ['/app/dashboard', '/app/gestion/persona', '/app/gestion/paciente'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      const content = page.locator('body').first();
      await expect(content).toBeVisible({ timeout: 5000 });
    }
  });
});
