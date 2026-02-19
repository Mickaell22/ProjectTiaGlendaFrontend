import { BasePage } from './BasePage.js';

export class SesionPedagogicaPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/pedagogico');
    await this.waitForPageReady();
  }

  async gotoSesiones() {
    await this.page.goto('/app/pedagogico/sesiones');
    await this.waitForPageReady();
  }

  async gotoCrear() {
    await this.page.goto('/app/pedagogico/crear-sesion');
    await this.waitForPageReady();
  }

  async gotoCronogramas() {
    await this.page.goto('/app/pedagogico/cronogramas');
    await this.waitForPageReady();
  }

  async gotoAsistencia() {
    await this.page.goto('/app/pedagogico/asistencia');
    await this.waitForPageReady();
  }

  async fillTitulo(value) {
    await this.fillByName('titulo', value);
  }

  async selectPedagogo(searchText, optionText) {
    await this.fillAutocomplete('Pedagogo', searchText, optionText || searchText);
  }

  async fillFechaInicio(date) {
    await this.fillNativeDateInput('fecha_inicio', date);
  }

  async fillFechaFin(date) {
    await this.fillNativeDateInput('fecha_fin', date);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /crear sesi[oó]n|registrar sesi[oó]n/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }
}
