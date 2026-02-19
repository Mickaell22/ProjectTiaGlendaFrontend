import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const credentials = {
  admin: {
    username: process.env.TEST_ADMIN_USER || 'admin.norte',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    storageFile: path.join(__dirname, '.auth/admin.json'),
  },
  terapeuta: {
    username: process.env.TEST_TERAPEUTA_USER || 'terapeuta.ana',
    password: process.env.TEST_TERAPEUTA_PASSWORD || 'admin123',
    storageFile: path.join(__dirname, '.auth/terapeuta.json'),
  },
  pedagogo: {
    username: process.env.TEST_PEDAGOGO_USER || 'pedagogo.sandra',
    password: process.env.TEST_PEDAGOGO_PASSWORD || 'admin123',
    storageFile: path.join(__dirname, '.auth/pedagogo.json'),
  },
};

async function loginAs(page, username, password) {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  await page.locator('#usuario').fill(username);
  await page.locator('#contrasenia').fill(password);
  await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();

  // Handle SelectorCentro dialog if it appears (multiple centers)
  const dialog = page.getByRole('dialog');
  try {
    await dialog.waitFor({ state: 'visible', timeout: 6000 });
    // Click first centro card
    const cards = dialog.locator('[class*="MuiCard"], [class*="card"], .MuiPaper-root').filter({ hasNotText: '' });
    const firstCard = cards.first();
    if (await firstCard.isVisible({ timeout: 3000 })) {
      await firstCard.click();
    } else {
      // Fallback: click any button in the dialog
      await dialog.getByRole('button').first().click();
    }
    // Wait for dialog to disappear
    await dialog.waitFor({ state: 'hidden', timeout: 15000 });
  } catch {
    // Dialog didn't appear - single center, auto-selected
  }

  // Wait for navigation to app
  await page.waitForURL(/\/app\//, { timeout: 25000 });

  // Wait briefly for the app to settle
  await page.waitForTimeout(1500);
}

setup('authenticate as admin', async ({ page }) => {
  await loginAs(page, credentials.admin.username, credentials.admin.password);
  await page.context().storageState({ path: credentials.admin.storageFile });
});

setup('authenticate as terapeuta', async ({ page }) => {
  await loginAs(page, credentials.terapeuta.username, credentials.terapeuta.password);
  await page.context().storageState({ path: credentials.terapeuta.storageFile });
});

setup('authenticate as pedagogo', async ({ page }) => {
  await loginAs(page, credentials.pedagogo.username, credentials.pedagogo.password);
  await page.context().storageState({ path: credentials.pedagogo.storageFile });
});
