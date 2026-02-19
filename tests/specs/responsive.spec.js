import { test, expect } from '@playwright/test';

// Runs in 'public' project - tests responsive behavior
test.describe('Diseño Responsivo', () => {
  test('la página de login es responsiva en móvil', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Form should still be visible on mobile
    await expect(page.locator('#usuario')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#contrasenia')).toBeVisible();
    await context.close();
  });

  test('la página de login es responsiva en tablet', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await expect(page.locator('#usuario')).toBeVisible({ timeout: 8000 });
    await context.close();
  });

  test('no hay desbordamiento horizontal en login', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 20); // 20px tolerance
    await context.close();
  });

  test('el botón de login es accesible en móvil', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const submitBtn = page.getByRole('button', { name: /iniciar sesi[oó]n/i });
    await expect(submitBtn).toBeVisible({ timeout: 8000 });
    // Button should have reasonable touch target size
    const box = await submitBtn.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36); // Minimum touch target
    }
    await context.close();
  });

  test('la aplicación maneja diferentes tamaños de pantalla', async ({ browser }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
    ];

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await expect(page.locator('#usuario')).toBeVisible({ timeout: 8000 });
      await context.close();
    }
  });
});
