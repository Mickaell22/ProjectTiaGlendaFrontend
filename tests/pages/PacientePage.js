import { BasePage } from './BasePage.js';

export class PacientePage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/paciente');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async selectPersona(searchText, optionText) {
    await this.fillAutocomplete('Persona', searchText, optionText || searchText);
  }

  async selectEspecialidad(searchText, optionText) {
    await this.fillAutocomplete('Especialidades', searchText, optionText || searchText);
  }

  async fillFechaIngreso(date) {
    await this.fillNativeDateInput('fecha_ingreso', date);
  }

  async selectEstadoTratamiento(estado) {
    await this.selectMuiOption('Estado de Tratamiento', estado);
  }

  async fillObservaciones(text) {
    await this.fillTextareaByName('observaciones', text);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar paciente|actualizar paciente/i }).click();
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
