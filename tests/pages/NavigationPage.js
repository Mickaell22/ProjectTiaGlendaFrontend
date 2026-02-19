import { BasePage } from './BasePage.js';

export class NavigationPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async getSidebar() {
    return this.page.locator('[class*="Sidebar"], [class*="sidebar"], aside, nav').first();
  }

  async getHeader() {
    return this.page.locator('header, [class*="Header"], [class*="AppBar"]').first();
  }

  async clickSidebarItem(text) {
    const sidebar = await this.getSidebar();
    await sidebar.getByText(text, { exact: false }).click();
    await this.page.waitForTimeout(300);
  }

  async toggleSidebar() {
    // Usually a hamburger menu button in the header
    const menuButton = this.page.getByRole('button', { name: /menu|sidebar|toggle/i }).first();
    await menuButton.click();
  }

  async openUserMenu() {
    // Avatar or user button in header
    const userButton = this.page.getByRole('button', { name: /perfil|usuario|user|account/i })
      .or(this.page.locator('[class*="Avatar"]').getByRole('button'))
      .first();
    await userButton.click();
  }

  async clickLogout() {
    await this.page.getByRole('menuitem', { name: /cerrar sesi[oó]n|logout/i }).click();
  }

  async navigateTo(path) {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  async expectCurrentRoute(path) {
    await this.page.waitForURL(`**${path}**`, { timeout: 10000 });
  }

  async expectBreadcrumb(text) {
    await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 });
  }
}
