// Base Page Object with common MUI helper methods

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  // Navigate to a URL
  async goto(url) {
    await this.page.goto(url);
  }

  // Wait for loading spinners (CircularProgress) to disappear
  async waitForLoadingToDisappear(timeout = 15000) {
    const spinner = this.page.locator('[role="progressbar"]').first();
    try {
      await spinner.waitFor({ state: 'visible', timeout: 3000 });
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      // No spinner appeared, or already gone
    }
  }

  // Fill a MUI Autocomplete field
  async fillAutocomplete(label, searchText, optionText) {
    const input = this.page.getByLabel(label);
    await input.click();
    await input.fill(searchText);
    await this.page.waitForTimeout(500);
    const option = this.page.getByRole('option', { name: optionText });
    await option.waitFor({ state: 'visible', timeout: 8000 });
    await option.click();
  }

  // Fill a native date input by name attribute
  async fillNativeDateInput(name, dateValue) {
    // dateValue format: 'YYYY-MM-DD'
    await this.page.locator(`input[name="${name}"]`).fill(dateValue);
  }

  // Fill a MUI X DatePicker (opens calendar picker)
  async fillDatePicker(label, dateValue) {
    // dateValue format: 'MM/DD/YYYY'
    const input = this.page.getByLabel(label);
    await input.click();
    await input.fill(dateValue);
    await this.page.keyboard.press('Escape');
  }

  // Select option from MUI Select component
  async selectMuiOption(label, optionText) {
    await this.page.getByLabel(label).click();
    await this.page.getByRole('option', { name: optionText }).click();
  }

  // Click action button on a table row using tooltip title
  async clickRowAction(row, tooltipTitle) {
    await row.getByRole('button', { name: tooltipTitle }).click();
  }

  // Confirm a dialog
  async confirmDialog() {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    // Try common confirm button texts
    const confirmBtn = dialog.getByRole('button', { name: /confirmar|aceptar|sí|eliminar|desactivar|reactivar/i });
    await confirmBtn.first().click();
  }

  // Cancel a dialog
  async cancelDialog() {
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    await dialog.getByRole('button', { name: /cancelar|cerrar/i }).first().click();
  }

  // Expect a success snackbar alert
  async expectSuccessSnackbar(text) {
    const alert = this.page.getByRole('alert').filter({ hasText: text });
    await alert.waitFor({ state: 'visible', timeout: 10000 });
  }

  // Expect an error snackbar alert
  async expectErrorSnackbar(text) {
    const alert = this.page.getByRole('alert').filter({ hasText: text });
    await alert.waitFor({ state: 'visible', timeout: 10000 });
  }

  // Wait for a snackbar (success or error) to appear
  async waitForSnackbar(timeout = 10000) {
    await this.page.getByRole('alert').first().waitFor({ state: 'visible', timeout });
  }

  // Get a table row by containing text
  getRowByText(text) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  // Click the first row action button by tooltip
  async clickFirstRowAction(tooltipTitle) {
    const firstRow = this.page.getByRole('row').nth(1); // skip header row
    await firstRow.getByRole('button', { name: tooltipTitle }).click();
  }

  // Check if current URL matches pattern
  async expectUrl(urlPattern) {
    await this.page.waitForURL(urlPattern, { timeout: 15000 });
  }

  // Wait for page to be loaded (no loading indicators)
  async waitForPageReady() {
    await this.waitForLoadingToDisappear();
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  // Click a tab by name
  async clickTab(tabName) {
    await this.page.getByRole('tab', { name: tabName }).click();
    await this.page.waitForTimeout(300);
  }

  // Fill a text input by name attribute
  async fillByName(name, value) {
    await this.page.locator(`input[name="${name}"]`).fill(value);
  }

  // Fill a textarea by name attribute
  async fillTextareaByName(name, value) {
    await this.page.locator(`textarea[name="${name}"]`).fill(value);
  }

  // Click button by text
  async clickButton(text) {
    await this.page.getByRole('button', { name: text }).click();
  }
}
