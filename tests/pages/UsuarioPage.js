import { BasePage } from './BasePage.js';

export class UsuarioPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/usuario');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async selectPersona(searchText, optionText) {
    await this.fillAutocomplete('Persona', searchText, optionText || searchText);
  }

  async fillNombreUsuario(value) {
    await this.fillByName('nombre_usuario', value);
  }

  async fillContrasenia(value) {
    await this.fillByName('contrasenia', value);
  }

  async selectRol(rolText) {
    await this.selectMuiOption('Rol', rolText);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar usuario|actualizar usuario/i }).click();
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

  async clickReactivar(row) {
    await this.clickRowAction(row, 'Reactivar');
  }
}
