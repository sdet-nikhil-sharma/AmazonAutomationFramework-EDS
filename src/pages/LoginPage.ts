import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestConfig } from '../config/testConfig';
import { Logger } from '../utils/logger';

/**
 * LoginPage - Handles Amazon login interactions
 * Uses strategy: Mock credentials (no real Amazon account)
 */
export class LoginPage extends BasePage {
  // Locators
  readonly signInLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signInButton: Locator;
  readonly continueButton: Locator;
  readonly loginForm: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.signInLink = page.locator('a[href*="signin"]').first();
    this.emailInput = page.locator(TestConfig.selectors.emailInput);
this.passwordInput = page.locator(TestConfig.selectors.passwordInput);
this.rememberMeCheckbox = page.locator(TestConfig.selectors.rememberMe);
this.signInButton = page.locator(TestConfig.selectors.signInButton);
this.continueButton = page.locator(TestConfig.selectors.continueButton);
    this.loginForm = page.locator('form[name="signIn"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  /**
   * Navigate to Amazon homepage
   */
  async navigateToAmazon() {
    Logger.info('Navigating to Amazon...');
    await this.goto(TestConfig.baseUrl);
    await this.waitForNavigation();
    Logger.success('Amazon homepage loaded');
  }

  /**
   * Click on Sign In link
   */
  async clickSignInLink() {
    Logger.info('Clicking Sign In link...');
    await this.signInLink.click();
    await this.page.waitForLoadState('load');
    Logger.success('Sign In page loaded');
  }

  /**
   * Enter email address
   */
  async enterEmail(email: string) {
    Logger.info(`Entering email: ${email}`);
    await this.waitForActionable(this.emailInput);
    await this.emailInput.fill(email);
    Logger.success('Email entered');
  }

  /**
   * Enter password
   */
  async enterPassword(password: string) {
    Logger.info('Entering password...');
    await this.waitForActionable(this.passwordInput);
    await this.passwordInput.fill(password);
    Logger.success('Password entered');
  }

  /**
   * Click continue button (first step in Amazon login)
   */
  async clickContinue() {
    Logger.info('Clicking Continue button...');
    try {
      await this.continueButton.click({ timeout: 5000 });
      await this.page.waitForLoadState('load');
      Logger.success('Continue clicked');
    } catch (e) {
      Logger.warn('Continue button not found, attempting sign in directly...');
    }
  }

  /**
   * Click Sign In button
   */
  async clickSignInButton() {
    Logger.info('Clicking Sign In button...');
    await this.signInButton.click();
    await this.page.waitForLoadState('load');
    Logger.success('Sign In button clicked');
  }

  /**
   * Complete login flow with email and password
   */
  async login(email: string, password: string) {
    Logger.section('LOGIN FLOW');
    Logger.info(`Attempting login with email: ${email}`);
    
    await this.enterEmail(email);
    await this.clickContinue();
    await this.enterPassword(password);
    await this.clickSignInButton();
    
    // Wait for login to complete
    await this.page.waitForLoadState('load');
    Logger.success('Login flow completed');
  }

  /**
   * Check if login was successful by verifying account link in header
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Look for "Accounts & Lists" or account name in header
      const accountButton = this.page.locator('#nav-account-text-primary');
      await accountButton.waitFor({ state: 'visible', timeout: 5000 });
      Logger.success('Login successful - Account button visible');
      return true;
    } catch (e) {
      Logger.warn('Login verification failed');
      return false;
    }
  }

  /**
   * Get error message if login fails
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      const message = await this.errorMessage.textContent();
      Logger.error(`Login error: ${message}`);
      return message;
    } catch (e) {
      return null;
    }
  }
}
