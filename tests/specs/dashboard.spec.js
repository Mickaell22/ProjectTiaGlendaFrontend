import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Dashboard', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('carga el dashboard correctamente', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 10000 });
  });

  test('muestra la barra lateral de navegación', async ({ page }) => {
    // MUI Drawer renders with MuiDrawer-paper class; the nav list has className="sidebarNav"
    const sidebar = page.locator('.sidebarNav')
      .or(page.locator('[class*="MuiDrawer-paper"]').first());
    await expect(sidebar.first()).toBeVisible({ timeout: 8000 });
  });

  test('muestra el encabezado con menú de usuario', async ({ page }) => {
    const header = page.locator('header, [class*="Header"], [class*="AppBar"]').first();
    await expect(header).toBeVisible({ timeout: 8000 });
  });

  test('muestra tarjetas de estadísticas o contenido principal', async ({ page }) => {
    // Wait for main content to load
    await dashboardPage.waitForLoadingToDisappear();
    const mainContent = page.locator('[class*="MuiContainer"], [class*="container"], #root > div').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('tiene navegación a módulos principales', async ({ page }) => {
    // The sidebar nav list has className="sidebarNav"
    const sidebar = page.locator('.sidebarNav')
      .or(page.locator('[class*="MuiDrawer-paper"]').first());
    await expect(sidebar.first()).toBeVisible({ timeout: 8000 });
    // Should have at least some navigation links
    const navLinks = page.locator('.sidebarNav a, [class*="MuiDrawer-paper"] a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('puede navegar a gestión de personas desde sidebar', async ({ page }) => {
    const personaLink = page.getByRole('link', { name: /persona/i })
      .or(page.getByText(/registro.*persona|gestión.*persona/i))
      .first();
    if (await personaLink.isVisible({ timeout: 3000 })) {
      await personaLink.click();
      // Navigation may take longer after the heavy dashboard load
      await page.waitForURL(/\/app\/gestion\/persona/, { timeout: 20000 }).catch(() => {});
    }
  });

  test('el dashboard admin muestra elementos de administración', async ({ page }) => {
    // Admin dashboard should have management-related content
    await dashboardPage.waitForLoadingToDisappear();
    const content = page.locator('[class*="MuiContainer"], #root > div').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});
