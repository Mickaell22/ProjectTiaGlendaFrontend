import { BasePage } from './BasePage.js';

export class ConfiguracionPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/configuracion');
    await this.waitForPageReady();
  }

  async expectConfigContent() {
    const content = this.page.locator('main, [class*="MuiContainer"]').first();
    await content.waitFor({ state: 'visible', timeout: 8000 });
  }

  async openThemeCustomizer() {
    // Theme customizer button - usually a floating settings icon
    const customizerBtn = this.page.getByRole('button', { name: /theme|tema|settings|configuraci[oó]n/i })
      .or(this.page.locator('[class*="Customizer"], [class*="customizer"]').getByRole('button'))
      .first();
    if (await customizerBtn.isVisible({ timeout: 3000 })) {
      await customizerBtn.click();
    }
  }

  async toggleDarkMode() {
    const darkModeToggle = this.page.getByRole('checkbox', { name: /dark|oscuro/i })
      .or(this.page.locator('[class*="darkMode"], [class*="dark-mode"]'))
      .first();
    await darkModeToggle.click();
  }
}
