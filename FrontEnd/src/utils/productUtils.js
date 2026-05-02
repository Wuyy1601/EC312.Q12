
/**
 * Calculate the effective stock of a product.
 * If it's a normal product, returns product.stock.
 * If it's a bundle, calculates the maximum possible bundles based on sub-item stocks.
 * @param {Object} product - The product object (must have bundleItems populated with product.stock if bundle)
 * @returns {number} The calculated stock
 */
export const calculateStock = (product) => {
  if (!product) return 0;
  
  if (!product.isBundle) {
    return product.stock || 0;
  }

  if (!product.bundleItems || product.bundleItems.length === 0) {
    return 0;
  }

  // Calculate based on sub-items
  // Note: Backend must populate bundleItems.product with 'stock' field
  const stocks = product.bundleItems.map(item => {
    // If item.product is populated object
    const subProduct = item.product;
    if (!subProduct || typeof subProduct !== 'object') {
       // If not populated, we can't calculate. Fallback to 0 or product.stock?
       // If we assume product.stock is not used for bundles, return 0.
       return 0; // or product.stock if you want a fallback, but user requested calculation
    }
    
    const subStock = subProduct.stock || 0;
    const required = item.quantity || 1;
    
    return Math.floor(subStock / required);
  });

  return stocks.length > 0 ? Math.min(...stocks) : 0;
};

/**
 * Check if a product is in stock (quantity > 0)
 */
export const isInStock = (product) => {
  return calculateStock(product) > 0;
};
