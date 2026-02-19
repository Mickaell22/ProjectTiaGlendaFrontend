import { test, expect } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage.js';

test.describe('Navegación', () => {
  let navPage;

  test.beforeEach(async ({ page }) => {
    navPage = new NavigationPage(page);
    await page.goto('/app/dashboard');
    await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  });

  test('la barra lateral está visible', async ({ page }) => {
    const sidebar = await navPage.getSidebar();
    await expect(sidebar).toBeVisible({ timeout: 8000 });
  });

  test('el encabezado está visible', async ({ page }) => {
    const header = await navPage.getHeader();
    await expect(header).toBeVisible({ timeout: 8000 });
  });

  test('puede navegar a personas', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/persona');
    await expect(page).toHaveURL(/\/app\/gestion\/persona/, { timeout: 10000 });
  });

  test('puede navegar a pacientes', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/paciente');
    await expect(page).toHaveURL(/\/app\/gestion\/paciente/, { timeout: 10000 });
  });

  test('puede navegar a usuarios', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/usuario');
    await expect(page).toHaveURL(/\/app\/gestion\/usuario/, { timeout: 10000 });
  });

  test('puede navegar a tutores', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/tutor');
    await expect(page).toHaveURL(/\/app\/gestion\/tutor/, { timeout: 10000 });
  });

  test('puede navegar a especialidades', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/especialidad');
    await expect(page).toHaveURL(/\/app\/gestion\/especialidad/, { timeout: 10000 });
  });

  test('puede navegar a personal', async ({ page }) => {
    await navPage.navigateTo('/app/gestion/personal');
    await expect(page).toHaveURL(/\/app\/gestion\/personal/, { timeout: 10000 });
  });

  test('puede navegar al área terapéutica', async ({ page }) => {
    await navPage.navigateTo('/app/terapeutico');
    await expect(page).toHaveURL(/\/app\/terapeutico/, { timeout: 10000 });
  });

  test('puede navegar al área pedagógica', async ({ page }) => {
    await navPage.navigateTo('/app/pedagogico');
    await expect(page).toHaveURL(/\/app\/pedagogico/, { timeout: 10000 });
  });

  test('puede navegar a reportes', async ({ page }) => {
    await navPage.navigateTo('/app/reportes');
    await expect(page).toHaveURL(/\/app\/reportes/, { timeout: 10000 });
  });

  test('puede navegar a mi perfil', async ({ page }) => {
    await navPage.navigateTo('/app/mi-perfil');
    await expect(page).toHaveURL(/\/app\/mi-perfil/, { timeout: 10000 });
  });

  test('el sidebar tiene items de navegación', async ({ page }) => {
    const sidebar = await navPage.getSidebar();
    const links = sidebar.getByRole('link').or(sidebar.locator('a'));
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
