import { BasePage } from './BasePage.js';

export class SesionTerapeuticaPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/app/terapeutico');
    await this.waitForPageReady();
  }

  async gotoCrear() {
    await this.page.goto('/app/terapeutico/crear-sesion');
    await this.waitForPageReady();
  }

  async fillTitulo(value) {
    await this.fillByName('titulo', value);
  }

  async fillObjetivoGeneral(value) {
    await this.fillTextareaByName('objetivo_general', value);
  }

  async selectTerapeuta(searchText, optionText) {
    await this.fillAutocomplete('Terapeuta', searchText, optionText || searchText);
  }

  async selectEspecialidad(optionText) {
    await this.selectMuiOption('Especialidad', optionText);
  }

  async fillFechaInicio(date) {
    await this.fillNativeDateInput('fecha_inicio', date);
  }

  async fillFechaFin(date) {
    await this.fillNativeDateInput('fecha_fin', date);
  }

  async selectDiaSemana(dia) {
    await this.page.getByLabel(dia).check();
  }

  async fillHoraInicio(time) {
    await this.page.locator('input[name="hora_inicio"]').fill(time);
  }

  async fillDuracion(minutes) {
    await this.fillByName('duracion_minutos', String(minutes));
  }

  async selectTipoSesion(tipo) {
    await this.selectMuiOption('Tipo de Sesión', tipo);
  }

  async selectPaciente(searchText, optionText) {
    await this.fillAutocomplete('Paciente', searchText, optionText || searchText);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /crear sesi[oó]n|registrar sesi[oó]n/i }).click();
  }

  async clickVerDetalles(row) {
    await this.clickRowAction(row, 'Ver detalles');
  }
}
