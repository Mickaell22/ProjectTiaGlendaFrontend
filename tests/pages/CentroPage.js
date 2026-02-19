import { BasePage } from './BasePage.js';

export class CentroPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/centro');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async fillNombre(value) {
    await this.fillByName('nombre', value);
  }

  async fillDireccion(value) {
    await this.page.locator('input[name="direccion"], textarea[name="direccion"]').fill(value);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar centro|actualizar centro/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }

  async clickEditar(row) {
    await this.clickRowAction(row, 'Editar');
  }
}
