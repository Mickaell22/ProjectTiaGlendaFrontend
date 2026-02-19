import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { credentials } from './testData.js';

// Extended test fixture with pre-authenticated pages
export const test = base.extend({
  // Admin-authenticated page (via storageState from setup project)
  adminPage: async ({ page }, use) => {
    await use(page);
  },

  // Login page helper
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Utility to do a fresh login (bypasses storageState)
  freshLogin: async ({ page }, use) => {
    const doLogin = async (role = 'admin') => {
      const creds = credentials[role];
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAndWait(creds.username, creds.password);
      return page;
    };
    await use(doLogin);
  },
});

export { expect } from '@playwright/test';
