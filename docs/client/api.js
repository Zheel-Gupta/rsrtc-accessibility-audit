/**
 * api.js
 * Modular REST API client for the Spare Parts Inventory page.
 * Wraps FakeStoreAPI (https://fakestoreapi.com) with async/await + error handling.
 * Nothing in this file touches the DOM — it only fetches and returns data.
 */

const API_BASE = 'https://fakestoreapi.com';

/**
 * Fetch all products from the API.
 * @returns {Promise<Array>} array of product objects
 * @throws {Error} if the network request fails or the response is not OK
 */
export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) {
    throw new Error(`Failed to load products (status ${response.status})`);
  }
  return response.json();
}

/**
 * Fetch products belonging to a single category.
 * @param {string} category
 * @returns {Promise<Array>}
 */
export async function fetchProductsByCategory(category) {
  const response = await fetch(`${API_BASE}/products/category/${encodeURIComponent(category)}`);
  if (!response.ok) {
    throw new Error(`Failed to load category "${category}" (status ${response.status})`);
  }
  return response.json();
}

/**
 * Fetch the list of available product categories.
 * @returns {Promise<Array<string>>}
 */
export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/products/categories`);
  if (!response.ok) {
    throw new Error(`Failed to load categories (status ${response.status})`);
  }
  return response.json();
}

/**
 * Fetch a single product by its id.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function fetchProductById(id) {
  const response = await fetch(`${API_BASE}/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to load product ${id} (status ${response.status})`);
  }
  return response.json();
}
