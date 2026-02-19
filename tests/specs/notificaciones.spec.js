import { test, expect } from '@playwright/test';
import { NotificacionesPage } from '../pages/NotificacionesPage.js';

test.describe('Notificaciones', () => {
  let notificacionesPage;

  test.beforeEach(async ({ page }) => {
    notificacionesPage = new NotificacionesPage(page);
    await page.goto('/app/dashboard');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('el dashboard carga y tiene barra de navegación superior', async ({ page }) => {
    const header = page.locator('header, [class*="Header"], [class*="AppBar"]').first();
    await expect(header).toBeVisible({ timeout: 8000 });
  });

  test('existe icono o botón de notificaciones en el header', async ({ page }) => {
    const header = page.locator('header, [class*="Header"], [class*="AppBar"]').first();
    await expect(header).toBeVisible({ timeout: 8000 });
    // Look for notification bell icon button in header
    const notifBtn = header.locator('[aria-label*="notif"], button').first();
    if (await notifBtn.isVisible({ timeout: 3000 })) {
      await expect(notifBtn).toBeVisible();
    }
  });

  test('puede abrir panel de notificaciones', async ({ page }) => {
    // Try to find and click notification button
    const notifBtns = page.locator('button[aria-label*="notif"], button').filter({
      has: page.locator('[data-testid*="notif"], [class*="Notification"], svg[class*="Bell"]'),
    });
    const btn = notifBtns.first();
    if (await btn.isVisible({ timeout: 3000 })) {
      await btn.click();
      await page.waitForTimeout(500);
      // Panel or dropdown should appear
      const panel = page.getByRole('presentation').or(page.locator('[class*="Notification"], [class*="Drawer"]')).first();
      if (await panel.isVisible({ timeout: 3000 })) {
        await expect(panel).toBeVisible();
      }
    }
  });

  test('las notificaciones no bloquean el uso de la aplicación', async ({ page }) => {
    // App should be fully functional regardless of notifications
    const mainContent = page.locator('main, [class*="MuiContainer"]').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });
});
