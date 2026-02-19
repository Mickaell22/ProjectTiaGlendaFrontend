import { BasePage } from './BasePage.js';

export class PublicViewsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoLogin() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async goto404() {
    await this.page.goto('/auth/404');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  async gotoUnknownRoute() {
    await this.page.goto('/ruta-inexistente-xyz');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  async expectLoginForm() {
    await this.page.locator('#usuario').waitFor({ state: 'visible', timeout: 8000 });
    await this.page.locator('#contrasenia').waitFor({ state: 'visible', timeout: 5000 });
  }

  async expectLoginTitle() {
    await this.page.getByText(/plataforma|tia glenda|iniciar sesi[oó]n|bienvenid/i).first()
      .waitFor({ state: 'visible', timeout: 8000 });
  }

  async expect404Content() {
    await this.page.getByText(/404|no encontrad|not found/i).first()
      .waitFor({ state: 'visible', timeout: 8000 });
  }

  async expectRedirectToLogin() {
    await this.page.waitForURL(/\/auth\/login/, { timeout: 10000 });
  }
}
