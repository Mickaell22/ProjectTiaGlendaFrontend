import { BasePage } from './BasePage.js';

export class EspecialidadPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/especialidad');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async fillNombre(value) {
    await this.fillByName('nombre', value);
  }

  async selectArea(optionText) {
    await this.selectMuiOption('Área', optionText);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar especialidad|actualizar especialidad/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }

  async clickEditar(row) {
    await this.clickRowAction(row, 'Editar');
  }

  async clickDesactivar(row) {
    await this.clickRowAction(row, 'Desactivar');
  }
}
