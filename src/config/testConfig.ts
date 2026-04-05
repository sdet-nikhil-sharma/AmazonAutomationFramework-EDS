import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized test configuration
 * Loads from environment variables with sensible defaults
 */
export class TestConfig {
  static readonly baseUrl = process.env.BASE_URL || "https://www.amazon.in/";
  static readonly mockEmail =
    process.env.MOCK_EMAIL || "nikhilsharma.sharma48@gmail.com";
  static readonly mockPassword = process.env.MOCK_PASSWORD || "NikAma@98";
  static readonly productSearchTerm =
    process.env.PRODUCT_SEARCH_TERM || "Mobile";
  static readonly parallelWorkers = parseInt(
    process.env.PARALLEL_WORKERS || "4",
    10,
  );
  static readonly isHeadless = process.env.HEADED !== "true";
  static readonly slowMo = parseInt(process.env.SLOW_MO || "0", 10);

  /**
   * Get test timeout settings
   */
  static readonly timeouts = {
    page: 30000, // 30s for page navigation
    element: 10000, // 10s for element visibility
    assertion: 5000, // 5s for assertions
    action: 5000, // 5s for click/input
  };

  /**
   * Amazon selectors (uses role-based and text-based selectors for resilience)
   */
  static readonly selectors = {
    // Search
    searchBox: 'input[aria-label*="Search"]',
    searchInput: "input#twotabsearchtextbox",
    searchButton:
      'input[type="submit"]#nav-search-submit-button, button[aria-label*="search"]',

    // Login
    signInLink: 'a:has-text("Sign in")',
    emailInput: 'input[name="email"]:visible, input#ap_email:visible',
    passwordInput: 'input[type="password"]:not(.aok-hidden):visible',
    rememberMe: "input#ap_checkbox_remember_me",
    signInButton: 'input#signInSubmit, button:has-text("Sign in")',
    continueButton:
      'input[type="submit"], button#continue, button:has-text("Continue")',
    // Products
    productList: 'div[data-component-type="s-search-result"]',
    productPrice: "span.a-price-whole",
    productTitle: "h2 a span",
  };

  /**
   * Get config as object (useful for logging)
   */
  static getConfig() {
    return {
      baseUrl: this.baseUrl,
      parallelWorkers: this.parallelWorkers,
      isHeadless: this.isHeadless,
      slowMo: this.slowMo,
      timeouts: this.timeouts,
    };
  }
}
