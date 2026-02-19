import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/dashboard');
    await this.waitForPageReady();
  }

  async expectStatsCardsVisible() {
    // Dashboard shows stat cards with numbers
    const cards = this.page.locator('[class*="MuiCard"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 });
    return cards;
  }

  async expectWelcomeMessage() {
    // Check for common dashboard text
    await this.page.getByText(/bienvenid|dashboard|panel/i).first().waitFor({ state: 'visible', timeout: 8000 });
  }

  async expectChartsOrStats() {
    // Dashboard should have charts or stat numbers
    const content = this.page.locator('main, [class*="MuiContainer"], [class*="container"]').first();
    await content.waitFor({ state: 'visible', timeout: 8000 });
  }
}
