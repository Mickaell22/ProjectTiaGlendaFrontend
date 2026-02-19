import { BasePage } from './BasePage.js';

export class PersonaPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/gestion/persona');
    await this.waitForPageReady();
  }

  async clickCrearTab() {
    await this.clickTab('Crear');
  }

  async fillForm(data) {
    if (data.nombre) await this.fillByName('nombre', data.nombre);
    if (data.apellido) await this.fillByName('apellido', data.apellido);
    if (data.cedula) await this.fillByName('cedula', data.cedula);
    if (data.telefono) await this.fillByName('telefono', data.telefono);
    if (data.correo) await this.page.locator('input[name="correo"]').fill(data.correo);
    if (data.direccion) await this.page.locator('textarea[name="direccion"]').fill(data.direccion);
    if (data.fecha_nacimiento) await this.fillNativeDateInput('fecha_nacimiento', data.fecha_nacimiento);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /registrar persona|actualizar persona/i }).click();
  }

  async searchPersona(searchTerm) {
    const searchInput = this.page.getByPlaceholder(/buscar|search/i).first();
    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500);
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
