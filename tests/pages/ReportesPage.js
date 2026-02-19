import { BasePage } from './BasePage.js';

export class ReportesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/reportes');
    await this.waitForPageReady();
  }

  async selectDateRange(fromDate, toDate) {
    // fromDate / toDate: 'MM/DD/YYYY'
    try {
      await this.fillDatePicker('Desde', fromDate);
      await this.fillDatePicker('Hasta', toDate);
    } catch {
      // Try alternate date inputs
      const dateInputs = this.page.locator('input[type="date"]');
      if (await dateInputs.count() >= 2) {
        await dateInputs.nth(0).fill(fromDate);
        await dateInputs.nth(1).fill(toDate);
      }
    }
  }

  async clickGenerateReport() {
    await this.page.getByRole('button', { name: /generar|buscar|consultar/i }).first().click();
    await this.waitForLoadingToDisappear();
  }

  async expectReportContent() {
    // Report content should appear after generation
    const content = this.page.locator('table, [class*="chart"], [class*="Chart"], canvas').first();
    await content.waitFor({ state: 'visible', timeout: 15000 });
  }

  async clickExportPDF() {
    await this.page.getByRole('button', { name: /pdf|exportar/i }).first().click();
  }
}
