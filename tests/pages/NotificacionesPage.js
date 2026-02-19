import { BasePage } from './BasePage.js';

export class NotificacionesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async openNotifications() {
    // Notifications are typically in the header as a bell icon
    const bellButton = this.page.getByRole('button', { name: /notificaci[oó]n/i })
      .or(this.page.locator('[aria-label*="notif"]'))
      .first();
    await bellButton.click();
    await this.page.waitForTimeout(500);
  }

  async expectNotificationPanel() {
    const panel = this.page.getByRole('presentation').or(this.page.locator('[class*="Notification"], [class*="notification"]')).first();
    await panel.waitFor({ state: 'visible', timeout: 8000 });
    return panel;
  }

  async markAllAsRead() {
    const markReadBtn = this.page.getByRole('button', { name: /marcar.*le[ií]d|leer.*todo/i });
    if (await markReadBtn.isVisible({ timeout: 2000 })) {
      await markReadBtn.click();
    }
  }

  async closeNotifications() {
    await this.page.keyboard.press('Escape');
  }
}
