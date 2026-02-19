import { BasePage } from './BasePage.js';

export class TutorPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/tutor');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async selectPersona(searchText, optionText) {
    await this.fillAutocomplete('Persona', searchText, optionText || searchText);
  }

  async fillTrabajo(value) {
    await this.fillByName('trabajo', value);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar tutor|actualizar tutor/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }

  async clickEditar(row) {
    await this.clickRowAction(row, 'Editar');
  }
}
