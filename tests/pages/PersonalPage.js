import { BasePage } from './BasePage.js';

export class PersonalPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/personal');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async selectPersona(searchText, optionText) {
    await this.fillAutocomplete('Persona', searchText, optionText || searchText);
  }

  async selectEspecialidad(optionText) {
    await this.selectMuiOption('Especialidad', optionText);
  }

  async fillFechaIngreso(date) {
    await this.fillNativeDateInput('fecha_ingreso', date);
  }

  async fillTituloProfesional(value) {
    await this.fillByName('titulo_profesional', value);
  }

  async fillCargo(value) {
    await this.fillByName('cargo', value);
  }

  async selectTipoContrato(optionText) {
    await this.selectMuiOption('Tipo de Contrato', optionText);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar personal|actualizar personal/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }

  async clickEditar(row) {
    await this.clickRowAction(row, 'Editar');
  }
}
