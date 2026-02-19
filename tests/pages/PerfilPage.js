import { BasePage } from './BasePage.js';

export class PerfilPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/mi-perfil');
    await this.waitForPageReady();
  }

  async expectProfileInfo() {
    // Profile page shows MuiCard when loaded, or MuiBox during loading
    const profileContent = this.page.locator('[class*="MuiCard"], [class*="MuiBox"], #root').first();
    await profileContent.waitFor({ state: 'visible', timeout: 15000 });
  }

  async clickChangePassword() {
    await this.page.getByRole('button', { name: /cambiar.*contrase[ñn]a|password/i }).click();
  }

  async fillCurrentPassword(value) {
    await this.page.locator('input[name="contrasenia_actual"], input[name="current_password"]').fill(value);
  }

  async fillNewPassword(value) {
    await this.page.locator('input[name="nueva_contrasenia"], input[name="new_password"]').fill(value);
  }

  async fillConfirmPassword(value) {
    await this.page.locator('input[name="confirmar_contrasenia"], input[name="confirm_password"]').fill(value);
  }

  async submitPasswordChange() {
    await this.page.getByRole('button', { name: /cambiar|actualizar|guardar/i }).click();
  }
}
