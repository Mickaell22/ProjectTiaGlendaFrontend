import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usuarioInput = page.locator('#usuario');
    this.contraseniaInput = page.locator('#contrasenia');
    this.submitButton = page.getByRole('button', { name: /iniciar sesi[oó]n/i });
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  async fillCredentials(username, password) {
    await this.usuarioInput.fill(username);
    await this.contraseniaInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(username, password) {
    await this.fillCredentials(username, password);
    await this.submit();
  }

  // Handle the SelectorCentro dialog if it appears
  async handleCentroSelector() {
    const dialog = this.page.getByRole('dialog');
    try {
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      // Click the first available center card
      const centroCard = dialog.locator('[class*="Card"], [class*="card"]').first();
      if (await centroCard.isVisible()) {
        await centroCard.click();
      } else {
        // Try clicking any button inside dialog
        await dialog.getByRole('button').first().click();
      }
      // Wait for dialog to close
      await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // No dialog appeared, continue
    }
  }

  // Full login flow: fill credentials, submit, handle centro selector, wait for app
  async loginAndWait(username, password) {
    await this.login(username, password);
    await this.handleCentroSelector();
    await this.page.waitForURL(/\/app\//, { timeout: 20000 });
    await this.waitForLoadingToDisappear();
  }

  async expectErrorMessage(text) {
    await this.page.getByRole('alert').filter({ hasText: text }).waitFor({ state: 'visible', timeout: 8000 });
  }

  async expectValidationError(fieldName, text) {
    // MUI shows helper text below the field
    const helperText = this.page.locator(`[id="${fieldName}-helper-text"], p:has-text("${text}")`);
    await helperText.waitFor({ state: 'visible', timeout: 5000 });
  }
}
