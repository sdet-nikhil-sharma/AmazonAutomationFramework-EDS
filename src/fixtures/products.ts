/**
 * Product test data and fixtures
 */

export interface Product {
  name: string;
  category?: string;
}

export const testProducts = {
  mobile: 'Mobile' as const,
  laptop: 'Laptop' as const,
  tablet: 'Tablet' as const,
  phone: 'Phone' as const,
} as const;

export const productSearchTerms = {
  mobile: 'Mobile',
  smartphone: 'Smartphone',
  android: 'Android Phone',
} as const;

/**
 * Product factory for creating product objects
 */
export class ProductFactory {
  static createProduct(name: string, category?: string): Product {
    return {
      name,
      category,
    };
  }
}
