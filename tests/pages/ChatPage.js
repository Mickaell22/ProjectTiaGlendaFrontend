import { BasePage } from './BasePage.js';

export class ChatPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async openChat() {
    // Chat is typically a floating button in the corner
    const chatButton = this.page.getByRole('button', { name: /chat|mensaje/i })
      .or(this.page.locator('[class*="ChatButton"], [class*="chat-button"], [aria-label*="chat"]'))
      .first();
    await chatButton.click();
    await this.page.waitForTimeout(500);
  }

  async expectChatPanel() {
    const panel = this.page.locator('[class*="ChatContainer"], [class*="chat"]').first();
    await panel.waitFor({ state: 'visible', timeout: 8000 });
    return panel;
  }

  async searchUser(username) {
    const searchInput = this.page.getByPlaceholder(/buscar usuario|search user/i).first();
    await searchInput.fill(username);
    await this.page.waitForTimeout(500);
  }

  async sendMessage(text) {
    const messageInput = this.page.locator('textarea, input[placeholder*="mensaje"]').last();
    await messageInput.fill(text);
    await this.page.keyboard.press('Enter');
  }

  async closeChat() {
    const closeButton = this.page.getByRole('button', { name: /cerrar/i }).first();
    if (await closeButton.isVisible({ timeout: 2000 })) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }
}
